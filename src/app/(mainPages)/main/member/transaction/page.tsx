'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

// Types
interface Transaction {
    id: string
    memberName: string
    membershipType: string
    amount: number
    paymentDate: string
    dueDate: string
    reference: string
    paymentMethod?: string
    staffName?: string
    notes?: string
}

const TransactionPage = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [totalSpent, setTotalSpent] = useState(0)
    const [totalPayments, setTotalPayments] = useState(0)

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

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user) return

            try {
                const response = await fetch('/api/members/get-transactions')
                const data = await response.json()

                if (response.ok) {
                    setTransactions(data.transactions)
                    setTotalSpent(data.totalSpent)
                    setTotalPayments(data.totalPayments)
                } else {
                    console.error('Failed to fetch transactions:', data.error)
                }
            } catch (error) {
                console.error('Error fetching transactions:', error)
            }
        }

        fetchTransactions()
    }, [user])

    const getMembershipColor = (type: string) => {
        if (type.includes('1 month')) return 'text-blue-600 bg-blue-50'
        if (type.includes('3 month')) return 'text-purple-600 bg-purple-50'
        if (type.includes('6 month')) return 'text-orange-600 bg-orange-50'
        if (type.includes('12 month')) return 'text-green-600 bg-green-50'
        return 'text-gray-600 bg-gray-50'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-gray-100">
                <p className="text-gray-500 font-semibold">Checking access...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Payment History</h1>
                    <p className="text-gray-600 mt-2">Track your membership payments and subscription details</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    ₱{totalSpent.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    {totalPayments}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Last Payment</p>
                                <p className="text-2xl font-bold text-purple-600 mt-2">
                                    {transactions.length > 0 ? new Date(transactions[0].paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="divide-y divide-gray-200">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
                                <p className="mt-1 text-sm text-gray-500">No payment records found.</p>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className={`p-3 rounded-full ${getMembershipColor(transaction.membershipType)}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <p className="font-semibold text-gray-900">
                                                        {transaction.membershipType.charAt(0).toUpperCase() + transaction.membershipType.slice(1)} Membership
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(transaction.paymentDate)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Ref: {transaction.reference}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right ml-4">
                                            <p className="text-xl font-bold text-green-600">
                                                ₱{transaction.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Load More - Hidden if no transactions */}
                {transactions.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            Load More Payments
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TransactionPage