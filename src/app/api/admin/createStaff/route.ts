import connectDb from "@/utils/connectDb"
import Users from "@/models/User.Model"
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/utils/verifyUser"

export const POST = async (request: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        // Check if user exists and has admin role
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json(
                { error: "You are not allowed to do this." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { username, password } = body;

        const ifExist = await Users.findOne({ username });
        if (ifExist) {
            return NextResponse.json(
                { error: "Username already exists." },
                { status: 400 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Users({
            username,
            password: hashedPassword,
            role: 'staff',
        });

        await newUser.save()

        return NextResponse.json(newUser);

    } catch (error: any) {
        console.error("Error in creating user:", error);

        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
};
