import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

export const GET = async () => {
    try {
        await connectDb()
        const authUser = await getAuthenticatedUser()
        if (authUser?.role !== 'staff') return NextResponse.json("You are not allowed to do this.", { status: 403 })
        const getAllUsers = await Users.find({ role: 'member' })

        return NextResponse.json(getAllUsers)
    } catch (error) {
        return NextResponse.json(`Internal Server Error ${error}`, { status: 500 })
    }
}