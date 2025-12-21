import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import connectDb from "@/utils/connectDb";
import TransactionUser from "@/models/TransactionUserModel";
import Users from "@/models/User.Model";

export const GET = async (req: Request) => {
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

        // Get all transactions
        const getAllTransactions = await TransactionUser.find()
            .populate({
                path: 'userId',
                select: 'username'
            });

        // Get user statistics
        const totalUsers = await Users.countDocuments({ role: 'member' });
        const activeUsers = await Users.countDocuments({ activated: true });

        // Count members registered today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const registeredToday = await Users.countDocuments({
            createdAt: { $gte: today }
        });

        // Return combined data
        return NextResponse.json({
            transactions: getAllTransactions,
            userStats: {
                totalUsers,
                activeUsers,
                registeredToday
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
};