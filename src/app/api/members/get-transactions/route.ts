import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import TransactionUser from "@/models/TransactionUserModel";
import connectDb from "@/utils/connectDb";

export const GET = async (req: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        if (!authUser || authUser?.role !== 'member') {
            return NextResponse.json(
                { error: "Access denied. Members only." },
                { status: 403 }
            );
        }

        // Fetch all transactions for the logged-in user
        const transactions = await TransactionUser.find({ userId: authUser._id })
            .populate('staffId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Format transactions for frontend
        const formattedTransactions = transactions.map((transaction: any) => ({
            id: transaction._id.toString(),
            memberName: authUser.name,
            membershipType: `${transaction.membershipDuration} month${transaction.membershipDuration > 1 ? 's' : ''}`,
            amount: transaction.amount,
            paymentDate: transaction.paymentDate,
            dueDate: transaction.expiryDate,
            reference: transaction.reference,
            paymentMethod: transaction.paymentMethod,
            staffName: transaction.staffId?.name || 'Unknown',
            notes: transaction.notes
        }));

        return NextResponse.json(
            {
                transactions: formattedTransactions,
                totalSpent: formattedTransactions.reduce((sum, t) => sum + t.amount, 0),
                totalPayments: formattedTransactions.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
};