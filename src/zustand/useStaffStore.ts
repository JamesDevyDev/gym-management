import { create } from 'zustand'

interface StaffStore {
    getMembers: (page: any) => Promise<any>
    editMembers: (selectedId: any, username: any, email: any, activated: any) => Promise<any>
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
    editMembers: async (selectedId: any, username: any, email: any, activated: any) => {
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
                message: data.message || 'Member updated successfully',
                user: data.user
            };
        } catch (error: any) {
            console.error('Error editing member:', error);
            return {
                success: false,
                message: error.message || 'An error occurred while updating member'
            };
        }
    },

}))

export default useStaffStore