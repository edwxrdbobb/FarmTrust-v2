'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/sierra-leone-districts';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  delivery: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    district: string;
    city?: string;
  };
}

interface PaymentSubmission {
  transactionId: string;
  paymentMethod: 'orange_money' | 'afrimoney';
  phoneNumber: string;
}

export default function OrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentSubmission>({
    transactionId: '',
    paymentMethod: 'orange_money',
    phoneNumber: ''
  });

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
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/payments/submit-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: paymentData.transactionId,
          orderId: orderId,
          amount: order?.totalAmount,
          paymentMethod: paymentData.paymentMethod,
          phoneNumber: paymentData.phoneNumber
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit payment');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      pending_payment: { label: 'Payment Pending', variant: 'warning' as const },
      paid: { label: 'Paid', variant: 'success' as const },
      confirmed: { label: 'Confirmed', variant: 'default' as const },
      processing: { label: 'Processing', variant: 'default' as const },
      shipped: { label: 'Shipped', variant: 'default' as const },
      delivered: { label: 'Delivered', variant: 'success' as const },
      completed: { label: 'Completed', variant: 'success' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
      disputed: { label: 'Disputed', variant: 'destructive' as const },
      payment_failed: { label: 'Payment Failed', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your payment transaction has been submitted and is being verified.
                You will receive a notification once the verification is complete.
              </p>
              <Button onClick={() => router.push(`/orders/${orderId}`)}>
                View Order Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.orderNumber}</span>
              {getStatusBadge(order.status)}
            </CardTitle>
            <CardDescription>
              Submit your payment transaction ID to complete the payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.productName} x {item.quantity}</span>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="text-sm space-y-1">
                  <p>{order.delivery.firstName} {order.delivery.lastName}</p>
                  <p>{order.delivery.address}</p>
                  <p>{order.delivery.city || ''} {order.delivery.district}</p>
                  <p>Phone: {order.delivery.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Enter your mobile money transaction ID and payment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(value: 'orange_money' | 'afrimoney') =>
                      setPaymentData(prev => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orange_money">Orange Money</SelectItem>
                      <SelectItem value="afrimoney">Afrimoney</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g., +232 88 123 456"
                    value={paymentData.phoneNumber}
                    onChange={(e) =>
                      setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter the transaction ID from your mobile money payment"
                  value={paymentData.transactionId}
                  onChange={(e) =>
                    setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))
                  }
                  required
                />
                <p className="text-sm text-gray-500">
                  This is the unique ID you received after making the payment via {paymentData.paymentMethod === 'orange_money' ? 'Orange Money' : 'Afrimoney'}
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting || !paymentData.transactionId || !paymentData.phoneNumber}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Payment...
                    </>
                  ) : (
                    'Submit Payment'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Orange Money</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Dial *144# on your Orange phone</li>
                  <li>Select "Send Money"</li>
                  <li>Enter merchant code: <strong>OM_FARMTRUST_001</strong></li>
                  <li>Enter amount: <strong>{formatCurrency(order.totalAmount)}</strong></li>
                  <li>Enter your PIN to confirm</li>
                  <li>Save the transaction ID and enter it above</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Afrimoney</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Dial *123# on your Afriphone</li>
                  <li>Select "Send Money"</li>
                  <li>Enter merchant code: <strong>AF_FARMTRUST_001</strong></li>
                  <li>Enter amount: <strong>{formatCurrency(order.totalAmount)}</strong></li>
                  <li>Enter your PIN to confirm</li>
                  <li>Save the transaction ID and enter it above</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 