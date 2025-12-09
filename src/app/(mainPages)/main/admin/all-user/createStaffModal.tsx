'use client';

import useAdminStore from "@/zustand/useAdminStore";
import { useId, useState } from "react";
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateAdminModalProps {
    onSuccess?: () => void;
}

export default function CreateAdminModal({ onSuccess }: CreateAdminModalProps) {

    const { createStaff } = useAdminStore()

    const modalId = useId();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const openModal = () => {
        (document.getElementById(modalId) as HTMLDialogElement)?.showModal();
    };

    const closeModal = () => {
        setUsername("");
        setPassword("");
        setShowPassword(false);
        setError("");
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend validation
        if (!username.trim()) {
            setError("Username cannot be empty");
            return;
        }

        if (!password.trim()) {
            setError("Password cannot be empty");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await createStaff({ username, password });

            if (data?.error) {
                setError(data.error);
                return;
            }

            toast.success("Staff account created successfully!");

            // Call parent's onSuccess callback to refetch data
            if (onSuccess) {
                await onSuccess();
            }

            closeModal();
        } catch (error: any) {
            console.error('Failed to create staff:', error);
            setError(error.message || "An error occurred while creating staff");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <>
            {/* OPEN MODAL BUTTON */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                    onClick={openModal}
                    className="
            cursor-pointer px-4 py-2 rounded-md font-medium text-sm
            transition-all flex items-center gap-2
            text-gray-800 shadow-sm
            hover:bg-gray-100
        "
                >
                    Create Staff
                </button>
            </div>

            {/* MODAL */}
            <dialog id={modalId} className="modal">
                <div className="modal-box max-w-md">

                    <h3 className="font-bold text-lg mb-4">Create Staff Account</h3>

                    {/* FORM CONTENT */}
                    <div className="space-y-4">

                        {/* USERNAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Enter username"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Enter password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setError('')}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <div className="pt-2">
                            <button
                                onClick={(e) => handleSubmit(e as any)}
                                disabled={isLoading}
                                className="btn  w-full"
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    'Create Staff'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={closeModal}
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                {/* BACKDROP */}
                <div className="modal-backdrop" onClick={closeModal}></div>
            </dialog>
        </>
    );
}