'use client'
import { useState, useEffect } from 'react'
import { Clock, Filter, X, ChevronLeft, ChevronRight, Shield, RefreshCw } from 'lucide-react'
import useAdminStore from '@/zustand/useAdminStore'

interface AdminLog {
    _id: string
    userId: {
        _id: string
        username: string
    }
    staffId: {
        _id: string
        username: string
    }
    action: string
    createdAt: string
}

const AllLogsPage = () => {

    const { getAdminLogs } = useAdminStore()

    const [logs, setLogs] = useState<AdminLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalLogs, setTotalLogs] = useState(0)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [quickFilter, setQuickFilter] = useState('')
    const [filterDate, setFilterDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    // Fetch logs
    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(quickFilter && { quickFilter }),
                ...(filterDate && { date: filterDate }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(actionFilter && { action: actionFilter })
            })

            const data = await getAdminLogs(params.toString())
            if (data.data.logs) {
                setLogs(data.data.logs)
                setTotalPages(data.data.totalPages)
                setTotalLogs(data.data.totalLogs)
            }

        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs()
        }, 300)

        return () => clearTimeout(timer)
    }, [currentPage, searchTerm, filterDate, quickFilter, startTime, endTime, actionFilter])

    const handleQuickFilter = (filter: string) => {
        setQuickFilter(quickFilter === filter ? '' : filter)
        setFilterDate('')
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setQuickFilter('')
        setFilterDate('')
        setStartTime('')
        setEndTime('')
        setActionFilter('')
        setCurrentPage(1)
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        const phTime = new Date(date.getTime() + (8 * 60 * 60 * 1000))

        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }

        const formattedDate = phTime.toLocaleDateString('en-US', dateOptions)
        const formattedTime = phTime.toLocaleTimeString('en-US', timeOptions)

        return { date: formattedDate, time: formattedTime }
    }

    const getRelativeTime = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return formatDateTime(dateString).date
    }

    const hasActiveFilters = searchTerm || quickFilter || filterDate || startTime || endTime || actionFilter

    if (isLoading && logs.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading logs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Activity Logs</h1>
                            <p className="text-gray-600 mt-1">Total logs: {totalLogs}</p>
                        </div>
                        <button
                            onClick={fetchLogs}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => handleQuickFilter('today')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${quickFilter === 'today'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleQuickFilter('week')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${quickFilter === 'week'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => handleQuickFilter('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${quickFilter === 'month'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            <Filter className="w-4 h-4" />
                            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                            >
                                <X className="w-4 h-4" />
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    {/* Search, Action Filter and Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <select
                                value={actionFilter}
                                onChange={(e) => {
                                    setActionFilter(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Actions</option>
                                <option value="Scanned QR">Scanned QR</option>
                                <option value="Edited member details">Edited member details</option>
                                <option value="User Registered">User Registered</option>
                            </select>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value)
                                    setQuickFilter('')
                                    setCurrentPage(1)
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Advanced Time Filters */}
                    {showAdvancedFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        setStartTime(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => {
                                        setEndTime(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 col-span-full">
                                * Time filters work with "Today" or a specific date selection
                            </p>
                        </div>
                    )}
                </div>

                {/* Logs List */}
                {logs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Clock className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No logs found</h3>
                        <p className="text-gray-600">
                            {hasActiveFilters
                                ? 'Try adjusting your filters'
                                : 'Admin activity logs will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="space-y-3 p-6">
                            {logs.map((log) => {
                                const { date, time } = formatDateTime(log.createdAt)
                                const relativeTime = getRelativeTime(log.createdAt)

                                // Define color schemes based on action
                                const getActionColors = (action: string) => {
                                    switch (action) {
                                        case 'Scanned QR':
                                            return {
                                                iconBg: 'bg-blue-100',
                                                iconColor: 'text-blue-600',
                                                badgeBg: 'bg-blue-100',
                                                badgeText: 'text-blue-700'
                                            }
                                        case 'Edited member details':
                                            return {
                                                iconBg: 'bg-yellow-100',
                                                iconColor: 'text-yellow-600',
                                                badgeBg: 'bg-yellow-100',
                                                badgeText: 'text-yellow-700'
                                            }
                                        case 'User Registered':
                                            return {
                                                iconBg: 'bg-green-100',
                                                iconColor: 'text-green-600',
                                                badgeBg: 'bg-green-100',
                                                badgeText: 'text-green-700'
                                            }
                                        default:
                                            return {
                                                iconBg: 'bg-red-100',
                                                iconColor: 'text-red-600',
                                                badgeBg: 'bg-red-100',
                                                badgeText: 'text-red-700'
                                            }
                                    }
                                }

                                const colors = getActionColors(log.action)

                                return (
                                    <div
                                        key={log._id}
                                        className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center`}>
                                                        <Shield className={`w-5 h-5 ${colors.iconColor}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-1 ${colors.badgeBg} ${colors.badgeText} text-xs font-medium rounded-full`}>
                                                                {log.action}
                                                            </span>
                                                        </div>

                                                        {log?.action === 'Scanned QR' &&
                                                            <p className="text-sm text-gray-600">
                                                                STAFF :  <span className="font-semibold text-gray-900">{log.staffId?.username || 'Unknown'}</span> scanned
                                                            </p>
                                                        }
                                                        {log?.action === 'Edited member details' &&
                                                            <p className="text-sm text-gray-600">
                                                                STAFF : <span className="font-semibold text-gray-900">{log.staffId?.username || 'Unknown'}</span> Edited
                                                            </p>
                                                        }

                                                        <p className="text-lg font-bold text-gray-900">{log.userId?.username || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">{date}</p>
                                                <p className="text-sm text-gray-600">{time} PHT</p>
                                                <p className="text-xs text-gray-500 mt-1">{relativeTime}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                            <span>Log ID: {log._id.slice(-8)}</span>
                                            <span>User ID: {log.userId?._id.slice(-8) || 'N/A'}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                                        <span className="font-semibold text-gray-900">{totalPages}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1 || isLoading}
                                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>

                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages || isLoading}
                                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllLogsPage