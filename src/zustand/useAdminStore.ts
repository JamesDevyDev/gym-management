import { create } from 'zustand'

interface AdminStore {
    getAllUsers: () => Promise<any>
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
    }
}))

export default useAdminStore