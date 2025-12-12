import { create } from 'zustand'

interface AdminStore {
    getAllUsers: () => Promise<any>
    createStaff: ({ username, password }: { username: any, password: any }) => Promise<any>
    deleteStaff: (selectedId: any) => Promise<any>
    getAdminLogs: (params: any) => Promise<any>
}

const useAdminStore = create<AdminStore>((set, get) => ({
    getAllUsers: async () => {
        try {
            const res = await fetch(`/api/admin/getAllUsers`)
            if (!res.ok) return { error: 'something wrong with AdminStore/getAllUsers' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    createStaff: async ({ username, password }: { username: any, password: any }) => {
        try {
            const res = await fetch(`/api/admin/createStaff`, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            })

            const data = await res.json()
            if (data.error) return { error: data.error }
            return data

        } catch (error) {
            console.log(error)
        }
    },
    deleteStaff: async (selectedId: any) => {
        try {
            const response = await fetch('/api/admin/deleteStaff', {
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
    getAdminLogs: async (params: any) => {
        try {
            const response = await fetch(`/api/admin/logs/getAdminLogs?${params}`, {
                method: 'GET',
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    message: data.error || 'Failed to GET Admin Logs'
                };
            }

            return {
                data
            };
        } catch (error: any) {
            console.error('Error getting Admin Logs:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while getting Admin Logs'
            };
        }
    },

}))

export default useAdminStore