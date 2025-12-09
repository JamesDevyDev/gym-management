import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

export const DELETE = async (req: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        // Check if user exists and has admin role
        if (!authUser || authUser?.role !== 'admin') {
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

        return NextResponse.json(
            {
                message: "staff DELETED successfully",
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error DELETING staff:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
};