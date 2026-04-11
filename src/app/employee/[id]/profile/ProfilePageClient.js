'use client';

import dynamic from 'next/dynamic';

const UserProfilePage = dynamic(() => import('@/app/components/UserDashboard/UserProfilePage'), { ssr: false });
const UserSideBar = dynamic(() => import('@/app/components/UserDashboard/UserSideBar'), { ssr: false });
const UserSearchBar = dynamic(() => import('@/app/components/UserDashboard/UserSearchBar'), { ssr: false });

export default function ProfilePageClient({ profileUserId, loggedInUser }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8' }}>
      <UserSideBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 30px 0 30px' }}>
          <UserSearchBar user={loggedInUser} />
        </div>
        <UserProfilePage id={profileUserId} />
      </div>
    </div>
  );
}
