"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus, 
  Search, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Star, 
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Leaf,
  HeadphonesIcon,
  Award,
  Zap,
  RefreshCw
} from "lucide-react"

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up for free and join our community of conscious consumers supporting local Sierra Leone farmers.",
      details: [
        "Quick and easy registration process",
        "Email verification for security",
        "Create your personalized profile",
        "Choose your delivery preferences"
      ],
      color: "emerald"
    },
    {
      id: 2,
      icon: Search,
      title: "Browse Fresh Products",
      description: "Explore our marketplace featuring the freshest produce directly from verified local farmers.",
      details: [
        "Browse by category or search specific items",
        "View detailed product information",
        "See farmer profiles and certifications",
        "Check real-time availability and pricing"
      ],
      color: "teal"
    },
    {
      id: 3,
      icon: ShoppingCart,
      title: "Add to Cart & Order",
      description: "Select your favorite products and add them to your cart for a seamless ordering experience.",
      details: [
        "Choose quantities and product variations",
        "View real-time pricing and availability",
        "Add products from multiple farmers",
        "Review order details before checkout"
      ],
      color: "cyan"
    },
    {
      id: 4,
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay safely using our trusted payment system with multiple payment options available.",
      details: [
        "Multiple payment methods accepted",
        "Secure escrow system protects both parties",
        "Payment held until delivery confirmation",
        "Full refund protection guarantee"
      ],
      color: "blue"
    },
    {
      id: 5,
      icon: Truck,
      title: "Fast Delivery",
      description: "Receive your fresh produce delivered directly to your doorstep within hours of harvest.",
      details: [
        "Same-day delivery in major cities",
        "Real-time tracking of your order",
        "Contactless delivery options available",
        "Insulated packaging maintains freshness"
      ],
      color: "indigo"
    },
    {
      id: 6,
      icon: Star,
      title: "Rate & Review",
      description: "Share your experience and help other customers make informed decisions while supporting farmers.",
      details: [
        "Rate product quality and freshness",
        "Review delivery experience",
        "Provide feedback to farmers",
        "Build community trust and transparency"
      ],
      color: "purple"
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "100% Verified Farmers",
      description: "Every farmer is thoroughly vetted to ensure quality and authenticity"
    },
    {
      icon: Clock,
      title: "Fresh Within Hours",
      description: "Products delivered within hours of harvest for maximum freshness"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Direct support to local farmers and their families"
    },
    {
      icon: Leaf,
      title: "Sustainable Practices",
      description: "Promoting eco-friendly and sustainable farming methods"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Customer Support",
      description: "Round-the-clock assistance for any questions or concerns"
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "100% satisfaction guarantee with full refund policy"
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", hover: "hover:bg-emerald-100" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200", hover: "hover:bg-teal-100" },
      cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", hover: "hover:bg-cyan-100" },
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", hover: "hover:bg-blue-100" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", hover: "hover:bg-indigo-100" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", hover: "hover:bg-purple-100" }
    }
    return colorMap[color] || colorMap.emerald
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <Badge className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Simple & Transparent
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              How 
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> FarmTrust </span>
              Works
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Connecting Sierra Leone's finest farmers with conscious consumers through our transparent, 
              secure, and efficient marketplace platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Shopping Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="px-8 py-3 rounded-2xl font-semibold border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                  Join as Customer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              6 Easy Steps
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Your Journey to
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                Fresh, Local Produce
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From registration to delivery, here's how our platform makes fresh, local produce accessible to everyone.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => {
              const colorClasses = getColorClasses(step.color)
              const Icon = step.icon
              const isEven = index % 2 === 0

              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
                >
                  {/* Step Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`relative ${colorClasses.bg} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <Icon className={`w-8 h-8 ${colorClasses.text} relative z-10`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className={`${colorClasses.text} ${colorClasses.border} px-3 py-1 font-semibold`}>
                            Step {step.id}
                          </Badge>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <CheckCircle className={`w-5 h-5 ${colorClasses.text} flex-shrink-0`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Visual */}
                  <div className="flex-1 flex justify-center">
                    <Card className={`${colorClasses.bg} ${colorClasses.border} border-2 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 max-w-md w-full`}>
                      <CardContent className="p-8">
                        <div className="text-center">
                          <div className={`inline-flex items-center justify-center w-20 h-20 ${colorClasses.bg} rounded-3xl mb-6 mx-auto shadow-lg`}>
                            <Icon className={`w-10 h-10 ${colorClasses.text}`} />
                          </div>
                          <div className={`text-6xl font-black ${colorClasses.text} mb-4`}>
                            {step.id}
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {step.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {step.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              The FarmTrust
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                Advantage
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the benefits of choosing FarmTrust for all your fresh produce needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card 
                  key={index}
                  className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group hover:scale-105"
                >
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-800 dark:via-teal-800 dark:to-green-800 text-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
            Join thousands of satisfied customers who are already enjoying fresh, local produce from Sierra Leone's finest farmers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products">
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300">
                Browse Products
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
            
            <Link href="/vendor/register">
              <Button variant="outline" className="rounded-2xl px-12 py-6 text-xl font-bold border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300">
                Become a Vendor
                <Users className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">500+</div>
              <div className="text-emerald-100 font-medium">Verified Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">10K+</div>
              <div className="text-emerald-100 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">24h</div>
              <div className="text-emerald-100 font-medium">Delivery Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">4.9★</div>
              <div className="text-emerald-100 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
