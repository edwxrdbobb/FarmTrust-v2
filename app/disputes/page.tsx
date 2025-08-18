'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Dispute {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  type: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  requestedResolution: string;
  requestedAmount?: number;
  evidence: string[];
  respondentResponse?: string;
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  awaiting_response: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  escalated: 'bg-red-100 text-red-800',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  pending: Clock,
  under_review: AlertTriangle,
  awaiting_response: Clock,
  resolved: CheckCircle,
  closed: XCircle,
  escalated: AlertTriangle,
};

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/disputes');
      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }
      const data = await response.json();
      setDisputes(data.data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch = 
      dispute.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || dispute.status === statusFilter;
    const matchesType = !typeFilter || dispute.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDisputeType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Disputes</h1>
        <p className="text-gray-600">Track and manage your dispute cases</p>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Disputes Found</h3>
            <p className="text-gray-600 mb-4">You haven't filed any disputes yet.</p>
            <Button onClick={() => router.push('/orders')}>View Orders</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search disputes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="product_quality">Product Quality</SelectItem>
                  <SelectItem value="delivery_issue">Delivery Issue</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item</SelectItem>
                  <SelectItem value="damaged_item">Damaged Item</SelectItem>
                  <SelectItem value="not_delivered">Not Delivered</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <Card key={dispute._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{dispute.order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDisputeType(dispute.type)} • {dispute.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[dispute.status as keyof typeof STATUS_COLORS]}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(dispute.status)}
                              {dispute.status.replace('_', ' ')}
                            </div>
                          </Badge>
                          <Badge className={PRIORITY_COLORS[dispute.priority as keyof typeof PRIORITY_COLORS]}>
                            {dispute.priority}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {dispute.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>Filed: {formatDate(dispute.createdAt)}</span>
                        {dispute.requestedAmount && (
                          <span>• Requested: Le {dispute.requestedAmount.toLocaleString()}</span>
                        )}
                        {dispute.evidence.length > 0 && (
                          <span>• {dispute.evidence.length} evidence file(s)</span>
                        )}
                      </div>

                      {dispute.resolution && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            <strong>Resolution:</strong> {dispute.resolution}
                          </p>
                          {dispute.resolvedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Resolved: {formatDate(dispute.resolvedAt)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/disputes/${dispute._id}`)}
                      >
                        View Details
                      </Button>
                      {dispute.status === 'awaiting_response' && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/disputes/${dispute._id}/respond`)}
                        >
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDisputes.length === 0 && disputes.length > 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No disputes match your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 