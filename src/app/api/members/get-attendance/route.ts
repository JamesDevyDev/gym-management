import { NextResponse } from "next/server";
import StaffLogs from "@/models/StaffLogs.Model";
import connectDb from "@/utils/connectDb";
import Users from "@/models/User.Model"; // keep imported so populate can register the model
import { getAuthenticatedUser } from "@/utils/verifyUser";

export const GET = async (req: Request) => {
    try {
        await connectDb();

        const authUser: any = await getAuthenticatedUser();

        if (!authUser || authUser.role !== 'member') {
            return NextResponse.json(
                { error: "Access denied. Members only." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const start = new Date(searchParams.get('start') || '');
        const end = new Date(searchParams.get('end') || '');

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return NextResponse.json(
                { error: "Valid 'start' and 'end' ISO dates are required." },
                { status: 400 }
            );
        }

        const query = {
            user: authUser._id,
            createdAt: { $gte: start, $lt: end },
        };

        const logs = await StaffLogs.find(query)
            .populate("adminId", "username")
            .sort({ createdAt: 1 })
            .limit(500)
            .lean();

        return NextResponse.json({
            logs,
            totalLogs: logs.length,
        });

    } catch (error) {
        console.error("Error GET member attendance:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
};