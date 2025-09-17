'use client'
import SuperSide from '@/app/components/SuperAdmin.js/SuperSide';
import Header from '@/app/components/SuperAdmin.js/SuperHeader';
import LoadingGlass from '@/app/components/LoadingGlass';
import UnverifiedEmployeesPage from '@/app/components/Dashboard/agent';
export default function Agents() {
  return (
    <div style={{ display: 'flex', minHeight:"100vh" }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Super Admin' }} />
        <div className='text-[90px] text-center align-center'>
            <UnverifiedEmployeesPage />
        </div>
      </div>
    </div>
  );
}