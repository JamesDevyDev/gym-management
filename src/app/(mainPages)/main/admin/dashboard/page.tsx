'use client'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

const Dashboard = () => {

    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkRole = async () => {
            const userData: any = await getAuthUserFunction()

            if (!userData || userData.role !== 'admin') {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">

            Dashboard
        </div>
    )
}

export default Dashboard