import UserProfilePage from '@/app/components/UserDashboard/UserProfilePage';
import UserSideBar from '@/app/components/UserDashboard/UserSideBar';
import UserSearchBar from '@/app/components/UserDashboard/UserSearchBar';

// Import necessary libraries for server-side data fetching
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/app/lib/prisma';

/**
 * A server-side helper function to get the currently logged-in user.
 * This function securely reads the session cookie and fetches user data.
 */
async function getLoggedInUser() {
  const token = cookies().get('token')?.value;
  if (!token) {
    return null; // No user is logged in
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
        role: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to verify token or fetch user:', error);
    return null; // Invalid token or user not found
  }
}

/**
 * This is now an async Server Component.
 */
export default async function ProfilePage({ params }) {
  // The 'id' of the profile being viewed
  const { id } = params;

  // Fetch the data for the currently logged-in user for the header
  const loggedInUser = await getLoggedInUser();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8' }}>
      <UserSideBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 30px 0 30px' }}>
          {/* Pass the dynamic loggedInUser object to the Header */}
          <UserSearchBar user={loggedInUser} />
        </div>
        {/* Pass the dynamic ID from the URL to the main profile component */}
        <UserProfilePage id={id} />
      </div>
    </div>
  );
}
