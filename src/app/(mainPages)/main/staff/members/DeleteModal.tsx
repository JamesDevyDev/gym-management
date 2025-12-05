'use client'

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    activated: boolean;
    createdAt: string;
}

interface DeleteModalProps {
    member: Member;
    onDelete?: (memberId: string) => void;
}

const DeleteModal = ({ member, onDelete }: DeleteModalProps) => {
    const modalId = `delete_modal_${member._id}`;
    const [isSaving, setIsSaving] = useState(false);

    const closeModal = () => {
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        if (modal) modal.close();
    };

    const handleDelete = async () => {
        setIsSaving(true);

        // Call parent's onDelete function if provided
        if (onDelete) {
            await onDelete(member._id);
        }

        setIsSaving(false);
        closeModal();
    };

    return (
        <>
            {/* OPEN BUTTON */}
            <button
                className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
            >
                <Trash2 className="w-5 h-5" />
            </button>

            {/* MODAL */}
            <dialog id={modalId} className="modal">
                <div className="modal-box max-w-md">

                    <h3 className="font-bold text-lg text-red-600 mb-4">Delete Member</h3>

                    <div className="space-y-4">
                        {/* WARNING BOX */}
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-900">This action cannot be undone</p>
                                <p className="text-sm text-red-700 mt-0.5">
                                    Are you sure you want to delete
                                    <span className="font-semibold"> {member.username}</span>?
                                </p>
                            </div>
                        </div>

                        {/* MEMBER INFO */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-900">Email:</span> {member.email}
                                </p>

                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-900">Status:</span>{" "}
                                    <span className={member.activated ? "text-green-600" : "text-orange-600"}>
                                        {member.activated ? "Active" : "Inactive"}
                                    </span>
                                </p>

                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-900">Registered:</span>{" "}
                                    {new Date(member.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* DELETE BUTTON */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="btn bg-red-600 text-white w-full hover:bg-red-700 disabled:bg-red-400"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Member"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={closeModal}
                    >
                        ✕
                    </button>
                </div>

                {/* BACKDROP */}
                <div className="modal-backdrop" onClick={closeModal}></div>
            </dialog>
        </>
    );
};

export default DeleteModal;