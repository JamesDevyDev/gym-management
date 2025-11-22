'use client'
import { Eye, Pencil, Trash2, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import useStaffStore from "@/zustand/useStaffStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; // Install: npm install react-hot-toast

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    activated: boolean;
    createdAt: string;
    pfp?: string;
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

    const modal = (member: Member | null, action: string | null) => {
        setModalView(action)
        setSelectedDetails(member)
    }

    const closeModal = () => {
        const dialogElement = document.getElementById('my_modal_3') as HTMLDialogElement
        dialogElement?.close()
        setTimeout(() => {
            modal(null, null)
        }, 200)
    }

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
                selectedDetails.activated
            )

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

                closeModal()

                // Optionally refetch data from server to ensure consistency
                // Uncomment if you want to refresh from backend
                // await fetchMembers()
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

                closeModal()

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

                {/* MODAL */}
                <dialog id="my_modal_3" className="modal backdrop-blur-sm">
                    <div className="modal-box max-w-md bg-white shadow-xl rounded-xl border border-gray-100 p-0">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalView === 'edit' ? 'Edit Member' : modalView === 'view' ? 'Member Details' : 'Delete Member'}
                            </h3>
                            <form method="dialog">
                                <button
                                    onClick={() => modal(null, null)}
                                    className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={isSaving}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5">
                            {modalView === 'view' && selectedDetails && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                        <img
                                            src={selectedDetails.pfp}
                                            alt={selectedDetails.username}
                                            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedDetails.username}</p>
                                            <p className="text-sm text-gray-500">{selectedDetails.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Role</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{selectedDetails.role}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedDetails.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {selectedDetails.activated ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Registered</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(selectedDetails.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalView === 'edit' && selectedDetails && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedDetails.username}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            onChange={(e) => setSelectedDetails({ ...selectedDetails, username: e.target.value })}
                                            disabled={isSaving}
                                            placeholder="Enter username"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={selectedDetails.email}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            onChange={(e) => setSelectedDetails({ ...selectedDetails, email: e.target.value })}
                                            disabled={isSaving}
                                            placeholder="Enter email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            value={selectedDetails.activated ? 'active' : 'inactive'}
                                            onChange={(e) => setSelectedDetails({
                                                ...selectedDetails,
                                                activated: e.target.value === 'active',
                                            })}
                                            disabled={isSaving}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleEdit}
                                            disabled={isSaving}
                                            className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalView === 'delete' && selectedDetails && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-red-900">This action cannot be undone</p>
                                            <p className="text-sm text-red-700 mt-0.5">
                                                Are you sure you want to delete <span className="font-semibold">{selectedDetails.username}</span>?
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleDelete()}
                                            className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            Delete Member
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </dialog>

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
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Profile
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Date Registered
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    // Loading skeleton rows
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="skeleton w-12 h-12 rounded-full"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="skeleton h-4 w-32"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="skeleton h-4 w-48"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="skeleton h-4 w-24"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <div className="skeleton h-8 w-8 rounded-lg"></div>
                                                    <div className="skeleton h-8 w-8 rounded-lg"></div>
                                                    <div className="skeleton h-8 w-8 rounded-lg"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Actual data rows
                                    members.map((member, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4">
                                                <img
                                                    src={member.pfp}
                                                    alt={member.username}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{member.username}</span>
                                                {member.role === 'staff' && (
                                                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                        Staff
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600">{member.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-gray-600">
                                                        {new Date(member.createdAt).toLocaleString("en-US", {
                                                            weekday: "long",   // Monday, Tuesday, ...
                                                            year: "numeric",   // 2025
                                                            month: "long",     // November
                                                            day: "numeric",    // 19
                                                          
                                                        })}
                                                    </p>                                                    {member.role === 'member' && (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.activated
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {member.activated ? 'Active' : 'Inactive'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            modal(member, "view");
                                                            (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
                                                        }}
                                                        className="cursor-pointer p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-150"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            modal(member, 'edit');
                                                            (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
                                                        }}
                                                        className="cursor-pointer p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            modal(member, 'delete');
                                                            (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
                                                        }}
                                                        className="cursor-pointer p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {isLoading ? (
                            // Loading skeleton cards
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="skeleton w-12 h-12 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-4 w-32"></div>
                                            <div className="skeleton h-3 w-48"></div>
                                            <div className="skeleton h-3 w-24"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="skeleton flex-1 h-10 rounded-lg"></div>
                                        <div className="skeleton flex-1 h-10 rounded-lg"></div>
                                        <div className="skeleton flex-1 h-10 rounded-lg"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Actual data cards
                            members.map((member, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img
                                            src={member.pfp}
                                            alt={member.username}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{member.username}</h3>
                                                {member.role === 'staff' && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                        Staff
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{member.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500">
                                                    {new Date(member.createdAt).toLocaleDateString("en-US", {
                                                        weekday: "long",  // e.g., Tuesday
                                                        year: "numeric",  // 2025
                                                        month: "long",    // November
                                                        day: "numeric",   // 19
                                                    })}
                                                </p>
                                                {member.role === 'member' && (
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${member.activated
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {member.activated ? 'Active' : 'Inactive'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                modal(member, 'view');
                                                (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
                                            }}
                                            className="flex-1 py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                modal(member, 'edit');
                                                (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
                                            }}
                                            className="flex-1 py-2 px-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                modal(member, 'delete');
                                                (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
                                            }}
                                            className="flex-1 py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium">
                                            Delete
                                        </button>
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