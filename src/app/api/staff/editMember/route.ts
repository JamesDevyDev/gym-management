import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

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
        const { selectedId, username, email, activated, duration } = body;

        console.log(selectedId, username, email, activated, duration)

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

        // Prevent staff from editing staff accounts
        if (user.role === "staff") {
            return NextResponse.json(
                { error: "You cannot EDIT staff members" },
                { status: 403 }
            );
        }

        // --- Username Check ---
        if (username && username !== user.username) {
            const existingUser = await Users.findOne({
                username,
                _id: { $ne: selectedId }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "Username is already taken" },
                    { status: 409 }
                );
            }
        }

        // --- Email Check ---
        if (email && email !== user.email) {
            const existingEmail = await Users.findOne({
                email,
                _id: { $ne: selectedId }
            });

            if (existingEmail) {
                return NextResponse.json(
                    { error: "Email is already taken" },
                    { status: 409 }
                );
            }
        }

        // -----------------------------------------
        // 🔥 Update user fields INCLUDING duration
        // -----------------------------------------
        const updateData: any = {};

        if (username) updateData.username = username;
        if (email) updateData.email = email;

        // When deactivating, REMOVE expiry date
        if (activated === false) {
            updateData.activated = false;
            updateData.duration = null;
        }

        // When activating, SET expiry date
        if (activated === true) {
            updateData.activated = true;

            if (duration) {
                updateData.duration = new Date(duration);
            }
        }

        // Run Update
        const updatedUser = await Users.findByIdAndUpdate(
            selectedId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return NextResponse.json(
            {
                message: "Member updated successfully",
                user: updatedUser,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error EDITING member:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
};
