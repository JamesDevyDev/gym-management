import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";

export const GET = async () => {
    const user = await getAuthenticatedUser()
    if (user?.error) return NextResponse.json('User is not authenticated or invalid token.', { status: 400 })

    return NextResponse.json(user)
}