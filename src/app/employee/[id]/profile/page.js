import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/app/lib/prisma';
import ProfilePageClient from './ProfilePageClient';

/**
 * Server-side helper: reads session cookie and fetches user data.
 */
async function getLoggedInUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePicture: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to verify token or fetch user:', error);
    return null;
  }
}

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const loggedInUser = await getLoggedInUser();

  return <ProfilePageClient profileUserId={id} loggedInUser={loggedInUser} />;
}
