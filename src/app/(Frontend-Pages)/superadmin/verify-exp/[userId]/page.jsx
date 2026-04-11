import SuperSide from '@/app/components/SuperAdmin.js/SuperSide';
import Header from '@/app/components/SuperAdmin.js/SuperHeader';
import VerifyExperiencePage from '@/app/components/SuperAdmin.js/WorkExp';

export default function Packages() {
  return (
    <div style={{ display: 'flex' }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Current User' }} className="h-50 absolute" />
        <VerifyExperiencePage />
      </div>
    </div>
  );
}




