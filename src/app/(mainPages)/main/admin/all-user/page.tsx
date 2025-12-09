'use client'
import React, { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Mail, Calendar, Shield, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import useAdminStore from '@/zustand/useAdminStore'
import CreateAdminModal from './createStaffModal';
import DeleteModalStaff from './deleteModalStaff';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    activated: boolean;
    createdAt: string;
    pfp?: string;
    qrCode?: string;
    duration?: string;
}

const Page = () => {
    const { getAllUsers } = useAdminStore()  // Add deleteMembers here

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState<'staff' | 'member'>('staff')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch all users
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-end">

                    {/* Role Selector */}
                    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                        <button
                            onClick={() => setSelectedRole('staff')}
                            className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${selectedRole === 'staff'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            Staff
                        </button>
                        <button
                            onClick={() => setSelectedRole('member')}
                            className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${selectedRole === 'member'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Members
                        </button>
                    </div>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between gap-3 mb-6 ">
                    <div className='flex items-center gap-3'>
                        {selectedRole === 'staff' ? (
                            <>
                                <Shield className="w-6 h-6 text-purple-600" />
                                <h2 className="text-2xl font-semibold text-gray-800">Staff</h2>
                            </>
                        ) : (
                            <>
                                <Users className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-semibold text-gray-800">Members</h2>
                            </>
                        )}
                        <span className={`${selectedRole === 'staff' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            } text-sm font-medium px-3 py-1 rounded-full`}>
                            {totalCount}
                        </span>
                    </div>
                    <div>
                        <CreateAdminModal onSuccess={fetchUsers} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6 ">
                    <input
                        type="text"
                        placeholder={`Search ${selectedRole === 'staff' ? 'staff' : 'members'} by name or email...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                    Total {selectedRole === 'staff' ? 'Staff' : 'Members'}
                                </p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                                )}
                            </div>
                            <div className={`p-2 ${selectedRole === 'staff' ? 'bg-purple-50' : 'bg-blue-50'
                                } rounded-lg`}>
                                {selectedRole === 'staff' ? (
                                    <Shield className="w-5 h-5 text-purple-600" />
                                ) : (
                                    <Users className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Activated</p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-green-600">{totalActivated}</p>
                                )}
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Inactive</p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-orange-600">{totalInactive}</p>
                                )}
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <UserX className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                                <div key={user._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">
                                                    {user.username}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${selectedRole === 'staff'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {selectedRole === 'staff' ? 'Staff' : 'Member'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${user.activated
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {user.activated ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {user?.role === 'staff' && <DeleteModalStaff member={user} onSuccess={fetchUsers} />}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                {searchQuery ? (
                                    <>
                                        <p className="mb-2">No {selectedRole === 'staff' ? 'staff members' : 'members'} found matching "{searchQuery}"</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
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
                                    Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
                                    <span className="font-semibold text-gray-900">{totalPages}</span>
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