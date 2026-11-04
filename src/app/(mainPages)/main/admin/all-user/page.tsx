'use client'
import React, { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Calendar, Shield, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import useAdminStore from '@/zustand/useAdminStore'
import CreateAdminModal from './createStaffModal';
import DeleteModalStaff from './deleteModalStaff';

import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    activated: boolean;
    startTime: Date
    createdAt: string;
    pfp?: string;
    qrCode?: string;
    duration?: string;

    //Staff
    NumberOfScans: number
}

const Page = () => {
    const router = useRouter()
    const { getAllUsers } = useAdminStore()
    const { getAuthUserFunction } = useAuthStore()

    // Auth state
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    //admin state
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState<'staff' | 'member'>('staff')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [searchQuery, setSearchQuery] = useState('')


    //Auth check
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

    //Fetch all users
    const fetchUsers = async () => {
        setIsLoading(true)
        const data = await getAllUsers()

        if (data) {
            setUsers(data)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Reset to page 1 when role changes or search query changes
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedRole, searchQuery])


    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-gray-100">
                <p className="text-gray-500 font-semibold">Checking access...</p>
            </div>
        )
    }

    // Filter users based on selected role and search query
    const filteredUsers = users.filter(user => {
        const matchesRole = user.role === selectedRole
        const matchesSearch = searchQuery === '' ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesRole && matchesSearch
    })

    // Calculate statistics
    const totalCount = filteredUsers.length
    const totalActivated = filteredUsers.filter(u => u.activated).length
    const totalInactive = filteredUsers.filter(u => !u.activated).length

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    const RoleIcon = selectedRole === 'staff' ? Shield : Users
    const roleLabel = selectedRole === 'staff' ? 'Staff' : 'Members'

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-end">

                    {/* Role Selector */}
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => setSelectedRole('staff')}
                            className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${selectedRole === 'staff'
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            Staff
                        </button>
                        <button
                            onClick={() => setSelectedRole('member')}
                            className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${selectedRole === 'member'
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Members
                        </button>
                    </div>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <RoleIcon className="w-6 h-6 text-black" />
                        <h2 className="text-2xl font-semibold text-black">{roleLabel}</h2>
                        <span className="bg-gray-100 text-black border border-gray-300 text-sm font-medium px-3 py-1 rounded-full">
                            {totalCount}
                        </span>
                    </div>
                    <div>
                        <CreateAdminModal onSuccess={fetchUsers} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedRole === 'staff' ? 'staff' : 'members'} by name or email...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent py-3 text-black outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="shrink-0 rounded p-1 text-gray-400 hover:text-black"
                            aria-label="Clear search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Total {selectedRole === 'staff' ? 'Staff' : 'Members'}
                                </p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-black">{totalCount}</p>
                                )}
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <RoleIcon className="w-5 h-5 text-black" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Activated</p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-black">{totalActivated}</p>
                                )}
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <UserCheck className="w-5 h-5 text-black" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Inactive</p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-black">{totalInactive}</p>
                                )}
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <UserX className="w-5 h-5 text-black" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-5 w-32"></div>
                                            <div className="skeleton h-4 w-48"></div>
                                            <div className="skeleton h-4 w-40"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left Section - User Info */}
                                        <div className="flex-1 min-w-0">
                                            {/* Username and Role Badge */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="font-semibold text-black text-lg truncate">
                                                    {user.username}
                                                </h3>
                                                <span className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-gray-100 text-black border border-gray-300">
                                                    {selectedRole === 'staff' ? 'Staff' : 'Member'}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap border ${user.activated
                                                        ? 'bg-black text-white border-black'
                                                        : 'bg-white text-gray-500 border-gray-300'
                                                        }`}
                                                >
                                                    {user.activated ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            {/* User Details */}
                                            <div className="space-y-2">
                                                {/* For Staff - Scan Count */}
                                                {user?.role === 'staff' && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="font-medium">Scan Count:</span>
                                                        <span className="text-black font-semibold">
                                                            {user?.NumberOfScans || 0}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* For Members - Start Time */}
                                                {user?.role === 'member' && user?.activated && user?.startTime && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="font-medium">Start Time:</span>
                                                        <span className="text-black">
                                                            {new Date(user.startTime).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* For Members - Duration */}
                                                {user?.role === 'member' && user?.duration && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="font-medium">Duration:</span>
                                                        <span className="text-black">
                                                            {new Date(user.duration).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Created Date */}
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="font-medium">Created:</span>
                                                    <span className="text-black">
                                                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section - Actions */}
                                        {user?.role === 'staff' && (
                                            <div className="flex-shrink-0">
                                                <DeleteModalStaff member={user} onSuccess={fetchUsers} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                {searchQuery ? (
                                    <>
                                        <p className="mb-2">No {selectedRole === 'staff' ? 'staff members' : 'members'} found matching "{searchQuery}"</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-black underline hover:text-gray-600 font-medium text-sm"
                                        >
                                            Clear search
                                        </button>
                                    </>
                                ) : (
                                    `No ${selectedRole === 'staff' ? 'staff members' : 'members'} found`
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing page <span className="font-semibold text-black">{currentPage}</span> of{" "}
                                    <span className="font-semibold text-black">{totalPages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page