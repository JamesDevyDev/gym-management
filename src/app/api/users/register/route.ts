import connectDb from "@/utils/connectDb"
import Users from "@/models/User.Model"
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server"

export const POST = async (request: Request) => {
    await connectDb()

    const body = await request.json()
    const { username, password, email } = body

    if (username.length > 16) {
        return NextResponse.json("Username must be at most 16 characters long.", { status: 400 })
    }

    if (password.length < 6) {
        return NextResponse.json("Password must be at least 6 characters long.", { status: 400 })
    }

    const ifExist = await Users.findOne({ username: username })
    if (ifExist) {
        return NextResponse.json("Username already exists.", { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new Users({ username, password: hashedPassword, email })
    await newUser.save()

    return NextResponse.json(newUser)
}
