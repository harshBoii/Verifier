import SuperSide from "@/app/components/SuperAdmin.js/SuperSide";
import Header from '@/app/components/SuperAdmin.js/SuperHeader';
import RolesPermissionsPage from "@/app/components/SuperAdmin.js/RolesPermissionsPage";

export default function RolesPage() {
  return (
    <div style={{ display: 'flex' }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Super Admin' }} />
        <div style={{ padding: '20px' }}>
          <RolesPermissionsPage />
        </div>
      </div>
    </div>
  );
}




