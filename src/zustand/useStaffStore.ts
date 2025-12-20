import { create } from 'zustand'

interface StaffStore {
    getMembers: (page: any) => Promise<any>
    editMembers: (id: string, username: string, email: string) => Promise<any>
    updateActivation: (id: string, activated: boolean, duration: string, startTime: string, amount: number, paymentMethod: string) => Promise<any>
    deleteMembers: (selectedId: any) => Promise<any>
    scanQr: (id: string) => Promise<any>
    getLogs: (page: any) => Promise<any>
}

const useStaffStore = create<StaffStore>((set, get) => ({
    getMembers: async (page: any) => {
        try {
            const res = await fetch(`/api/staff/getMembers?page=${page}`)
            if (!res.ok) return { error: 'something wrong with StaffStore/getMembers' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    editMembers: async (id: string, username: string, email: string) => {
        try {
            const response = await fetch('/api/staff/editMember', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedId: id,
                    username,
                    email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.error || 'Failed to update member'
                };
            }

            return {
                success: true,
                message: data.message || 'Member UPDATED successfully',
                user: data.user
            };
        } catch (error: any) {
            console.error('Error EDITING member:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while updating member'
            };
        }
    },
    updateActivation: async (id: string, activated: boolean, duration: string, startTime: string, amount: number, paymentMethod: string) => {
        try {
            const response = await fetch('/api/staff/updateActivation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedId: id,
                    activated,
                    duration,
                    startTime,
                    amount,
                    paymentMethod,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.error || 'Failed to update activation'
                };
            }

            return {
                success: true,
                message: data.message || 'Activation updated successfully',
                user: data.user
            };
        } catch (error: any) {
            console.error('Error updating activation:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while updating activation'
            };
        }
    },
    deleteMembers: async (selectedId: any) => {
        try {
            const response = await fetch('/api/staff/deleteMember', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.error || 'Failed to DELETE member'
                };
            }

            return {
                success: true,
                message: data.message || 'Member DELETED successfully',
                user: data.user
            };
        } catch (error: any) {
            console.error('Error editing member:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while DELETING member'
            };
        }
    },
    scanQr: async (id: string) => {
        try {
            const response = await fetch('/api/staff/scan-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            return {
                success: response.ok,
                message: data.message,
            };
        } catch (error: any) {
            console.error('Error SCANNING QR:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while scanning QR',
            };
        }
    },
    getLogs: async (page: any) => {
        try {
            const response = await fetch(`/api/staff/getLogs?page=${page}`);

            const data = await response.json();

            return data
        } catch (error: any) {
            console.error('Error GETTING LOGS:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while scanning QR',
            };
        }
    },

}))

export default useStaffStore