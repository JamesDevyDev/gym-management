'use client'

import { useState, useEffect } from 'react';
import { Dumbbell, Users, UserPlus, TrendingUp, Check, Menu, X } from 'lucide-react';

export default function GymLandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const plans = [
        { name: 'Monthly', price: '800PHP', features: ['30 Days Gym Pass'] },
        { name: '3 Months', price: '1900PHP', popular: true, features: ['90 Days Gym Pass', 'Unlimited Water Refill', 'Own Locker Area'] },
        { name: 'Membership', price: '500PHP', features: ['1 Year membership'] }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src='/icon/icon.png' className=' w-[50px] h-[50px]' />
                            <span className="text-2xl font-bold text-gray-900">SOUTHWAVE FITNESS GYM</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href='/auth/login' className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-red-400/30">
                                Login
                            </a>
                        </div>

                        <button className="md:hidden text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                        <div className="flex flex-col gap-4 px-6 py-4">
                            <a href='/auth/login' className="bg-red-400 hover:bg-red-500 text-center text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-red-400/30">
                                Login
                            </a>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section with Background Image */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80)',
                    }}
                ></div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-red-900/50"></div>

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="text-center max-w-4xl mx-auto flex items-center justify-center flex-col">

                        <img src='/icon/icon2.png' className=' w-[350px] h-[350px]' />

                        <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow-lg">
                            Strength starts with showing up.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-red-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Our Growing Community</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Registered Users */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border-2 border-red-500 relative">
                        <div className="flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-full">
                                    <UserPlus className="w-10 h-10 text-red-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold text-black-400 mb-2">95</div>
                                <div className="text-gray-500 text-lg font-medium">Registered Members</div>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border-2 border-red-500 relative">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-full">
                                    <Users className="w-10 h-10 text-red-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold text-black-400 mb-2">57</div>
                                <div className="text-gray-500 text-lg font-medium">Active Members</div>
                                <p className="text-sm text-gray-500 mt-2">Monthly active members</p>
                            </div>
                        </div>

                        {/* Growth Rate */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border-2 border-red-500 relative">
                        <div className="flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-full">
                                    <TrendingUp className="w-10 h-10 text-red-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold text-black-400 mb-2">1</div>
                                <div className="text-gray-500 text-lg font-medium">Members Registered Today</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">PRICING</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, idx) => (
                            <div key={idx} className={`bg-white rounded-2xl border p-8 transition-all duration-300 hover:transform hover:scale-105 shadow-lg ${plan.popular ? 'border-red-500 ring-2 ring-red-500 relative' : 'border-gray-200'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-500">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-red-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-red-500 to-red-400 rounded-3xl p-12 shadow-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">START YOUR FITNESS JOURNEY</h2>
                        <div className='h-[50px] w-[1px]'></div>
                        <a href='/auth/register' className="bg-white hover:bg-gray-50 text-red-400 px-10 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-xl">
                            Register Now!
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <img src='/icon/icon.png' className=' w-[50px] h-[50px]' />
                        <span className="text-xl font-bold text-gray-900">SOUTHWAVE FITNESS GYM</span>
                    </div>
                    <p>© 2025 SOUTHWAVE FITNESS GYM. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}