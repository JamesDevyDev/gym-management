import { create } from 'zustand'

interface AuthStore {
    authUser: any,
    getAuthUserFunction: () => Promise<void>
    RegisterFunction: ({ username, password, email }: { username: string, password: string, email: string }) => Promise<any>,
    LoginFunction: ({ username, password }: { username: string, password: string }) => Promise<any>,
    LogoutFunction: () => Promise<any>,
}

const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    getAuthUserFunction: async () => {
        try {
            let res = await fetch('/api/users/me')
            if (!res.ok) return { error: 'Error User is not logged in or invalid token.' }
            const data = await res.json()
            set({ authUser: data })
            //on for debugging
            // console.log(data) 
            return data
        } catch (error) {
            console.log(error)
        }
    },
    RegisterFunction: async ({ username, password, email }: { username: string, password: string, email: string }) => {
        try {
            let res = await fetch('/api/users/register', {
                method: 'POST',
                body: JSON.stringify({ username, password, email })
            })
            if (!res.ok) return { error: 'User already exist or error.' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    LoginFunction: async ({ username, password }: { username: string, password: string }) => {
        try {
            let res = await fetch('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            })
            if (!res.ok) return { error: 'User does not exist or error.' }
            const data = await res.json()
            return data
        } catch (error) {
            console.log(error)
        }
    },
    LogoutFunction: async () => {
        try {
            let res = await fetch('/api/users/logout')
            if (!res.ok) return { error: 'Error logout.' }
            const data = await res.json()
            set({ authUser: null });
            return data
        } catch (error) {
            console.log(error)
        }
    }
}))

export default useAuthStore