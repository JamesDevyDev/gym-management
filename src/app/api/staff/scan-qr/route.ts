import connectDb from "@/utils/connectDb";

export const POST = async (req: Request) => {
    try {
        await connectDb();

        // Parse the JSON body from the request
        const body = await req.json();

        // Extract the `id` from the body
        const { id } = body;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "ID is required" }),
                { status: 400 }
            );
        }

        console.log("Received ID from QR scan:", id);

        // You can now use this `id` to query your database, update records, etc.

        return new Response(
            JSON.stringify({ message: "Success", receivedId: id }),
            { status: 200 }
        );
    } catch (error: any) {
        console.error("POST request failed:", error);

        return new Response(
            JSON.stringify({ message: "Failed", error: error.message || error }),
            { status: 500 }
        );
    }
};
