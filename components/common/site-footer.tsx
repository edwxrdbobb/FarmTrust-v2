"use client"

import Link from "next/link"
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-gray-700/50 py-12">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                <p className="text-gray-300 leading-relaxed">
                  Get the latest updates on fresh produce, seasonal deals, and farming news from Sierra Leone's trusted marketplace.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm"
                  />
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates from FarmTrust.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    FarmTrust
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                  Sierra Leone's premier farm-to-table marketplace. We're building a transparent, sustainable food system that benefits farmers, consumers, and our environment.
                </p>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    500+ Verified Farmers
                  </Badge>
                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                    10K+ Happy Customers
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    4.9★ Rating
                  </Badge>
                </div>
                
                {/* Social Media */}
                <div className="flex gap-3">
                  <a href="#" className="bg-white/10 hover:bg-emerald-500 p-3 rounded-xl transition-all duration-300 group">
                    <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-emerald-500 p-3 rounded-xl transition-all duration-300 group">
                    <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-emerald-500 p-3 rounded-xl transition-all duration-300 group">
                    <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Marketplace</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/products" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Browse Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/vendors" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Meet Our Farmers
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="/common/help" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/vendor/onboarding" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Become a Vendor
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support & Legal */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Support & Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/common/help" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/common/contact" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/common/shipping" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Shipping & Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="/common/terms" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/common/privacy" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
                
                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                  <h4 className="text-sm font-semibold mb-4 text-emerald-400">Get in Touch</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-400" />
                      Freetown, Sierra Leone
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-4 w-4 mr-2 text-emerald-400" />
                      info@farmtrust.sl
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Phone className="h-4 w-4 mr-2 text-emerald-400" />
                      +232 76 123456
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 py-6">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} FarmTrust. All rights reserved. Made with ❤️ for Sierra Leone farmers.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>🌱 Carbon Neutral Delivery</span>
                <span>🔒 Secure Payments</span>
                <span>📱 Mobile App Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
