'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

const Member = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const checkRole = async () => {
            const userData: any = await getAuthUserFunction()

            if (!userData || userData.role !== 'member') {
                router.replace('/main')
                return
            }

            setUser(userData)
            setLoading(false)
        }

        checkRole()
    }, [router])

    // Helper to check if membership is expired
    const isMembershipExpired = () => {
        if (!user?.duration) return false
        return new Date(user.duration) < new Date()
    }

    // Helper to calculate days remaining
    const getDaysRemaining = () => {
        if (!user?.duration) return null
        const now = new Date()
        const expiry = new Date(user.duration)
        const diffTime = expiry.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-gray-100">
                <p className="text-gray-500 font-semibold">Checking access...</p>
            </div>
        )
    }

    const daysRemaining = getDaysRemaining()
    const isExpired = isMembershipExpired()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Member Profile</h1>
                </div>

                {/* WARNING IF NOT ACTIVATED */}
                {!user.activated && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                        Your membership is not activated. Please contact the administrator.
                    </div>
                )}

                {/* WARNING IF EXPIRED */}
                {user.activated && isExpired && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                        Your membership has expired. Please renew to continue access.
                    </div>
                )}

                {/* WARNING IF EXPIRING SOON */}
                {user.activated && !isExpired && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm">
                        Your membership expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}!
                    </div>
                )}

                {/* PROFILE INFORMATION CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                    <div className="p-4">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">Account Information</h2>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Username</span>
                                <span className="text-sm text-gray-900 font-medium">{user.username}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Email</span>
                                <span className="text-sm text-gray-900">{user.email}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Role</span>
                                <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Status</span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.activated
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                        }`}
                                >
                                    {user.activated ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Joined</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* MEMBERSHIP DATES */}
                            {user.startTime && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Started</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(user.startTime).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {user.duration && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">Expires</span>
                                    <div className="text-right">
                                        <span className={`text-sm font-medium ${isExpired ? "text-red-600" : "text-gray-900"}`}>
                                            {new Date(user.duration).toLocaleDateString()}
                                        </span>
                                        {!isExpired && daysRemaining !== null && daysRemaining > 0 && (
                                            <div className="text-xs text-gray-500">
                                                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {user.qrCode && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 text-center">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Membership QR Code</h2>
                            <img
                                src={user.qrCode}
                                alt="QR Code"
                                className="w-40 h-40 mx-auto border-2 border-gray-200 p-2 rounded-lg shadow-sm bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-3">
                                Show this QR code for check-in
                            </p>
                        </div>
                    </div>
                )}

                {/* EXPIRED QR MESSAGE */}
                {user.activated && isExpired && user.qrCode && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 text-center">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">QR Code Unavailable</h2>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Your QR code is no longer valid due to expired membership.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Member