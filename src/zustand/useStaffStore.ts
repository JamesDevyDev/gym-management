import { create } from 'zustand'

interface StaffStore {
    getMembers: (page: any) => Promise<any>
    editMembers: (selectedId: any, username: any, email: any, activated: any, expiryDate?: any) => Promise<any>
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
    editMembers: async (selectedId: any, username: any, email: any, activated: any, expiryDate: any) => {
        try {
            const response = await fetch('/api/staff/editMember', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedId,
                    username,
                    email,
                    activated,
                    expiryDate
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