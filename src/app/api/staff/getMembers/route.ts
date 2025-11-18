import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

export const GET = async (req: Request) => {
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

        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page")) || 1;

        const limit = 10;
        const skip = (page - 1) * limit;

        // Total members
        const totalMembers = await Users.countDocuments({ role: "member" });

        // Total activated members
        const totalActivated = await Users.countDocuments({ role: "member", activated: true });

        // Total inactive members
        const totalInactive = totalMembers - totalActivated;

        // Fetch paginated members
        const members = await Users.find({ role: "member" })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // or { _id: -1 } if no createdAt

        const totalPages = Math.ceil(totalMembers / limit);

        return NextResponse.json({
            members,
            currentPage: page,
            totalPages,
            totalMembers,
            totalActivated,
            totalInactive
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
};
