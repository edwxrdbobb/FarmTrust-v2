"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Phone, Loader2, CheckCircle, XCircle, Shield, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface MonimePaymentProps {
  orderId: string
  amount: number
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: string) => void
}

type PaymentProvider = 'orange_money' | 'afrimoney' | 'africell_money';

const PAYMENT_PROVIDERS = {
  orange_money: {
    name: 'Orange Money',
    icon: '🟠',
    color: 'bg-orange-500',
    description: 'Pay with Orange Money'
  },
  afrimoney: {
    name: 'Afrimoney',
    icon: '🔴',
    color: 'bg-red-500',
    description: 'Pay with Afrimoney'
  },
  africell_money: {
    name: 'Africell Money',
    icon: '🔵',
    color: 'bg-blue-500',
    description: 'Pay with Africell Money'
  }
};

export function MonimePayment({ 
  orderId, 
  amount, 
  customerInfo, 
  onPaymentSuccess, 
  onPaymentError 
}: MonimePaymentProps) {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('orange_money')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(300) // 5 minutes

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Add Sierra Leone country code if not present
    if (!cleaned.startsWith('232')) {
      return `232${cleaned}`
    }
    return cleaned
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const formatted = formatPhoneNumber(phone)
    // Sierra Leone mobile numbers: +232 followed by 8 digits
    return /^232[0-9]{8}$/.test(formatted)
  }

  const initializePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your mobile money number",
        variant: "destructive"
      })
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Sierra Leone mobile number",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          paymentMethod: selectedProvider,
          phoneNumber: formatPhoneNumber(phoneNumber),
          amount,
          customerInfo
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Payment initialization failed')
      }

      setPaymentData(result.payment)
      
      toast({
        title: "Payment Initiated",
        description: `Check your ${PAYMENT_PROVIDERS[selectedProvider].name} for the payment prompt`,
      })

      // Start polling for payment status
      pollPaymentStatus(result.payment.reference)

    } catch (error) {
      console.error('Payment initialization error:', error)
      setPaymentStatus('failed')
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed'
      onPaymentError(errorMessage)
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const pollPaymentStatus = async (reference: string) => {
    const maxAttempts = 30 // Poll for 5 minutes (10s intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/verify?reference=${reference}`, {
          method: 'GET',
          credentials: 'include'
        })

        const result = await response.json()

        if (response.ok && result.payment) {
          const status = result.payment.status

          switch (status) {
            case 'completed':
              setPaymentStatus('success')
              onPaymentSuccess(result.payment)
              toast({
                title: "Payment Successful!",
                description: "Your payment has been processed successfully",
              })
              return

            case 'failed':
            case 'cancelled':
              setPaymentStatus('failed')
              onPaymentError(`Payment ${status}`)
              toast({
                title: "Payment Failed",
                description: `Your payment was ${status}`,
                variant: "destructive"
              })
              return

            case 'processing':
            case 'pending':
              // Continue polling
              break
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setPaymentStatus('failed')
          onPaymentError('Payment verification timeout')
          toast({
            title: "Payment Timeout",
            description: "Payment verification timed out. Please check your order status.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000)
        }
      }
    }

    poll()
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing your payment... Please check your phone for the payment prompt.'
      case 'success':
        return 'Payment completed successfully!'
      case 'failed':
        return 'Payment failed. Please try again.'
      default:
        return null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Mobile Money Payment
        </CardTitle>
        <CardDescription>
          Pay securely with mobile money through Monime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status Display */}
        {paymentStatus !== 'idle' && (
          <Alert>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <AlertDescription>
                {getStatusMessage()}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Provider Selection */}
        <div className="space-y-3">
          <Label>Select Mobile Money Provider</Label>
          <RadioGroup 
            value={selectedProvider} 
            onValueChange={(value) => setSelectedProvider(value as PaymentProvider)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            disabled={paymentStatus === 'processing'}
          >
            {Object.entries(PAYMENT_PROVIDERS).map(([key, provider]) => (
              <div key={key} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.description}</div>
                    </div>
                    <div className={`w-8 h-5 ${provider.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
                      {provider.icon}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <Label htmlFor="payment_phone">
            {PAYMENT_PROVIDERS[selectedProvider].name} Number
          </Label>
          <div className="flex">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="ml-2 text-sm text-gray-500">+232</span>
            </div>
            <Input 
              id="payment_phone" 
              type="tel" 
              placeholder="76 123456" 
              className="rounded-l-none"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={paymentStatus === 'processing'}
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter your mobile money number without the country code
          </p>
        </div>

        {/* Payment Amount Display */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Amount to Pay:</span>
            <span className="text-lg font-bold">Le {amount.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Order ID: {orderId}
          </div>
        </div>

        {/* Payment Action Button */}
        <Button 
          onClick={initializePayment}
          className="w-full"
          disabled={isProcessing || paymentStatus === 'processing' || paymentStatus === 'success'}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing Payment...
            </>
          ) : paymentStatus === 'processing' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : paymentStatus === 'success' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Payment Completed
            </>
          ) : (
            `Pay Le ${amount.toLocaleString()} with ${PAYMENT_PROVIDERS[selectedProvider].name}`
          )}
        </Button>

        {/* Security and Information Notices */}
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">Secure Payment</p>
              <p>Your payment is processed securely through Monime's payment platform. You will receive a prompt on your phone to authorize the transaction.</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Payment Timeout</p>
              <p>You have 5 minutes to complete your payment. If you don't receive a prompt, please check your phone number and try again.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
