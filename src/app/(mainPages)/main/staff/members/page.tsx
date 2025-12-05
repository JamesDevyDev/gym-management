'use client'
import { Eye, Pencil, Trash2, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import useStaffStore from "@/zustand/useStaffStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; // Install: npm install react-hot-toast

import ViewModal from "./ViewModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    activated: boolean;
    createdAt: string;
    pfp?: string;
    qrCode: string
    duration?: string;
}

export default function StaffMembersPage() {
    const { getMembers, editMembers, deleteMembers } = useStaffStore()

    const [members, setMembers] = useState<Member[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalMembers, setTotalMembers] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [totalActivated, setTotalActivated] = useState(0)
    const [totalInactive, setTotalInactive] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [modalView, setModalView] = useState<string | null>(null)
    const [selectedDetails, setSelectedDetails] = useState<Member | null>(null)

    // Fetch members data
    const fetchMembers = async () => {
        setIsLoading(true)
        const data = await getMembers(currentPage)

        setMembers(data?.members || [])
        setCurrentPage(data?.currentPage || 1)
        setTotalMembers(data?.totalMembers || 0)
        setTotalPages(data?.totalPages || 1)
        setTotalActivated(data?.totalActivated || 0)
        setTotalInactive(data?.totalInactive || 0)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchMembers()
    }, [currentPage])

    const nextPage = () => setCurrentPage(currentPage + 1)
    const previousPage = () => setCurrentPage(currentPage - 1)

    // Handle Edit with validation and error handling
    const handleEdit = async () => {
        if (!selectedDetails) return

        // Frontend validation
        if (!selectedDetails.username.trim()) {
            toast.error("Username cannot be empty")
            return
        }

        if (!selectedDetails.email.trim()) {
            toast.error("Email cannot be empty")
            return
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(selectedDetails.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        setIsSaving(true)

        try {
            const result = await editMembers(
                selectedDetails._id,
                selectedDetails.username,
                selectedDetails.email,
                selectedDetails.activated,
                selectedDetails.duration
            );


            if (result.success) {
                toast.success("Member updated successfully!")

                // Update local state immediately for instant feedback
                setMembers(prevMembers =>
                    prevMembers.map(member =>
                        member._id === selectedDetails._id
                            ? { ...member, ...selectedDetails }
                            : member
                    )
                )

                // Update statistics if activation status changed
                const originalMember = members.find(m => m._id === selectedDetails._id)
                if (originalMember && originalMember.activated !== selectedDetails.activated) {
                    if (selectedDetails.activated) {
                        setTotalActivated(prev => prev + 1)
                        setTotalInactive(prev => prev - 1)
                    } else {
                        setTotalActivated(prev => prev - 1)
                        setTotalInactive(prev => prev + 1)
                    }
                }



            } else {
                toast.error(result.message || "Failed to update member")
            }
        } catch (error: any) {
            console.error("Edit error:", error)
            toast.error(error.message || "An error occurred while updating")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedDetails) return

        // Confirm delete
        const confirmed = window.confirm(
            `Are you sure you want to delete "${selectedDetails.username}"? This action cannot be undone.`
        )
        if (!confirmed) return

        setIsSaving(true)

        try {
            const result = await deleteMembers(selectedDetails._id)

            if (result.success) {
                toast.success("Member deleted successfully!")

                // Remove from UI immediately
                setMembers(prevMembers =>
                    prevMembers.filter(member => member._id !== selectedDetails._id)
                )

                // Adjust statistics
                if (selectedDetails.activated) {
                    setTotalActivated(prev => prev - 1)
                } else {
                    setTotalInactive(prev => prev - 1)
                }

                // Optionally refetch from server
                // await fetchMembers()
            } else {
                toast.error(result.message || "Failed to delete member")
            }

        } catch (error: any) {
            console.error("Delete error:", error)
            toast.error(error.message || "An error occurred while deleting")
        } finally {
            setIsSaving(false)
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Members</h1>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Total Members</p>
                                {isLoading ? (
                                    <div className="skeleton h-8 w-16"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                                )}
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
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

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Members List */}
                    <div className="divide-y divide-gray-200">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Left side - User info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-5 w-32"></div>
                                            <div className="skeleton h-4 w-48"></div>
                                            <div className="skeleton h-4 w-40"></div>
                                        </div>

                                        {/* Right side - Actions */}
                                        <div className="flex gap-2 md:ml-auto">
                                            <div className="skeleton h-10 w-10 rounded-lg"></div>
                                            <div className="skeleton h-10 w-10 rounded-lg"></div>
                                            <div className="skeleton h-10 w-10 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Actual member cards
                            members.map((member) => (
                                <div
                                    key={member._id}
                                    className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Left side - User info */}
                                        <div className="flex-1 min-w-0">
                                            {/* Name and role badge */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">
                                                    {member.username}
                                                </h3>
                                                {member.role === 'staff' && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                                                        Staff
                                                    </span>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <p className="text-sm text-gray-600 truncate mb-2">
                                                {member.email}
                                            </p>

                                            {/* Date and status */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    {new Date(member.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                {member.role === 'member' && (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${member.activated
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {member.activated ? 'Active' : 'Inactive'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right side - Action buttons */}
                                        <div className="flex gap-2 md:ml-auto">
                                            <ViewModal member={member} />
                                            <EditModal member={member} />
                                            <DeleteModal member={member} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            {/* Page Info */}
                            <div className="text-sm text-gray-600">
                                {isLoading ? (
                                    <div className="skeleton h-4 w-32"></div>
                                ) : (
                                    <>
                                        Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
                                        <span className="font-semibold text-gray-900">{totalPages}</span>
                                    </>
                                )}
                            </div>

                            {/* Navigation Buttons */}
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
            </div>
        </div>
    );
}