'use client'

import { Eye } from "lucide-react";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    activated: boolean;
    createdAt: string;
    qrCode?: string;
    duration?: string;
    startTime?: string;
}

interface ViewModalProps {
    member: Member;
}

const ViewModal = ({ member }: ViewModalProps) => {
    const modalId = `view_modal_${member._id}`;

    const closeModal = () => {
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        if (modal) modal.close();
    };

    return (
        <>
            {/* Button that opens modal */}
            <button
                className="cursor-pointer p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-150"
                onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
            >
                <Eye className="w-5 h-5" />
            </button>

            {/* DaisyUI Modal */}
            <dialog id={modalId} className="modal">
                <div className="modal-box w-full max-w-md md:max-w-lg max-h-[90vh] overflow-auto">
                    {/* MODAL CONTENT */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                            <div>
                                <p className="font-semibold text-gray-900">{member.username}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Role</p>
                                <p className="text-sm font-medium text-gray-900 capitalize">{member.role}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${member.activated
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                        }`}
                                >
                                    {member.activated ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Registered</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(member.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>

                            {member.activated && (
                                <>
                                    {member.startTime && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Membership Started</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(member.startTime).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {member.duration && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Membership Expires</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(member.duration).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {member.qrCode && (
                            <div className="pt-5 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">QR Code</p>
                                <img
                                    src={member.qrCode}
                                    alt="QR Code"
                                    className="w-40 h-40 object-contain mx-auto border rounded-lg p-2 bg-white shadow"
                                />
                            </div>
                        )}
                    </div>

                    {/* Close button */}
                    <div className="modal-action">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Modal backdrop (click to close) */}
                <div className="modal-backdrop" onClick={closeModal}></div>
            </dialog>
        </>
    );
};

export default ViewModal;