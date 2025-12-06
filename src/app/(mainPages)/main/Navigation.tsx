'use client'
import { useEffect, useState } from 'react'
import { usePathname } from "next/navigation"
import useAuthStore from "@/zustand/useAuthStore"
import { Menu, Home, Camera, LogOut, Users, FileClock, UserStar } from "lucide-react"

const Navigation = () => {
    const { getAuthUserFunction, LogoutFunction } = useAuthStore()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        const fetchUser = async () => {
            const authUser = await getAuthUserFunction()
            setUser(authUser)
            setLoading(false)
        }
        fetchUser()
    }, [])

    return (
        <div className="drawer">
            {/* Make toggle a peer */}
            <input id="my-drawer-1" type="checkbox" className="drawer-toggle peer" />

            {/* Drawer content */}
            <div className="drawer-content">
                <label
                    htmlFor="my-drawer-1"
                    className="
                        w-[50px] h-[50px] bg-gray-300/40 text-black 
                        hover:bg-gray-400/70 flex items-center justify-center 
                        rounded-lg cursor-pointer transition
                        peer-checked:bg-gray-400/90
                        peer-checked:text-red-500
                    "
                >
                    <Menu className="w-6 h-6" />
                </label>
            </div>

            {/* Drawer sidebar */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-1" className="drawer-overlay"></label>
                <ul className="menu bg-gray-100 min-h-full w-80 p-4 flex flex-col justify-between shadow-lg shadow-gray-300/40">

                    <div>
                        {/* Logo */}
                        <div className="flex items-center justify-center">
                            <img
                                src='/icon/icon.png'
                                alt="Logo"
                                className="w-[100px] h-[100px] object-contain"
                            />
                        </div>

                        {/* User Info */}
                        {loading ? (
                            <div className="flex flex-col items-start mb-4 p-4 border-l-4 border-red-500 bg-red-100 rounded-lg animate-pulse">
                                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-red-300 rounded w-20"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start mb-4 p-4 border-l-4 border-red-500 bg-red-100 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-900">{user?.username}</h2>
                                <p className="text-sm text-red-500 font-medium">Role: {user?.role}</p>
                            </div>
                        )}

                        <div className="divider before:bg-red-300 after:bg-red-300"></div>

                        {/* Sidebar Links */}

                        {/* Admin Link */}
                        {user?.role === 'admin' && (
                            <li>
                                <a
                                    href='/main/admin/dashboard'
                                    className={`
                                        flex items-center gap-2 font-medium
                                        ${pathname.includes("/main/admin/dashboard")
                                            ? "text-red-500 font-semibold bg-red-100 border-l-4 border-red-500"
                                            : "text-gray-900 hover:text-red-500"
                                        }
                                    `}
                                >
                                    <Home className="w-5 h-5" /> Dashboard
                                </a>
                            </li>
                        )}
                        {user?.role === 'admin' && (
                            <li>
                                <a
                                    href='/main/admin/all-user'
                                    className={`
                                        flex items-center gap-2 font-medium
                                        ${pathname.includes("/main/admin/staff")
                                            ? "text-red-500 font-semibold bg-red-100 border-l-4 border-red-500"
                                            : "text-gray-900 hover:text-red-500"
                                        }
                                    `}
                                >
                                    <UserStar className="w-5 h-5" /> All Users
                                </a>
                            </li>
                        )}

                        {/* Staff Link */}
                        {user?.role === 'staff' && (
                            <li>
                                <a
                                    href='/main/staff/scan'
                                    className={`
                                        flex items-center gap-2 font-medium
                                        ${pathname.includes("/main/staff/scan")
                                            ? "text-red-500 font-semibold bg-red-100 border-l-4 border-red-500"
                                            : "text-gray-900 hover:text-red-500"
                                        }
                                    `}
                                >
                                    <Camera className="w-5 h-5" /> Scan
                                </a>
                            </li>
                        )}
                        {user?.role === 'staff' && (
                            <li>
                                <a
                                    href='/main/staff/logs'
                                    className={`
                                        flex items-center gap-2 font-medium
                                        ${pathname.includes("/main/staff/logs")
                                            ? "text-red-500 font-semibold bg-red-100 border-l-4 border-red-500"
                                            : "text-gray-900 hover:text-red-500"
                                        }
                                    `}
                                >
                                    <FileClock className="w-5 h-5" /> Logs
                                </a>
                            </li>
                        )}
                        {user?.role === 'staff' && (
                            <li>
                                <a
                                    href='/main/staff/members'
                                    className={`
                                        flex items-center gap-2 font-medium
                                        ${pathname.includes("/main/staff/members")
                                            ? "text-red-500 font-semibold bg-red-100 border-l-4 border-red-500"
                                            : "text-gray-900 hover:text-red-500"
                                        }
                                    `}
                                >
                                    <Users className="w-5 h-5" /> Members
                                </a>
                            </li>
                        )}


                        {/* Member Link */}
                        {user?.role === 'member' && (
                            <li>
                                <a
                                    className={`
                                        flex items-center gap-2 font-medium
                                        ${pathname.includes("/main/member")
                                            ? "text-red-500 font-semibold bg-red-100 border-l-4 border-red-500"
                                            : "text-gray-900 hover:text-red-500"
                                        }
                                    `}
                                >
                                    <Home className="w-5 h-5" /> Member
                                </a>
                            </li>
                        )}
                    </div>

                    {/* Logout */}
                    <li>
                        <a
                            onClick={() => {
                                LogoutFunction()
                                setTimeout(() => {
                                    window.location.href = '/'
                                }, 1000)
                            }}
                            className="flex items-center gap-2 text-gray-900 hover:text-red-500 font-medium cursor-pointer"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Navigation
