import Users from "@/models/User.Model";
import connectDb from "@/utils/connectDb";

export async function GET() {
    await connectDb();

    const totalUsers = await Users.countDocuments({role:'member'});
    const activeUsers = await Users.countDocuments({ activated: true });

    // Count members registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registeredToday = await Users.countDocuments({
        createdAt: { $gte: today }
    });

    return Response.json({
        totalUsers,
        activeUsers,
        registeredToday
    });
}
