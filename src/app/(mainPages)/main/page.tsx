'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

const Main = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const upTime = async () => {
            try {

                const user: any = await getAuthUserFunction()

                console.log(user)

                // Simulate routing delay
                setTimeout(() => {
                    if (user?.role === 'admin') router.push("/main/admin")
                    else if (user?.role === 'staff') router.push("/main/staff")
                    else if (user?.role === 'member') router.push("/main/member")
                    else setLoading(false)
                }, 2000)
            } catch (error) {
                console.error("Error fetching user:", error)
                setLoading(false)
            }
        }

        upTime()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    {/* Spinner */}
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-800">Loading</h2>
                        <p className="text-gray-500 text-sm">Please wait while we verify your credentials...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-4 shadow-md text-center">
                <div className="mb-4">
                    <svg
                        className="w-14 h-14 mx-auto text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Error</h2>
                <p className="text-gray-500 mb-6">
                    Unable to determine your role or you are not logged in.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium shadow-sm"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Main
