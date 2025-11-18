'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

const Member = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkRole = async () => {
            const user: any = await getAuthUserFunction()
            if (!user || user.role !== 'member') {
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
        <div className='w-full h-screen flex items-center justify-center text-gray-900 text-2xl bg-red-500'>
            Member page
        </div>
    )
}

export default Member
