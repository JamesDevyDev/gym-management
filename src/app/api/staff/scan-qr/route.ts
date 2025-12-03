import connectDb from "@/utils/connectDb";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
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
        const { id } = body;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "ID is required" }),
                { status: 400 }
            );
        }

        console.log("Received ID from QR scan:", id);
        console.log("The admin who did this is ", authUser)
        // You can now use this `id` to query your database, update records, etc.

        return NextResponse.json(
            { message: "Success", receivedId: id },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("POST request failed:", error);

        return NextResponse.json(
            { message: "Failed", error: error.message || error },
            { status: 500 }
        );

    }
};
