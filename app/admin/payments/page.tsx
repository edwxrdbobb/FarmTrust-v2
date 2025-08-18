'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle, AlertCircle, Eye, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/sierra-leone-districts';

interface PaymentTransaction {
  transactionId: string;
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  paymentMethod: 'orange_money' | 'afrimoney';
  merchantCode: string;
  phoneNumber: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  verificationAttempts: number;
  maxVerificationAttempts: number;
  createdAt: Date;
  verifiedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  adminOverride?: boolean;
  adminNotes?: string;
}

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalAmount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [manualVerification, setManualVerification] = useState({
    transactionId: '',
    adminNotes: ''
  });
  const [showManualDialog, setShowManualDialog] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/admin/payments/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch payment stats:', error);
    }
  };

  const handleManualVerification = async () => {
    if (!manualVerification.transactionId) return;

    setVerifying(manualVerification.transactionId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: manualVerification.transactionId,
          adminNotes: manualVerification.adminNotes
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify payment');
      }

      // Refresh payments list
      await fetchPayments();
      await fetchStats();
      
      setShowManualDialog(false);
      setManualVerification({ transactionId: '', adminNotes: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify payment');
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      verified: { label: 'Verified', variant: 'success' as const, icon: CheckCircle },
      failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
      expired: { label: 'Expired', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === 'orange_money' ? 'Orange Money' : 'Afrimoney';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-gray-600">Monitor and manage payment transactions</p>
          </div>
          <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
            <DialogTrigger asChild>
              <Button>
                <CheckCircle className="mr-2 h-4 w-4" />
                Manual Verification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manual Payment Verification</DialogTitle>
                <DialogDescription>
                  Manually verify a payment transaction by entering the transaction ID
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter transaction ID"
                    value={manualVerification.transactionId}
                    onChange={(e) =>
                      setManualVerification(prev => ({ ...prev, transactionId: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add notes about this manual verification"
                    value={manualVerification.adminNotes}
                    onChange={(e) =>
                      setManualVerification(prev => ({ ...prev, adminNotes: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowManualDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualVerification}
                  disabled={!manualVerification.transactionId || verifying === manualVerification.transactionId}
                >
                  {verifying === manualVerification.transactionId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Payment'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{stats.successfulPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              Monitor all payment transactions and their verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payment transactions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.transactionId}>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionId}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{payment.orderId}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        {selectedPayment && (
          <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Detailed information about payment transaction
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Transaction ID</Label>
                    <p className="text-sm font-mono">{selectedPayment.transactionId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order ID</Label>
                    <p className="text-sm">{selectedPayment.orderId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p className="text-sm">{getPaymentMethodLabel(selectedPayment.paymentMethod)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-sm font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-sm">{selectedPayment.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Merchant Code</Label>
                    <p className="text-sm font-mono">{selectedPayment.merchantCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Verification Attempts</Label>
                    <p className="text-sm">
                      {selectedPayment.verificationAttempts} / {selectedPayment.maxVerificationAttempts}
                    </p>
                  </div>
                </div>
                
                {selectedPayment.failureReason && (
                  <div>
                    <Label className="text-sm font-medium">Failure Reason</Label>
                    <p className="text-sm text-red-600">{selectedPayment.failureReason}</p>
                  </div>
                )}

                {selectedPayment.adminOverride && (
                  <div>
                    <Label className="text-sm font-medium">Admin Notes</Label>
                    <p className="text-sm text-gray-600">{selectedPayment.adminNotes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm">
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedPayment.verifiedAt && (
                    <div>
                      <Label className="text-sm font-medium">Verified</Label>
                      <p className="text-sm">
                        {new Date(selectedPayment.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedPayment.failedAt && (
                    <div>
                      <Label className="text-sm font-medium">Failed</Label>
                      <p className="text-sm">
                        {new Date(selectedPayment.failedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
} 