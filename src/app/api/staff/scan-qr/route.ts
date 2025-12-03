import connectDb from "@/utils/connectDb";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import { NextResponse } from "next/server";
import Users from "@/models/User.Model";
import Logs from "@/models/Logs.Model"; // Import the Logs model

export const POST = async (req: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        // Check if user exists and has staff role
        if (!authUser || authUser?.role !== 'staff') {
            return NextResponse.json(
                { error: "You are not allowed to do this." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { message: "ID is required" },
                { status: 400 }
            );
        }

        // console.log("Received ID from QR scan:", id);
        // console.log("The admin who did this is:", authUser._id);

        // Find the user whose QR was scanned
        const userInfo = await Users.findById(id);
        if (!userInfo) {
            return NextResponse.json(
                { message: "User is not found" },
                { status: 404 }
            );
        }

        // Create a log entry
        const logEntry = await Logs.create({
            adminId: authUser._id,  // Staff member who scanned
            user: id                // User whose QR was scanned
        });

        // console.log("Log created:", logEntry);

        return NextResponse.json(
            {
                message: "Success",
                receivedId: id,
                userInfo: {
                    name: userInfo.name,
                    email: userInfo.email
                    // Add other safe fields you want to return
                },
                logId: logEntry._id
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("POST request failed:", error);

        return NextResponse.json(
            { message: "Failed", error: error.message || error },
            { status: 500 }
        );
    }
};