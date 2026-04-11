import dynamic from 'next/dynamic';

// Client-only components — skip SSR to prevent "window is not defined" crashes
const UserProfilePage = dynamic(() => import('@/app/components/UserDashboard/UserProfilePage'), { ssr: false });
const UserSideBar     = dynamic(() => import('@/app/components/UserDashboard/UserSideBar'),     { ssr: false });
const UserSearchBar   = dynamic(() => import('@/app/components/UserDashboard/UserSearchBar'),   { ssr: false });

// Import necessary libraries for server-side data fetching
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/app/lib/prisma';

/**
 * A server-side helper function to get the currently logged-in user.
 * This function securely reads the session cookie and fetches user data.
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

/**
 * This is now an async Server Component.
 */
export default async function ProfilePage({ params }) {
  const { id } = await params;
  const loggedInUser = await getLoggedInUser();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8' }}>
      <UserSideBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 30px 0 30px' }}>
          <UserSearchBar user={loggedInUser} />
        </div>
        <UserProfilePage id={id} />
      </div>
    </div>
  );
}