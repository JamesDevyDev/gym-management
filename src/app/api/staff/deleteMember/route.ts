import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

//
import AdminLogs from "@/models/AdminLogs.Model";

export const DELETE = async (req: Request) => {
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

        const { selectedId } = body;

        //Validate
        if (!selectedId) {
            return NextResponse.json(
                { error: "Member ID is required" },
                { status: 400 }
            );
        }

        // Find the user
        const user = await Users.findByIdAndDelete(selectedId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Prevent staff from editing other staff members
        if (user.role === 'staff') {
            return NextResponse.json(
                { error: "You cannot DELETE staff members" },
                { status: 403 }
            );
        }


        //Admin Logs
        await AdminLogs.create({
            userId: user._id,
            staffId: authUser._id,
            action: "Deleted member"
        });

        return NextResponse.json(
            {
                message: "Member DELETED successfully",
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error DELETING member:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
};