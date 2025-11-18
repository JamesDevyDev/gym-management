import { cookies } from "next/headers"
import { NextResponse } from "next/server";

export const GET = async () => {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get('jwt');
    if (!jwtCookie) return NextResponse.json("No cookies found", { status: 400 })

    const response = NextResponse.json('User logged out.')

    response.cookies.set('jwt', '',{
        httpOnly:true,
        secure: true,
        path :"/",
    })

    return response
}