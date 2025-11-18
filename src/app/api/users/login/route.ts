import connectDb from "@/utils/connectDb"
import Users from "@/models/User.Model"
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server"

import jwt from 'jsonwebtoken'

const generateToken = ({ id }: { id: string }) => {
    const token = jwt.sign(
        { id: id },
        process.env.NEXT_JWT_SECRET!,
        { expiresIn: '7d' }
    )

    return token
}

export const POST = async (request: Request) => {
    await connectDb()

    const body = await request.json()
    const { username, password } = body

    const ifExist = await Users.findOne({ username: username })
    if (!ifExist) return NextResponse.json("User doesn't exist.", { status: 400 })
    const isMatched = await bcrypt.compare(password, ifExist.password)
    if (!isMatched) return NextResponse.json("Password does not match.", { status: 400 })

    const token = generateToken({ id: ifExist._id })

    const response = NextResponse.json(ifExist)

    response.cookies.set('jwt', token, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 14
    })

    return response
}