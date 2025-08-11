'use client'
import SuperSide from '@/app/components/SuperAdmin.js/SuperSide';
import Header from '../../components/Dashboard/Header';
import LoadingGlass from '@/app/components/LoadingGlass';

export default function Agents() {
  return (
    <div style={{ display: 'flex', minHeight:"100vh" }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Super Admin' }} />
        <div className='text-[120px] text-center align-center'>
            <LoadingGlass className='-mt-100'/>
            <div>Agents Coming Soon .......</div>
        </div>
      </div>
    </div>
  );
}