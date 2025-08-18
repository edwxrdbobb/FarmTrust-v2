"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Landmark, Phone, Truck, Loader2, MapPin } from "lucide-react"
import { useCartContext } from "@/context/CartContext"
import { toast } from "@/components/ui/use-toast"
import { SIERRA_LEONE_DISTRICTS, getDefaultCityForDistrict, formatCurrency } from "@/lib/sierra-leone-districts"
import { MonimePayment } from "./monime-payment"

export function CheckoutForm() {
  const router = useRouter()
  const { items: cartItems, clearCart } = useCartContext()
  const [activeTab, setActiveTab] = useState("shipping")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    notes: "",
    paymentMethod: "mobile_money",
    paymentPhone: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-fill city for Western Area Urban
      if (field === "district" && value === "Western Area Urban") {
        newData.city = "Freetown"
      }
      
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.district) {
      toast({
        title: "Missing Delivery Information",
        description: "Please fill in all required delivery fields: First Name, Last Name, Phone, Address, and District.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        delivery: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          notes: formData.notes,
        },
        payment: {
          method: formData.paymentMethod,
          phone: formData.paymentPhone,
        },
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const result = await response.json()
      setCreatedOrder(result.order)
      
      // Handle payment based on method
      if (formData.paymentMethod === 'mobile_money') {
        // Show Monime payment component
        setActiveTab("monime_payment")
        toast({
          title: "Order Created!",
          description: "Your order has been created. Please complete the payment.",
        })
      } else if (formData.paymentMethod === 'bank_transfer') {
        toast({
          title: "Bank Transfer Instructions Sent",
          description: "Please check your email for bank transfer details.",
        })
        await clearCart()
        router.push(`/orders/success?orderId=${result.order._id}`)
      } else {
        toast({
          title: "Cash on Delivery Confirmed",
          description: "Please have the exact amount ready for delivery.",
        })
        await clearCart()
        router.push(`/orders/success?orderId=${result.order._id}`)
      }
      
    } catch (error) {
      console.error('Order creation error:', error)
      toast({
        title: "Order Creation Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      // Clear cart after successful payment
      await clearCart()
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been paid and is being processed.",
      })
      
      // Redirect to success page
      router.push(`/orders/success?orderId=${createdOrder._id}`)
    } catch (error) {
      console.error('Post-payment cleanup error:', error)
    }
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    })
    // Keep the user on the payment tab to retry
  }

  const goToPayment = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.district) {
      toast({
        title: "Missing Delivery Information",
        description: "Please fill in all required delivery fields: First Name, Last Name, Phone, Address, and District.",
        variant: "destructive",
      })
      return
    }
    setActiveTab("payment")
  }

  const goToReview = () => {
    if (!formData.paymentPhone && formData.paymentMethod === "mobile_money") {
      toast({
        title: "Missing Payment Information",
        description: "Please enter your mobile money number.",
        variant: "destructive",
      })
      return
    }
    setActiveTab("review")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full mb-6 ${activeTab === 'monime_payment' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="shipping" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <MapPin className="mr-2 h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Landmark className="mr-2 h-4 w-4" />
            Review
          </TabsTrigger>
          {activeTab === 'monime_payment' && (
            <TabsTrigger value="monime_payment" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Phone className="mr-2 h-4 w-4" />
              Pay
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Enter your delivery details for Sierra Leone only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">+232</span>
                  </div>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="76 123456" 
                    className="rounded-l-none" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input 
                  id="address" 
                  placeholder="123 Main Street" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={(value) => handleInputChange('district', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIERRA_LEONE_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/Town (Optional)</Label>
                  <Input 
                    id="city" 
                    placeholder={formData.district === "Western Area Urban" ? "Freetown" : "Enter your city"}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={formData.district === "Western Area Urban"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional information for delivery (landmarks, directions, etc.)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" className="w-full rounded-xl" onClick={goToPayment}>
                Continue to Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you want to pay in Sierra Leonean Leone (SLL)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 border rounded-xl p-4">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                    <div className="font-medium">Mobile Money</div>
                    <div className="text-sm text-gray-500">Pay with Orange Money or Africell Money</div>
                  </Label>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      OM
                    </div>
                    <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      AM
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 border rounded-xl p-4">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Pay directly to our bank account</div>
                  </Label>
                  <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    SL
                  </div>
                </div>

                <div className="flex items-center space-x-2 border rounded-xl p-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </Label>
                  <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    Le
                  </div>
                </div>
              </RadioGroup>

              {formData.paymentMethod === "mobile_money" && (
                <div className="space-y-2">
                  <Label htmlFor="payment_phone">Mobile Money Number</Label>
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
                      value={formData.paymentPhone}
                      onChange={(e) => handleInputChange('paymentPhone', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto rounded-xl"
                onClick={() => setActiveTab("shipping")}
              >
                Back
              </Button>
              <Button type="button" className="w-full sm:flex-1 rounded-xl" onClick={goToReview}>
                Continue to Review
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Order</CardTitle>
              <CardDescription>Please confirm your order details before placing your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Delivery Information</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                  <p className="text-gray-600">{formData.address}</p>
                  <p className="text-gray-600">
                    {formData.city && formData.city !== "Freetown" ? `${formData.city}, ` : ""}
                    {formData.district}
                  </p>
                  <p className="text-gray-600">+232 {formData.phone}</p>
                  {formData.notes && <p className="text-sm text-gray-600 mt-2">Notes: {formData.notes}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Payment Method</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p>{formData.paymentMethod === "mobile_money" ? "Mobile Money" : 
                      formData.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}</p>
                  {formData.paymentMethod === "mobile_money" && formData.paymentPhone && (
                    <p>+232 {formData.paymentPhone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Delivery Method</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p>Standard Delivery (2-3 business days)</p>
                  <p>Delivery Fee: Le 10,000</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto rounded-xl"
                onClick={() => setActiveTab("payment")}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:flex-1 rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Monime Payment Tab */}
        <TabsContent value="monime_payment">
          {createdOrder && (
            <MonimePayment
              orderId={createdOrder._id}
              amount={createdOrder.total || cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
              customerInfo={{
                name: `${formData.firstName} ${formData.lastName}`,
                email: "user@farmtrust.com", // You might want to collect email during checkout
                phone: `+232${formData.phone}`
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </TabsContent>
      </Tabs>
    </form>
  )
}
