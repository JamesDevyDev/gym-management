import connectDb from "@/utils/connectDb"
import Users from "@/models/User.Model"
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server"
import QRCode from "qrcode"

//Logs in AdminLogs
import AdminLogs from "@/models/AdminLogs.Model"

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

    const ifExist = await Users.findOne({ username })
    if (ifExist) {
        return NextResponse.json("Username already exists.", { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 1️⃣ Save user FIRST
    const newUser = new Users({
        username,
        password: hashedPassword,
        email
    })
    await newUser.save()

    // 2️⃣ Generate QR that contains the MongoDB ID
    const qrData = JSON.stringify({
        id: newUser._id.toString(),
        username,
        email
    })

    const qrCodeBase64 = await QRCode.toDataURL(qrData)

    // 3️⃣ Update user with QR code
    newUser.qrCode = qrCodeBase64
    await newUser.save()


    // ADMIN Logs register
    await AdminLogs.create({
        userId: newUser._id,
        action: "User Registered"
    })
    return NextResponse.json(newUser)
}
