'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  delivery: {
    firstName: string;
    lastName: string;
    address: string;
    district: string;
    city?: string;
    phone: string;
  };
  createdAt: string;
}

const DISPUTE_TYPES = [
  { value: 'product_quality', label: 'Product Quality Issues' },
  { value: 'delivery_issue', label: 'Delivery Problems' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'damaged_item', label: 'Damaged Item' },
  { value: 'not_delivered', label: 'Item Not Delivered' },
  { value: 'payment_issue', label: 'Payment Issues' },
  { value: 'vendor_misconduct', label: 'Vendor Misconduct' },
  { value: 'buyer_misconduct', label: 'Buyer Misconduct' },
  { value: 'other', label: 'Other' },
];

const DISPUTE_REASONS = {
  product_quality: [
    'Poor quality product',
    'Product not as described',
    'Expired or spoiled items',
    'Incorrect quantity',
  ],
  delivery_issue: [
    'Late delivery',
    'Delivery to wrong address',
    'Damaged during delivery',
    'Delivery person issues',
  ],
  wrong_item: [
    'Different product received',
    'Wrong size or variant',
    'Substituted without notice',
    'Missing items',
  ],
  damaged_item: [
    'Physically damaged',
    'Packaging damaged',
    'Contaminated items',
    'Broken or defective',
  ],
  not_delivered: [
    'Never received',
    'Lost in transit',
    'Returned to sender',
    'Delivery attempted but failed',
  ],
  payment_issue: [
    'Charged incorrectly',
    'Double payment',
    'Payment not processed',
    'Refund not received',
  ],
  vendor_misconduct: [
    'Unprofessional behavior',
    'False advertising',
    'Refusal to cooperate',
    'Harassment',
  ],
  buyer_misconduct: [
    'False claims',
    'Abusive behavior',
    'Refusal to pay',
    'Fraudulent activity',
  ],
  other: [
    'Communication issues',
    'Technical problems',
    'Platform issues',
    'Other concerns',
  ],
};

export default function DisputePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [disputeType, setDisputeType] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [requestedResolution, setRequestedResolution] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number | undefined>();
  const [evidence, setEvidence] = useState<string[]>([]);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const uploadedImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        uploadedImages.push(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    }

    setEvidence(prev => [...prev, ...uploadedImages]);
  };

  const removeImage = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!disputeType || !reason || !description.trim() || !requestedResolution.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          type: disputeType,
          reason,
          description: description.trim(),
          evidence,
          requestedResolution: requestedResolution.trim(),
          requestedAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit dispute');
      }

      toast.success('Dispute submitted successfully! Our team will review it within 24 hours.');
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File a Dispute</h1>
          <p className="text-gray-600">Report an issue with this order</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Order Number</Label>
                <p className="text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Order Status</Label>
                <p className="text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Amount</Label>
                <p className="text-gray-900">Le {order.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Delivery Address</Label>
                <p className="text-gray-900">
                  {order.delivery.firstName} {order.delivery.lastName}<br />
                  {order.delivery.address}<br />
                  {order.delivery.district}{order.delivery.city ? `, ${order.delivery.city}` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispute Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="type">Dispute Type *</Label>
              <Select value={disputeType} onValueChange={setDisputeType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select dispute type" />
                </SelectTrigger>
                <SelectContent>
                  {DISPUTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {disputeType && (
              <div>
                <Label htmlFor="reason">Specific Reason *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select specific reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPUTE_REASONS[disputeType as keyof typeof DISPUTE_REASONS]?.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide a detailed description of the issue..."
                rows={5}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="resolution">Requested Resolution *</Label>
              <Textarea
                id="resolution"
                value={requestedResolution}
                onChange={(e) => setRequestedResolution(e.target.value)}
                placeholder="What would you like us to do to resolve this issue?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount">Requested Refund Amount (Optional)</Label>
              <Input
                id="amount"
                type="number"
                value={requestedAmount || ''}
                onChange={(e) => setRequestedAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Enter amount in SLL"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Upload Evidence (Optional)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="evidence-upload"
                />
                <label
                  htmlFor="evidence-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Evidence
                </label>
              </div>
              
              {evidence.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {evidence.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Information</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Disputes are reviewed within 24 hours</li>
                <li>• You may be contacted for additional information</li>
                <li>• Evidence helps us resolve disputes faster</li>
                <li>• False claims may result in account suspension</li>
              </ul>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/orders/${orderId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !disputeType || !reason || !description.trim() || !requestedResolution.trim()}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 