'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Clock, XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Dispute {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{
      product: {
        name: string;
        images: string[];
      };
      quantity: number;
      unitPrice: number;
    }>;
  };
  complainant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  respondent: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
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
  respondedAt?: string;
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: string;
  escalatedBy?: string;
  escalationReason?: string;
  escalatedAt?: string;
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

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.disputeId as string;

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  const fetchDispute = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dispute');
      }
      const data = await response.json();
      setDispute(data.data);
    } catch (error) {
      console.error('Error fetching dispute:', error);
      toast.error('Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dispute Not Found</h1>
          <p className="text-gray-600 mb-4">The dispute you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/disputes')}>Back to Disputes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/disputes')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Disputes
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Dispute for Order #{dispute.order.orderNumber}
              </h1>
              <p className="text-gray-600">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Details */}
            <Card>
              <CardHeader>
                <CardTitle>Dispute Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{dispute.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requested Resolution</h4>
                  <p className="text-gray-700">{dispute.requestedResolution}</p>
                </div>

                {dispute.requestedAmount && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requested Refund Amount</h4>
                    <p className="text-gray-700">Le {dispute.requestedAmount.toLocaleString()}</p>
                  </div>
                )}

                {dispute.evidence.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Evidence</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {dispute.evidence.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Respondent Response */}
            {dispute.respondentResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Response from {dispute.respondent.firstName} {dispute.respondent.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{dispute.respondentResponse}</p>
                  {dispute.respondedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Responded: {formatDate(dispute.respondedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resolution */}
            {dispute.resolution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{dispute.resolution}</p>
                  {dispute.resolvedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Resolved: {formatDate(dispute.resolvedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Admin Notes */}
            {dispute.adminNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{dispute.adminNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Order Number</h4>
                  <p className="text-gray-700">{dispute.order.orderNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Total Amount</h4>
                  <p className="text-gray-700">Le {dispute.order.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Items</h4>
                  <div className="space-y-2">
                    {dispute.order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <img
                          src={item.product.images[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × Le {item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Dispute Filed</p>
                      <p className="text-xs text-gray-500">{formatDate(dispute.createdAt)}</p>
                    </div>
                  </div>

                  {dispute.respondedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Response Received</p>
                        <p className="text-xs text-gray-500">{formatDate(dispute.respondedAt)}</p>
                      </div>
                    </div>
                  )}

                  {dispute.escalatedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Escalated</p>
                        <p className="text-xs text-gray-500">{formatDate(dispute.escalatedAt)}</p>
                      </div>
                    </div>
                  )}

                  {dispute.resolvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Resolved</p>
                        <p className="text-xs text-gray-500">{formatDate(dispute.resolvedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dispute.status === 'awaiting_response' && (
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/disputes/${disputeId}/respond`)}
                  >
                    Respond to Dispute
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/orders/${dispute.order._id}`)}
                >
                  View Order Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 