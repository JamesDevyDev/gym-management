'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'
import useAdminStore from '@/zustand/useAdminStore'

interface Transaction {
    _id: string
    userId: {
        _id: string
        username: string
    }
    staffId: string
    membershipDuration: number
    amount: number
    paymentDate: string
    startTime: string
    expiryDate: string
    reference: string
    paymentMethod: 'cash' | 'bank_transfer' | 'card'
    notes: string
    createdAt: string
    updatedAt: string
}

interface UserStats {
    totalUsers: number
    activeUsers: number
    registeredToday: number
}

interface AnalyticsData {
    totalRevenue: number
    totalTransactions: number
    averageTransaction: number
    revenueByMethod: { [key: string]: number }
    recentTransactions: Transaction[]
    monthlyRevenue: number
    activeMembers: number
}

interface MonthlyAnalytics {
    revenue: number
    transactions: number
    averageTransaction: number
    newMembers: number
    revenueByMethod: { [key: string]: number }
    dailyRevenue: { day: number; revenue: number }[]
    topMembers: { username: string; totalSpent: number; transactionCount: number }[]
}

// SVG icon paths (same icons as before)
const ICONS = {
    money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    badge: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    userPlus: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    trend: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
}

const StatCard = ({
    label,
    value,
    sub,
    icon,
}: {
    label: string
    value: string | number
    sub?: string
    icon: string
}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-black">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
            </div>
        </div>
    </div>
)

