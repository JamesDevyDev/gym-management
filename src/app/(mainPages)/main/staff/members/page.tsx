'use client'
import { Eye, Pencil, Trash2, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import useStaffStore from "@/zustand/useStaffStore";
import { useEffect, useState } from "react";

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
    const { getMembers } = useStaffStore()

    const [members, setMembers] = useState<Member[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalMembers, setTotalMembers] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [totalActivated, setTotalActivated] = useState(0)
    const [totalInactive, setTotalInactive] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const renderData = async () => {
            setIsLoading(true)
            const data = await getMembers(currentPage) //The value in here is the page number

            console.log(data)

            setMembers(data?.members)
            setCurrentPage(data?.currentPage)
            setTotalMembers(data?.totalMembers)
            setTotalPages(data?.totalPages)
            setTotalActivated(data?.totalActivated)
            setTotalInactive(data?.totalInactive)
            setIsLoading(false)
        }

        renderData()
    }, [currentPage])

    const nextPage = () => {
        setCurrentPage(currentPage + 1)
    }

    const previousPage = () => {
        setCurrentPage(currentPage - 1)
    }

    const [modalView, setModalView] = useState()
    const [selectedDetails, setSelectedDetails] = useState<Member>()
    const modal = (member: any, action: any) => {
        setModalView(action)
        setSelectedDetails(member)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Members</h1>
                </div>

                {/* MODAL */}
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            {/* Close button */}
                            <button
                                onClick={() => {
                                    modal(null, null);
                                }}
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            >✕</button>
                        </form>

                        {/* Modal Title */}
                        <h3 className="font-bold text-lg">{modalView === 'edit' ? 'Edit Member' : modalView === 'view' ? 'View Member' : 'Delete Member'}</h3>

                        {/* Conditional Content */}
                        {modalView === 'view' && selectedDetails && (
                            <div className="py-4">
                                <p><strong>Username:</strong> {selectedDetails.username}</p>
                                <p><strong>Email:</strong> {selectedDetails.email}</p>
                                <p><strong>Role:</strong> {selectedDetails.role}</p>
                                <p><strong>Activated:</strong> {selectedDetails.activated ? 'Yes' : 'No'}</p>
                                <p><strong>Created At:</strong> {new Date(selectedDetails.createdAt).toLocaleString()}</p>
                            </div>
                        )}

                        {modalView === 'edit' && selectedDetails && (
                            <div className="py-4">
                                <label className="block">Username:</label>
                                <input
                                    type="text"
                                    defaultValue={selectedDetails.username}
                                    className="input input-bordered w-full"
                                    onChange={(e) => setSelectedDetails({ ...selectedDetails, username: e.target.value })}
                                />

                                <label className="block mt-2">Email:</label>
                                <input
                                    type="email"
                                    defaultValue={selectedDetails.email}
                                    className="input input-bordered w-full"
                                    onChange={(e) => setSelectedDetails({ ...selectedDetails, email: e.target.value })}
                                />

                                <label className="block mt-2">Status:</label>
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedDetails.activated ? 'active' : 'inactive'}
                                    onChange={(e) => setSelectedDetails({
                                        ...selectedDetails,
                                        activated: e.target.value === 'active',
                                    })}
                                >
                                    <option value="active">Activated</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                            </div>
                        )}

                        {modalView === 'delete' && selectedDetails && (
                            <div className="py-4">
                                <p>Are you sure you want to delete this member? {selectedDetails.username}</p>
                                <button className="btn btn-danger mt-4" onClick={() => console.log('delete')}>
                                    Yes, Delete
                                </button>
                            </div>
                        )}
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
                                                    <span className="text-gray-600">
                                                        {new Date(member.createdAt).toLocaleString("en-US", {
                                                            weekday: "long",   // Monday, Tuesday, ...
                                                            year: "numeric",   // 2025
                                                            month: "long",     // November
                                                            day: "numeric",    // 19
                                                            hour: "2-digit",   // 01, 23
                                                            minute: "2-digit", // 05, 59
                                                            hour12: true       // AM/PM
                                                        })}
                                                    </span>                                                    {member.role === 'member' && (
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