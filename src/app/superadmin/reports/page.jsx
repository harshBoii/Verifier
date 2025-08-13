import SuperSide from "@/app/components/SuperAdmin.js/SuperSide";
import Header from "@/app/components/Dashboard/Header";
import Report from "@/app/components/Dashboard/Report";

export default function RolesPage() {
  return (
    <div style={{ display: 'flex' }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Super Admin' }} />
        <div style={{ padding: '20px' }}>
          <Report />
        </div>
      </div>
    </div>
  );
}




