import connectDb from "@/utils/connectDb";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import { NextResponse } from "next/server";
import Users from "@/models/User.Model";
import StaffLogs from "@/models/StaffLogs.Model";

//

import AdminLogs from "@/models/AdminLogs.Model";

export const POST = async (req: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        // Make sure user is a staff
        if (!authUser || authUser.role !== "staff") {
            return NextResponse.json(
                { error: "You are not allowed to do this." },
                { status: 403 }
            );
        }



        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { message: "ID is required" },
                { status: 400 }
            );
        }

        // Find the user whose QR was scanned
        const userInfo = await Users.findById(id);
        if (!userInfo) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // ❌ If membership already inactive
        if (!userInfo.activated) {
            return NextResponse.json(
                { message: "The user membership expired or no longer exists." },
                { status: 403 }
            );
        }

        // ❗ AUTO-DEACTIVATE IF NO DURATION
        if (!userInfo.duration || userInfo.duration.trim() === "") {
            userInfo.activated = false;
            await userInfo.save();

            return NextResponse.json(
                { message: "User has no membership duration. Now set to inactive." },
                { status: 403 }
            );
        }

        // ❗ If expiryDate exists — check expiration
        if (userInfo.expiryDate) {
            if (new Date() > new Date(userInfo.expiryDate)) {
                userInfo.activated = false;
                await userInfo.save();

                return NextResponse.json(
                    { message: "The user membership is expired." },
                    { status: 403 }
                );
            }
        }

        //LOG +1 into staff scanned
        const staffThatScan = await Users.findById(authUser?._id)
        if (!staffThatScan) return NextResponse.json("There's no staff ID")
        staffThatScan.NumberOfScans = (staffThatScan.NumberOfScans || 0) + 1;
        await staffThatScan.save();

        // Create log entry
        const logEntry = await StaffLogs.create({
            adminId: authUser._id,
            user: id
        });

        // AdminLogs
        await AdminLogs.create({
            userId: userInfo._id,
            staffId: authUser._id,
            action: "Scanned QR"
        });

        return NextResponse.json(
            {
                message: "Success",
                receivedId: id,
                userInfo: {
                    name: userInfo.username,
                    email: userInfo.email
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
