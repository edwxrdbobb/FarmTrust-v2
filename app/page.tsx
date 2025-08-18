"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ShieldCheck, TruckIcon, Star, ArrowRight, Zap, Globe, Users, Award, Quote, TrendingUp } from "lucide-react"
import HeroSection from "@/components/hero-section"
// import { FeaturedProducts } from "@/components/common/featured-products"

export default function Home() {
  return (
    <>
    <div className="flex flex-col min-h-screen bg-background">
      {/* hero section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Why Choose FarmTrust?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              The Future of 
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Farm-to-Table
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing how Sierra Leone connects farmers with consumers through transparency, technology, and trust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <div className="group animate-fade-in" style={{animationDelay: '0.1s'}}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm group-hover:scale-105">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 w-16 h-16 flex items-center justify-center rounded-2xl">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-emerald-700 dark:text-emerald-300 text-2xl font-bold mb-4">Verified Farmers</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    Every farmer undergoes rigorous verification to ensure authenticity, quality standards, and sustainable practices.
                  </p>
                  <div className="mt-6 flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature 2 */}
            <div className="group animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm group-hover:scale-105">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-teal-500 to-cyan-500 w-16 h-16 flex items-center justify-center rounded-2xl">
                      <TruckIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-teal-700 dark:text-teal-300 text-2xl font-bold mb-4">Lightning Fast Delivery</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    Farm-fresh produce delivered to your doorstep within hours of harvest. Same-day delivery available in major cities.
                  </p>
                  <div className="mt-6 flex items-center text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Track Orders</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature 3 */}
            <div className="group animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm group-hover:scale-105">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 flex items-center justify-center rounded-2xl">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-green-700 dark:text-green-300 text-2xl font-bold mb-4">Premium Quality Promise</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    100% satisfaction guarantee with full refund policy. Our quality inspectors ensure only the best reaches your table.
                  </p>
                  <div className="mt-6 flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Quality Standards</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Verified Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-teal-600 dark:text-teal-400 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Fresh Deliveries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mb-2">4.9★</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {/* <FeaturedProducts /> */}

      {/* Farmer Spotlight */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950 dark:to-gray-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Our Community Heroes
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Meet Our 
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Farmers
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The passionate farmers behind Sierra Leone's finest produce. Each one committed to sustainable practices and exceptional quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Farmer 1 */}
            <div className="group animate-fade-in" style={{animationDelay: '0.1s'}}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group-hover:scale-105">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="/placeholder.svg?height=400&width=600&query=sierra+leone+farmer+woman"
                    alt="Aminata Kamara"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-emerald-500 text-white border-0">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aminata Kamara</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">Organic Vegetable Specialist • Bo District</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Growing premium organic vegetables for over 15 years. Pioneer in sustainable cassava and sweet potato cultivation.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>15+ years experience</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>100% Organic certified</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 border-emerald-200 text-emerald-700 dark:text-emerald-400">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Farmer 2 */}
            <div className="group animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group-hover:scale-105">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="/placeholder.svg?height=400&width=600&query=sierra+leone+farmer+man"
                    alt="Ibrahim Sesay"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-teal-500 text-white border-0">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ibrahim Sesay</h3>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">Sustainable Rice Farmer • Makeni</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Third-generation rice farmer committed to sustainable methods. Leading innovations in soil health preservation.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                      <span>Family tradition since 1950s</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                      <span>Sustainable farming pioneer</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl group-hover:bg-teal-50 dark:group-hover:bg-teal-950/30 border-teal-200 text-teal-700 dark:text-teal-400">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Farmer 3 */}
            <div className="group animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group-hover:scale-105">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="/placeholder.svg?height=400&width=600&query=sierra+leone+fisherman"
                    alt="Mohamed Conteh"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-cyan-500 text-white border-0">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mohamed Conteh</h3>
                    <p className="text-cyan-600 dark:text-cyan-400 font-medium">Sustainable Fisherman • Freetown</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Dedicated to sustainable fishing practices. Provides the freshest catch to local communities with environmental care.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                      <span>Sustainable fishing methods</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                      <span>Community fishing leader</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/30 border-cyan-200 text-cyan-700 dark:text-cyan-400">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
              <Quote className="w-4 h-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              What Our 
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Real stories from satisfied customers who've experienced the FarmTrust difference.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-800 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-12 h-12 text-emerald-500 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    "The quality of produce from FarmTrust is exceptional. I can taste the difference in every meal, and knowing I'm supporting local farmers makes it even better."
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="/placeholder.svg?height=50&width=50&query=customer+portrait+woman" 
                      alt="Sarah Johnson" 
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Regular Customer • Freetown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial 2 */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-gray-800 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-12 h-12 text-teal-500 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    "Fast delivery, fresh products, and excellent customer service. FarmTrust has transformed how my family eats. We're healthier and happier!"
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="/placeholder.svg?height=50&width=50&query=customer+portrait+man" 
                      alt="David Kamara" 
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">David Kamara</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Family Customer • Bo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial 3 */}
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-800 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    "As a restaurant owner, I need the freshest ingredients. FarmTrust consistently delivers premium quality that my customers love."
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="/placeholder.svg?height=50&width=50&query=chef+portrait+woman" 
                      alt="Chef Mabinty Sesay" 
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Chef Mabinty Sesay</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Restaurant Owner • Makeni</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-800 dark:via-teal-800 dark:to-green-800 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Join the Movement
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
              Ready to Support 
              <span className="block text-yellow-300">
                Local Farmers?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-emerald-50">
              Join thousands of satisfied customers who are already part of the movement to build a sustainable, transparent food system in Sierra Leone.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{animationDelay: '0.2s'}}>
            <Link href="/products">
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group">
                <Globe className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Start Shopping Now
              </Button>
            </Link>
            
            <div className="text-white/80 text-lg font-medium">
              or
            </div>
            
            <Link href="/vendor/register">
              <Button variant="outline" className="rounded-2xl px-12 py-6 text-xl font-bold border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 group">
                <Users className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Become a Vendor
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">100%</div>
              <div className="text-emerald-100 font-medium">Satisfaction Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">24h</div>
              <div className="text-emerald-100 font-medium">Fast Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">500+</div>
              <div className="text-emerald-100 font-medium">Trusted Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 mb-2">4.9★</div>
              <div className="text-emerald-100 font-medium">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
