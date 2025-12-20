import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import TransactionUser from "@/models/TransactionUserModel";
import connectDb from "@/utils/connectDb";
import AdminLogs from "@/models/AdminLogs.Model";

export const POST = async (req: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        if (!authUser || authUser?.role !== 'staff') {
            return NextResponse.json(
                { error: "You are not allowed to do this." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { selectedId, activated, duration, startTime, amount, paymentMethod } = body;

        console.log(selectedId, activated, duration, startTime, amount, paymentMethod);

        if (!selectedId) {
            return NextResponse.json(
                { error: "Member ID is required" },
                { status: 400 }
            );
        }

        const user = await Users.findById(selectedId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Prevent staff from modifying staff accounts
        if (user.role === "staff") {
            return NextResponse.json(
                { error: "You cannot modify staff members" },
                { status: 403 }
            );
        }

        const updateData: any = {};

        // When deactivating, REMOVE expiry date and start time
        if (activated === false) {
            updateData.activated = false;
            updateData.duration = null;
            updateData.startTime = null;
        }

        // When activating, SET expiry date and start time
        if (activated === true) {
            if (!duration) {
                return NextResponse.json(
                    { error: "Duration is required when activating member" },
                    { status: 400 }
                );
            }

            if (!amount) {
                return NextResponse.json(
                    { error: "Amount is required when activating member" },
                    { status: 400 }
                );
            }

            updateData.activated = true;
            updateData.duration = new Date(duration);
            
            const parsedStartTime = startTime ? new Date(startTime) : new Date();
            updateData.startTime = parsedStartTime;

            // Calculate membership duration in months
            const durationDate = new Date(duration);
            const monthsDiff = Math.round(
                (durationDate.getTime() - parsedStartTime.getTime()) / (1000 * 60 * 60 * 24 * 30)
            );

            // Generate unique reference number
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const reference = `MEM-${year}-${month}-${randomNum}`;

            // Create transaction record
            await TransactionUser.create({
                userId: selectedId,
                staffId: authUser._id,
                membershipDuration: monthsDiff,
                amount: amount,
                paymentDate: new Date(),
                startTime: parsedStartTime,
                expiryDate: durationDate,
                reference: reference,
                paymentMethod: paymentMethod || 'cash',
                notes: `Membership activated by ${authUser.name}`
            });
        }

        // Run Update
        const updatedUser = await Users.findByIdAndUpdate(
            selectedId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        // ADMIN LOGS
        const action = activated 
            ? `Activated member (expires: ${new Date(duration).toLocaleDateString()}, amount: ₱${amount})`
            : "Deactivated member";

        await AdminLogs.create({
            userId: updatedUser._id,
            staffId: authUser._id,
            action: action
        });

        return NextResponse.json(
            {
                message: "Activation status updated successfully",
                user: updatedUser,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating activation:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
};