const Dashboard = () => {
    const router = useRouter()
    const { getAuthUserFunction } = useAuthStore()
    const { getDashboardInfo } = useAdminStore()

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics | null>(null)

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    useEffect(() => {
        const checkRole = async () => {
            const userData: any = await getAuthUserFunction()

            if (!userData || userData.role !== 'admin') {
                router.replace('/main')
                return
            }

            setUser(userData)
            await fetchDashboardData()
            setLoading(false)
        }

        checkRole()
    }, [router])

    useEffect(() => {
        if (transactions.length > 0) {
            calculateMonthlyAnalytics(transactions, selectedMonth, selectedYear)
        }
    }, [selectedMonth, selectedYear, transactions])

    const fetchDashboardData = async () => {
        try {
            const data = await getDashboardInfo()

            setTransactions(data.transactions)
            setUserStats(data.userStats)
            calculateAnalytics(data.transactions)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const calculateAnalytics = (data: Transaction[]) => {
        const totalRevenue = data.reduce((sum, t) => sum + t.amount, 0)
        const totalTransactions = data.length

        // Revenue by payment method
        const revenueByMethod = data.reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount
            return acc
        }, {} as { [key: string]: number })

        // Monthly revenue (current month)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlyRevenue = data
            .filter(t => {
                const date = new Date(t.paymentDate)
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear
            })
            .reduce((sum, t) => sum + t.amount, 0)

        // Active members (not expired)
        const now = new Date()
        const activeMembers = data.filter(t => new Date(t.expiryDate) > now).length

        setAnalytics({
            totalRevenue,
            totalTransactions,
            averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
            revenueByMethod,
            recentTransactions: data.slice(-5).reverse(),
            monthlyRevenue,
            activeMembers
        })
    }

    const calculateMonthlyAnalytics = (data: Transaction[], month: number, year: number) => {
        // Filter transactions for selected month
        const monthTransactions = data.filter(t => {
            const date = new Date(t.paymentDate)
            return date.getMonth() === month && date.getFullYear() === year
        })

        // Calculate revenue
        const revenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
        const transactions = monthTransactions.length
        const averageTransaction = transactions > 0 ? revenue / transactions : 0

        // Revenue by payment method for the month
        const revenueByMethod = monthTransactions.reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount
            return acc
        }, {} as { [key: string]: number })

        // New members registered in this month
        const newMembers = data.filter(t => {
            const date = new Date(t.createdAt)
            return date.getMonth() === month && date.getFullYear() === year
        }).length

        // Daily revenue breakdown
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const dailyRevenue: { day: number; revenue: number }[] = []

        for (let day = 1; day <= daysInMonth; day++) {
            const dayRevenue = monthTransactions
                .filter(t => new Date(t.paymentDate).getDate() === day)
                .reduce((sum, t) => sum + t.amount, 0)
            dailyRevenue.push({ day, revenue: dayRevenue })
        }

        // Top members by spending in this month
        const memberSpending = monthTransactions.reduce((acc, t) => {
            const username = t.userId.username
            if (!acc[username]) {
                acc[username] = { totalSpent: 0, transactionCount: 0 }
            }
            acc[username].totalSpent += t.amount
            acc[username].transactionCount += 1
            return acc
        }, {} as { [key: string]: { totalSpent: number; transactionCount: number } })

        const topMembers = Object.entries(memberSpending)
            .map(([username, data]) => ({ username, ...data }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)

        setMonthlyAnalytics({
            revenue,
            transactions,
            averageTransaction,
            newMembers,
            revenueByMethod,
            dailyRevenue,
            topMembers
        })
    }

    // Get available years from transaction data
    const getAvailableYears = () => {
        const years = new Set(
            transactions.map(t => new Date(t.paymentDate).getFullYear())
        )
        return Array.from(years).sort((a, b) => b - a)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-gray-100">
                <p className="text-gray-500 font-semibold">Checking access...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Analytics Cards */}
                {analytics && userStats && (
                    <>
                        {/* Financial & Transaction Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                label="Total Revenue"
                                value={`₱${analytics.totalRevenue.toLocaleString()}`}
                                icon={ICONS.money}
                            />
                            <StatCard
                                label="Monthly Revenue"
                                value={`₱${analytics.monthlyRevenue.toLocaleString()}`}
                                icon={ICONS.chart}
                            />
                            <StatCard
                                label="Total Transactions"
                                value={analytics.totalTransactions}
                                icon={ICONS.clipboard}
                            />
                        </div>

                        {/* User Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                label="Total Members"
                                value={userStats.totalUsers}
                                sub="Registered members"
                                icon={ICONS.users}
                            />
                            <StatCard
                                label="Active Accounts"
                                value={userStats.activeUsers}
                                sub={
                                    userStats.totalUsers > 0
                                        ? `${((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% activation rate`
                                        : '0% activation rate'
                                }
                                icon={ICONS.check}
                            />
                            <StatCard
                                label="Active Memberships"
                                value={analytics.activeMembers}
                                sub="Not expired"
                                icon={ICONS.badge}
                            />
                            <StatCard
                                label="New Today"
                                value={userStats.registeredToday}
                                sub="Registered today"
                                icon={ICONS.userPlus}
                            />
                        </div>

                        {/* Month Selector */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-black">In-Depth Monthly Analytics</h2>
                                    <p className="text-sm text-gray-500 mt-1">Select a month to view detailed analytics</p>
                                </div>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        {months.map((month, index) => (
                                            <option key={index} value={index}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        {getAvailableYears().length > 0 ? (
                                            getAvailableYears().map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))
                                        ) : (
                                            <option value={new Date().getFullYear()}>
                                                {new Date().getFullYear()}
                                            </option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Analytics Cards */}
                        {monthlyAnalytics && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <StatCard
                                        label="Revenue"
                                        value={`₱${monthlyAnalytics.revenue.toLocaleString()}`}
                                        sub={`${months[selectedMonth]} ${selectedYear}`}
                                        icon={ICONS.money}
                                    />
                                    <StatCard
                                        label="Transactions"
                                        value={monthlyAnalytics.transactions}
                                        sub="Total count"
                                        icon={ICONS.clipboard}
                                    />
                                    <StatCard
                                        label="Avg Transaction"
                                        value={`₱${monthlyAnalytics.averageTransaction.toFixed(2)}`}
                                        sub="Per transaction"
                                        icon={ICONS.trend}
                                    />
                                    <StatCard
                                        label="New Members"
                                        value={monthlyAnalytics.newMembers}
                                        sub="Registered"
                                        icon={ICONS.userPlus}
                                    />
                                </div>

                                {/* Monthly Revenue by Payment Method & Daily Revenue Chart */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Payment Methods Breakdown */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-black mb-4">
                                            Payment Methods - {months[selectedMonth]} {selectedYear}
                                        </h3>
                                        {Object.keys(monthlyAnalytics.revenueByMethod).length > 0 ? (
                                            <div className="space-y-4">
                                                {Object.entries(monthlyAnalytics.revenueByMethod).map(([method, amount]) => {
                                                    const percentage = monthlyAnalytics.revenue > 0
                                                        ? (amount / monthlyAnalytics.revenue) * 100
                                                        : 0
                                                    return (
                                                        <div key={method}>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                                    {method.replace('_', ' ')}
                                                                </span>
                                                                <span className="text-sm font-semibold text-black">
                                                                    ₱{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-black h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No transactions this month</p>
                                        )}
                                    </div>

                                    {/* Daily Revenue Visualization */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-black mb-4">
                                            Daily Revenue Trend
                                        </h3>
                                        <div className="h-64 flex items-end justify-between gap-1">
                                            {monthlyAnalytics.dailyRevenue.map((day) => {
                                                const maxRevenue = Math.max(...monthlyAnalytics.dailyRevenue.map(d => d.revenue))
                                                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                                                return (
                                                    <div key={day.day} className="flex-1 flex flex-col items-center justify-end group">
                                                        <div className="relative w-full">
                                                            <div
                                                                className="w-full bg-black hover:bg-gray-600 transition-all rounded-t cursor-pointer"
                                                                style={{ height: `${Math.max(height, 2)}px` }}
                                                                title={`Day ${day.day}: ₱${day.revenue.toLocaleString()}`}
                                                            />
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                ₱{day.revenue.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        {day.day % 5 === 1 && (
                                                            <span className="text-xs text-gray-500 mt-1">{day.day}</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Members for the Month */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                                    <h3 className="text-lg font-semibold text-black mb-4">
                                        Top Members - {months[selectedMonth]} {selectedYear}
                                    </h3>
                                    {monthlyAnalytics.topMembers.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Member</th>
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transactions</th>
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg per Transaction</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthlyAnalytics.topMembers.map((member, index) => (
                                                        <tr key={member.username} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="py-3 px-4">
                                                                <span
                                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${index === 0
                                                                        ? 'bg-black text-white'
                                                                        : 'bg-gray-100 text-black'
                                                                        }`}
                                                                >
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-sm font-medium text-black">
                                                                {member.username}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm font-semibold text-black">
                                                                ₱{member.totalSpent.toLocaleString()}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {member.transactionCount}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                ₱{(member.totalSpent / member.transactionCount).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No transactions this month</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Revenue by Payment Method & Quick Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-black mb-4">All-Time Revenue by Payment Method</h2>
                                <div className="space-y-4">
                                    {Object.entries(analytics.revenueByMethod).map(([method, amount]) => {
                                        const percentage = (amount / analytics.totalRevenue) * 100
                                        return (
                                            <div key={method}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                                        {method.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-sm font-semibold text-black">
                                                        ₱{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-black h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-black mb-4">Quick Stats</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                        <span className="text-gray-600">Average Transaction</span>
                                        <span className="text-lg font-semibold text-black">
                                            ₱{analytics.averageTransaction.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                        <span className="text-gray-600">Payment Methods</span>
                                        <span className="text-lg font-semibold text-black">
                                            {Object.keys(analytics.revenueByMethod).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                        <span className="text-gray-600">Membership Rate</span>
                                        <span className="text-lg font-semibold text-black">
                                            {analytics.totalTransactions > 0
                                                ? ((analytics.activeMembers / analytics.totalTransactions) * 100).toFixed(1)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-600">Inactive Accounts</span>
                                        <span className="text-lg font-semibold text-black">
                                            {userStats.totalUsers - userStats.activeUsers}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-black mb-4">Recent Transactions</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Member</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.recentTransactions.map((transaction) => (
                                            <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-black font-mono">
                                                    {transaction.reference}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-black">
                                                    {transaction.userId.username}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-semibold text-black">
                                                    ₱{transaction.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {transaction.membershipDuration} {transaction.membershipDuration === 1 ? 'month' : 'months'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-black border border-gray-300 capitalize">
                                                        {transaction.paymentMethod.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {new Date(transaction.paymentDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Dashboard