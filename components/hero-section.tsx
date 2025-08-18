"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
    return (
        <>
            <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-emerald-950 dark:to-gray-900">
                {/* Animated background patterns */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-emerald-300/20 to-green-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-200/10 via-teal-200/10 to-green-200/10 rounded-full blur-3xl animate-gradient-x"></div>
                </div>
                
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }} className="dark:hidden"></div>
                    <div className="absolute inset-0 hidden dark:block" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="max-w-2xl animate-fade-in">
                            <Badge className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none px-4 py-2 text-sm font-medium animate-scale-in">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Sierra Leone's #1 Farm-to-Table Marketplace
                            </Badge>
                            
                            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-tight mb-8 bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent animate-slide-up">
                                Fresh Farm Produce
                                <span className="block text-4xl md:text-5xl xl:text-6xl mt-2 text-emerald-600 dark:text-emerald-400">
                                    Delivered Fresh
                                </span>
                            </h1>
                            
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
                                Connect directly with verified farmers across Sierra Leone. Support sustainable agriculture while enjoying the freshest, highest-quality produce delivered straight to your door.
                            </p>
                            
                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mb-10 animate-fade-in" style={{animationDelay: '0.4s'}}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">500+ Verified Farmers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">10,000+ Happy Customers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Fresh Daily Deliveries</span>
                                </div>
                            </div>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.6s'}}>
                                <Link href="/products">
                                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
                                        <TrendingUp className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                        Start Shopping
                                    </Button>
                                </Link>
                                <Link href="/vendor/register">
                                    <Button variant="outline" className="rounded-2xl px-8 py-6 text-lg font-semibold border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                                        <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                        Become a Vendor
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        
                        {/* Right Content - Hero Image */}
                        <div className="relative animate-fade-in" style={{animationDelay: '0.8s'}}>
                            <div className="relative z-10">
                                <img
                                    src="/sierra-leone-farm.png"
                                    alt="Fresh produce from Sierra Leone farms"
                                    className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-700 hover:rotate-1"
                                />
                                
                                {/* Floating elements */}
                                <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl animate-float">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fresh Today</span>
                                    </div>
                                </div>
                                
                                <div className="absolute -bottom-6 -left-6 bg-emerald-500 text-white rounded-2xl p-4 shadow-xl animate-float" style={{animationDelay: '2s'}}>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">4.9</div>
                                        <div className="text-sm opacity-90">Rating</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 dark:from-emerald-800/30 dark:to-teal-800/30 rounded-3xl transform rotate-6 scale-110 -z-10"></div>
                        </div>
                    </div>
                    
                    {/* Bottom scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-gray-600 dark:bg-gray-400 rounded-full mt-2 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}