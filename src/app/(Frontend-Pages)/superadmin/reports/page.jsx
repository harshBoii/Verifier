import SuperSide from "@/app/components/SuperAdmin.js/SuperSide";
import Header from '@/app/components/SuperAdmin.js/SuperHeader';
import SuperadminDashboard from "@/app/components/SuperAdmin.js/SuperAdminReport";

export default function RolesPage() {
  return (
    <div style={{ display: 'flex' }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Super Admin' }} />
        <div style={{ padding: '20px' }}>
          <SuperadminDashboard />
        </div>
      </div>
    </div>
  );
}




