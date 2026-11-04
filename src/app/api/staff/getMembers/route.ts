import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/verifyUser";
import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

const SORTS: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { username: 1 },
    name_desc: { username: -1 },
};

export const GET = async (req: Request) => {
    try {
        await connectDb();

        const authUser = await getAuthenticatedUser();

        if (!authUser || authUser?.role !== 'staff') {
            return NextResponse.json(
                { error: "You are not allowed to do this." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const search = (searchParams.get("search") || "").trim();
        const status = searchParams.get("status") || "all"; // all | active | inactive
        const sort = searchParams.get("sort") || "newest";

        const limit = 10;
        const skip = (page - 1) * limit;

        // Build the filter
        const filter: any = { role: "member" };

        if (search) {
            // Escape regex characters so "a+b" or "(" can't break the query
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { username: { $regex: escaped, $options: "i" } },
                { email: { $regex: escaped, $options: "i" } },
            ];
        }

        if (status === "active") filter.activated = true;
        else if (status === "inactive") filter.activated = { $ne: true };

        // Global stats (unfiltered, for the cards)
        const totalMembers = await Users.countDocuments({ role: "member" });
        const totalActivated = await Users.countDocuments({ role: "member", activated: true });
        const totalInactive = totalMembers - totalActivated;

        // Filtered results
        const totalResults = await Users.countDocuments(filter);
        const totalPages = Math.max(Math.ceil(totalResults / limit), 1);

        const members = await Users.find(filter)
            .collation({ locale: "en" }) // case-insensitive name sorting
            .sort(SORTS[sort] || SORTS.newest)
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            members,
            currentPage: page,
            totalPages,
            totalMembers,
            totalActivated,
            totalInactive,
            totalResults,
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
};