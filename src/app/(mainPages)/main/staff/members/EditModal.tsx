'use client'

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

interface EditModalProps {
    member: Member;
    editMembers: (id: string, username: string, email: string, activated: boolean, duration: string, startTime: string) => Promise<any>;
    onSuccess?: () => void;
}

const EditModal = ({ member, editMembers, onSuccess }: EditModalProps) => {
    const modalId = `edit_modal_${member._id}`;

    const [selectedDetails, setSelectedDetails] = useState<Member>(member);
    const [isSaving, setIsSaving] = useState(false);
    const [monthsInput, setMonthsInput] = useState<string>('');

    const closeModal = () => {
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        if (modal) modal.close();
    };

    const handleSave = async () => {
        // Frontend validation
        if (!selectedDetails.username.trim()) {
            toast.error("Username cannot be empty");
            return;
        }

        if (!selectedDetails.email.trim()) {
            toast.error("Email cannot be empty");
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(selectedDetails.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSaving(true);

        try {
            const result = await editMembers(
                selectedDetails._id,
                selectedDetails.username,
                selectedDetails.email,
                selectedDetails.activated,
                selectedDetails.duration || '',
                selectedDetails.startTime || ''
            );

            if (result.success) {
                toast.success("Member updated successfully!");

                // Call parent's onSuccess callback to refetch data
                if (onSuccess) {
                    await onSuccess();
                }

                closeModal();
            } else {
                toast.error(result.message || "Failed to update member");
            }
        } catch (error: any) {
            console.error("Edit error:", error);
            toast.error(error.message || "An error occurred while updating");
        } finally {
            setIsSaving(false);
        }
    };

    const handleMonthsInputChange = (value: string) => {
        setMonthsInput(value);
        
        const months = Number(value);
        
        // Only update if it's a valid positive number
        if (value && months > 0 && !isNaN(months)) {
            const start = selectedDetails.startTime 
                ? new Date(selectedDetails.startTime)
                : new Date();
            const expiry = new Date(start);
            expiry.setMonth(expiry.getMonth() + months);

            setSelectedDetails({
                ...selectedDetails,
                startTime: start.toISOString(),
                duration: expiry.toISOString(),
            });
        }
    };

    return (
        <>
            {/* OPEN MODAL BUTTON */}
            <button
                className="cursor-pointer p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
            >
                <Pencil className="w-5 h-5" />
            </button>

            {/* MODAL */}
            <dialog id={modalId} className="modal">
                <div className="modal-box max-w-md">

                    <h3 className="font-bold text-lg mb-4">Edit Member</h3>

                    {/* FORM CONTENT */}
                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={selectedDetails.username}
                                onChange={(e) =>
                                    setSelectedDetails({ ...selectedDetails, username: e.target.value })
                                }
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={selectedDetails.email}
                                onChange={(e) =>
                                    setSelectedDetails({ ...selectedDetails, email: e.target.value })
                                }
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select
                                value={selectedDetails.activated ? "active" : "inactive"}
                                onChange={(e) =>
                                    setSelectedDetails({
                                        ...selectedDetails,
                                        activated: e.target.value === "active",
                                    })
                                }
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Duration input - always show when activated */}
                        {selectedDetails.activated && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Membership Duration (Months)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter number of months"
                                    value={monthsInput}
                                    onChange={(e) => handleMonthsInputChange(e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                        )}

                        {/* Show membership info once duration exists */}
                        {selectedDetails.duration && (
                            <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-xs text-gray-500">
                                    Started:{" "}
                                    <span className="font-medium">
                                        {selectedDetails.startTime
                                            ? new Date(selectedDetails.startTime).toLocaleDateString()
                                            : "Not set"}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Expires:{" "}
                                    <span className="font-medium">
                                        {new Date(selectedDetails.duration).toLocaleDateString()}
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* SAVE BUTTON */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn btn-primary w-full"
                            >
                                {isSaving ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    "Save Changes"
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

export default EditModal;