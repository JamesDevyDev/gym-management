import { create } from 'zustand'

interface StaffStore {
    getMembers: (page: any) => Promise<any>
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
    }
}))

export default useStaffStore