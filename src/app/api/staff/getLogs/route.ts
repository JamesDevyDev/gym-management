import { NextResponse } from "next/server";
import StaffLogs from "@/models/StaffLogs.Model";
import connectDb from "@/utils/connectDb";
import Users from "@/models/User.Model";

export const GET = async (req: Request) => {
    try {
        await connectDb();

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const searchTerm = searchParams.get('search') || '';
        const dateFilter = searchParams.get('date') || '';
        const quickFilter = searchParams.get('quickFilter') || ''; // today, week, month
        const startTime = searchParams.get('startTime') || '';
        const endTime = searchParams.get('endTime') || '';

        // Build query
        const query: any = {};

        // Search filter (searches both admin and user usernames)
        if (searchTerm) {
            const users = await Users.find({
                username: { $regex: searchTerm, $options: 'i' }
            }).select('_id');

            const userIds = users.map(user => user._id);

            query.$or = [
                { adminId: { $in: userIds } },
                { user: { $in: userIds } }
            ];
        }

        // Quick date filters (today, week, month)
        if (quickFilter) {
            const now = new Date();
            let startDate = new Date();

            switch (quickFilter) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
            }

            query.createdAt = {
                $gte: startDate,
                $lte: now
            };
        }
        // Specific date filter
        else if (dateFilter) {
            const startDate = new Date(dateFilter);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(dateFilter);
            endDate.setHours(23, 59, 59, 999);

            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Time range filter
        if ((dateFilter || quickFilter === 'today') && (startTime || endTime)) {
            const baseDate = dateFilter ? new Date(dateFilter) : new Date();

            if (startTime) {
                const [hours, minutes] = startTime.split(':');
                const startDateTime = new Date(baseDate);
                startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                query.createdAt = { ...query.createdAt, $gte: startDateTime };
            }

            if (endTime) {
                const [hours, minutes] = endTime.split(':');
                const endDateTime = new Date(baseDate);
                endDateTime.setHours(parseInt(hours), parseInt(minutes), 59, 999);
                query.createdAt = { ...query.createdAt, $lte: endDateTime };
            }
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Get total count
        const totalLogs = await StaffLogs.countDocuments(query);
        const totalPages = Math.ceil(totalLogs / limit);

        // Fetch logs
        const logs = await StaffLogs.find(query)
            .populate("adminId", "username")
            .populate("user", "username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            logs,
            currentPage: page,
            totalPages,
            totalLogs
        });

    } catch (error) {
        console.error("Error GET StaffLogs:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
};
