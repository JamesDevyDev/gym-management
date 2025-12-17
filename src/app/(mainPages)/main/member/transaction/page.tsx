'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

// Types
interface Transaction {
    id: string
    memberName: string
    membershipType: '1 month' | '3 months' | '6 months' | '12 months'
    amount: number
    status: 'paid' | 'pending' | 'overdue'
    paymentDate: string
    dueDate: string
    reference: string
}

const TransactionPage = () => {
    const { getAuthUserFunction } = useAuthStore()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')

    // Dummy membership payment data for logged-in user
    const [transactions] = useState<Transaction[]>([
        {
            id: 'PAY001',
            memberName: user?.name || 'James Rodriguez',
            membershipType: '3 months',
            amount: 800,
            status: 'paid',
            paymentDate: '2024-12-01T10:30:00',
            dueDate: '2024-12-01T23:59:59',
            reference: 'MEM-2024-12-001'
        }
    ])

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

    const filteredTransactions = transactions.filter(txn =>
        activeFilter === 'all' ? true : txn.status === activeFilter
    )

    const getMembershipColor = (type: string) => {
        switch (type) {
            case '1 month': return 'text-blue-600 bg-blue-50'
            case '3 months': return 'text-purple-600 bg-purple-50'
            case '6 months': return 'text-orange-600 bg-orange-50'
            case '12 months': return 'text-green-600 bg-green-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-700 bg-green-100 border-green-200'
            case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
            case 'overdue': return 'text-red-700 bg-red-100 border-red-200'
            default: return 'text-gray-700 bg-gray-100 border-gray-200'
        }
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

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
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
                                    ₱{transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
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
                                <p className="text-sm font-medium text-gray-600">Months Active</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    {transactions.filter(t => t.status === 'paid').length}
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
                                <p className="text-sm font-medium text-gray-600">Current Status</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-2">
                                    {transactions.some(t => t.status === 'pending') ? 'Pending' :
                                        transactions.some(t => t.status === 'overdue') ? 'Overdue' : 'Active'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${transactions.some(t => t.status === 'pending') ? 'bg-yellow-100' :
                                transactions.some(t => t.status === 'overdue') ? 'bg-red-100' : 'bg-green-100'
                                }`}>
                                <svg className={`w-6 h-6 ${transactions.some(t => t.status === 'pending') ? 'text-yellow-600' :
                                    transactions.some(t => t.status === 'overdue') ? 'text-red-600' : 'text-green-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeFilter === 'all'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            All Payments
                        </button>
                        <button
                            onClick={() => setActiveFilter('paid')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeFilter === 'paid'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Paid
                        </button>
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeFilter === 'pending'
                                ? 'border-b-2 border-yellow-600 text-yellow-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveFilter('overdue')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeFilter === 'overdue'
                                ? 'border-b-2 border-red-600 text-red-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Overdue
                        </button>
                    </div>

                    {/* Transaction List */}
                    <div className="divide-y divide-gray-200">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
                                <p className="mt-1 text-sm text-gray-500">No payment records found for this filter.</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => (
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
                                                        {transaction.membershipType.charAt(0).toUpperCase() + transaction.membershipType.slice(1)} Months Membership
                                                    </p>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    {transaction.status === 'paid' ? (
                                                        <p className="text-sm text-gray-500">
                                                            Paid on {formatDate(transaction.paymentDate)}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">
                                                            Due on {formatDate(transaction.dueDate)}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500">Ref: {transaction.reference}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right ml-4">
                                            <p className={`text-xl font-bold ${transaction.status === 'paid' ? 'text-green-600' :
                                                transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                ₱{transaction.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {transaction.status === 'paid' ? 'PAID' :
                                                    transaction.status === 'pending' ? 'PENDING' : 'OVERDUE'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination or Load More */}
                <div className="flex justify-center">
                    <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        Load More Payments
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TransactionPage