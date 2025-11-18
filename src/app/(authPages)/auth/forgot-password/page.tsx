'use client'
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        console.log('Password reset requested for:', email);
        // Add your password reset logic here
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-cyan-50 flex items-center justify-center p-6">
            {/* Background decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <a href='/'>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <img src='/icon/icon.png' className='w-[50px] h-[50px]' alt="Logo" />
                            <span className="text-3xl font-bold text-gray-900">SOUTHWAVE FITNESS GYM</span>
                        </div>
                    </div>
                </a>

                {/* Forgot Password Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-red-400 py-4 px-8">
                        <h2 className="text-2xl font-bold text-white text-center">
                            {isSubmitted ? 'Check Your Email' : 'Forgot Password?'}
                        </h2>
                    </div>

                    <div className="p-8">
                        {!isSubmitted ? (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <p className="text-gray-600">
                                        No worries! Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!email}
                                    className="w-full bg-red-400 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg shadow-red-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    Send Reset Link
                                </button>

                                <a
                                    href="/auth/login"
                                    className="flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-700 font-medium transition"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-green-100 p-4 rounded-full">
                                        <Mail className="w-12 h-12 text-green-600" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Email Sent!
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        We've sent a password reset link to
                                    </p>
                                    <p className="text-red-400 font-semibold mb-4">
                                        {email}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Please check your inbox and follow the instructions to reset your password.
                                    </p>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition"
                                    >
                                        Try Another Email
                                    </button>

                                    <a
                                        href="/auth/login"
                                        className="flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-700 font-medium transition"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </a>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Didn't receive the email? Check your spam folder or{' '}
                                        <button
                                            onClick={handleSubmit}
                                            className="text-red-400 hover:text-red-700 font-medium"
                                        >
                                            resend
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;