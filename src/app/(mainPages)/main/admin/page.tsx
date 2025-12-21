'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

const Admin = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkRole = async () => {
            const user: any = await getAuthUserFunction()
            if (!user || user.role !== 'admin') {
                router.replace('/main')
            } else {
                router.replace('/main/admin/dashboard')
                setLoading(false)
            }
        }
        checkRole()
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-red-100">
                <p className="text-red-500 font-semibold">Checking access...</p>
            </div>
        )
    }

    return (
        <div className=' w-full h-screen flex items-center justify-center text-white text-2xl'>
            ADMIN PAGE
        </div>
    )
}

export default Admin
