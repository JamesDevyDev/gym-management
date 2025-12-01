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

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-gray-100">
                <p className="text-gray-500 font-semibold">Checking access...</p>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full border">

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Member Profile
                </h1>

                {/* WARNING IF NOT ACTIVATED */}
                {!user.activated && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm font-medium">
                        Your membership is not activated. Please contact the administrator.
                    </div>
                )}

                <div className="space-y-3 text-gray-700">

                    <p>
                        <span className="font-semibold">Username:</span> {user.username}
                    </p>

                    <p>
                        <span className="font-semibold">Email:</span> {user.email}
                    </p>

                    <p>
                        <span className="font-semibold">Role:</span> {user.role}
                    </p>

                    <p>
                        <span className="font-semibold">Status:</span>{' '}
                        <span
                            className={`px-2 py-1 rounded-full text-sm ${user.activated
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                        >
                            {user.activated ? "Active" : "Inactive"}
                        </span>
                    </p>

                    <p>
                        <span className="font-semibold">Joined:</span>{' '}
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p>

                </div>

                {/* QR CODE — ONLY SHOW IF ACTIVATED */}
                {user.activated && user.qrCode && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">Your Membership QR Code</p>
                        <img
                            src={user.qrCode}
                            alt="QR Code"
                            className="w-40 h-40 mx-auto border p-2 rounded-lg shadow bg-white"
                        />
                    </div>
                )}


            </div>
        </div>
    )
}

export default Member
