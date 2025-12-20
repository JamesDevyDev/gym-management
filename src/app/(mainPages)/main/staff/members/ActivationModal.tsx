'use client'

import { ToggleLeft } from 'lucide-react';
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

interface ActivationModalProps {
    member: Member;
    updateActivation: (id: string, activated: boolean, duration: string, startTime: string, amount: number, paymentMethod: string) => Promise<any>;
    onSuccess?: () => void;
}

const ActivationModal = ({ member, updateActivation, onSuccess }: ActivationModalProps) => {
    const modalId = `activation_modal_${member._id}`;

    const [activated, setActivated] = useState(member.activated);
    const [monthsInput, setMonthsInput] = useState<string>('');
    const [duration, setDuration] = useState(member.duration || '');
    const [startTime, setStartTime] = useState(member.startTime || '');
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [isSaving, setIsSaving] = useState(false);

    const closeModal = () => {
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        if (modal) modal.close();
    };

    const handleSave = async () => {
        // If activating, require duration and amount
        if (activated && !duration) {
            toast.error("Please set membership duration");
            return;
        }

        if (activated && !amount) {
            toast.error("Please enter payment amount");
            return;
        }

        if (activated && Number(amount) <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        setIsSaving(true);

        try {
            const result = await updateActivation(
                member._id,
                activated,
                duration || '',
                startTime || '',
                Number(amount) || 0,
                paymentMethod
            );

            if (result.success) {
                toast.success("Activation status updated successfully!");

                // Call parent's onSuccess callback to refetch data
                if (onSuccess) {
                    await onSuccess();
                }

                closeModal();
            } else {
                toast.error(result.message || "Failed to update activation");
            }
        } catch (error: any) {
            console.error("Activation error:", error);
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
            const start = startTime 
                ? new Date(startTime)
                : new Date();
            const expiry = new Date(start);
            expiry.setMonth(expiry.getMonth() + months);

            setStartTime(start.toISOString());
            setDuration(expiry.toISOString());
        }
    };

    const handleActivationChange = (newActivated: boolean) => {
        setActivated(newActivated);
        
        // If deactivating, clear all fields
        if (!newActivated) {
            setDuration('');
            setStartTime('');
            setMonthsInput('');
            setAmount('');
            setPaymentMethod('cash');
        }
    };

    return (
        <>
            {/* OPEN MODAL BUTTON */}
            <button
                className="cursor-pointer p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
            >
                <ToggleLeft className="w-5 h-5" />
            </button>

            {/* MODAL */}
            <dialog id={modalId} className="modal">
                <div className="modal-box max-w-md">

                    <h3 className="font-bold text-lg mb-4">Manage Activation</h3>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Member:</span> {member.username}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Email:</span> {member.email}
                        </p>
                    </div>

                    {/* FORM CONTENT */}
                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Activation Status
                            </label>
                            <select
                                value={activated ? "active" : "inactive"}
                                onChange={(e) => handleActivationChange(e.target.value === "active")}
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Duration input - show when activated */}
                        {activated && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Membership Duration (Months) <span className="text-red-500">*</span>
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        Set how many months this membership should last
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Payment Amount (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        disabled={isSaving}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the payment amount for this membership
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        disabled={isSaving}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="gcash">GCash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="card">Card</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Show membership info once duration exists */}
                        {activated && duration && (
                            <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-xs text-gray-500">
                                    Start Date:{" "}
                                    <span className="font-medium">
                                        {startTime
                                            ? new Date(startTime).toLocaleDateString()
                                            : "Not set"}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Expiry Date:{" "}
                                    <span className="font-medium">
                                        {new Date(duration).toLocaleDateString()}
                                    </span>
                                </p>
                                {amount && (
                                    <p className="text-xs text-gray-500">
                                        Amount:{" "}
                                        <span className="font-medium">
                                            ₱{Number(amount).toLocaleString()}
                                        </span>
                                    </p>
                                )}
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
                                    "Update Activation"
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

export default ActivationModal;