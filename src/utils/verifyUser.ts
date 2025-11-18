import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from '@/models/User.Model';
import connectDb from './connectDb';

export const getAuthenticatedUser = async () => {
    await connectDb()

    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    if (!token) return { error: 'Error no cookies have found.' }

    try {
        const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET!) as { id: string };
        const user = await Users.findById(decoded.id).select('-password');
        if (!user) return { error: 'No users have found.' }
        return user;
    } catch (err) {
        throw new Error('Invalid token');
    }
};