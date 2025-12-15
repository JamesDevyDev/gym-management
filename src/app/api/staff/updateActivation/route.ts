import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
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
        const { selectedId, activated, duration, startTime } = body;

        console.log(selectedId, activated, duration, startTime);

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

            updateData.activated = true;
            updateData.duration = new Date(duration);
            
            if (startTime) {
                updateData.startTime = new Date(startTime);
            }
        }

        // Run Update
        const updatedUser = await Users.findByIdAndUpdate(
            selectedId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        // ADMIN LOGS
        const action = activated 
            ? `Activated member (expires: ${new Date(duration).toLocaleDateString()})`
            : "Deactivated member";

        await AdminLogs.create({
            userId: updatedUser._id,     // user being edited
            staffId: authUser._id,       // staff performing action
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