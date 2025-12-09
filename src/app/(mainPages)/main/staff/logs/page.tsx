'use client';

import { useState, useEffect } from 'react';
import { User, Clock, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import useStaffStore from '@/zustand/useStaffStore';

interface Log {
    _id: string;
    adminId: {
        _id: string;
        username: string;
    };
    user: {
        _id: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
}

const Page = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [quickFilter, setQuickFilter] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { getLogs } = useStaffStore();

    // Fetch logs data
    const fetchLogs = async () => {
        setIsLoading(true);

        // Build query params
        const params: any = { page: currentPage };
        if (searchTerm) params.search = searchTerm;
        if (quickFilter) params.quickFilter = quickFilter;
        if (filterDate) params.date = filterDate;
        if (startTime) params.startTime = startTime;
        if (endTime) params.endTime = endTime;

        const queryString = new URLSearchParams(params).toString();
        const data = await getLogs(queryString);

        setLogs(data?.logs || []);
        setCurrentPage(data?.currentPage || 1);
        setTotalLogs(data?.totalLogs || 0);
        setTotalPages(data?.totalPages || 1);
        setIsLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filterDate, quickFilter, startTime, endTime]);

    const nextPage = () => setCurrentPage(currentPage + 1);
    const previousPage = () => setCurrentPage(currentPage - 1);

    const handleQuickFilter = (filter: string) => {
        setQuickFilter(filter);
        setFilterDate(''); // Clear specific date when using quick filter
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterDate('');
        setQuickFilter('');
        setStartTime('');
        setEndTime('');
        setCurrentPage(1);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const phTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));

        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const formattedDate = phTime.toLocaleDateString('en-US', dateOptions);
        const formattedTime = phTime.toLocaleTimeString('en-US', timeOptions);

        return { date: formattedDate, time: formattedTime };
    };

    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return formatDateTime(dateString).date;
    };

    if (isLoading && logs.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">QR Scan History</h1>
                            <p className="text-gray-600 mt-1">Total scans: {totalLogs}</p>
                        </div>
                        <button
                            onClick={fetchLogs}
                            disabled={isLoading}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => handleQuickFilter('today')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${quickFilter === 'today'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleQuickFilter('week')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${quickFilter === 'week'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => handleQuickFilter('month')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${quickFilter === 'month'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            <Filter className="w-4 h-4" />
                            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                        </button>
                        {(searchTerm || filterDate || quickFilter || startTime || endTime) && (
                            <button
                                onClick={clearFilters}
                                className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    {/* Search and Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="">
                            <input
                                type="text"
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div className="">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value);
                                    setQuickFilter(''); // Clear quick filter when selecting specific date
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                                        setStartTime(e.target.value);
                                        setCurrentPage(1);
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
                                        setEndTime(e.target.value);
                                        setCurrentPage(1);
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
                            {searchTerm || filterDate || quickFilter
                                ? 'Try adjusting your filters'
                                : 'QR scan logs will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="space-y-3 p-6">
                            {logs.map((log) => {
                                const { date, time } = formatDateTime(log.createdAt);
                                const relativeTime = getRelativeTime(log.createdAt);

                                return (
                                    <div
                                        key={log._id}
                                        className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">
                                                            Staff <span className="font-semibold text-gray-900">{log.adminId.username}</span> scanned
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900">{log.user.username}</p>
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
                                            <span>User ID: {log.user._id.slice(-8)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
                                    <span className="font-semibold text-gray-900">{totalPages}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => previousPage()}
                                        disabled={currentPage === 1 || isLoading}
                                        className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>

                                    <button
                                        onClick={() => nextPage()}
                                        disabled={currentPage === totalPages || isLoading}
                                        className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;