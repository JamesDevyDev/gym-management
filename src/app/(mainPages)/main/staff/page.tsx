'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

const Staff = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkRole = async () => {
            const user: any = await getAuthUserFunction()
            if (!user || user.role !== 'staff') {
                router.replace('/main')
            } else {
                setLoading(false)
            }
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
        <div className='bg-red-500 w-full h-screen flex items-center justify-center text-white text-2xl'>
            Staff page
        </div>
    )
}

export default Staff
