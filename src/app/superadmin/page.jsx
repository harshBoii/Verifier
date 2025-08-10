import SuperSide from '../components/SuperAdmin.js/SuperSide';
import Header from '../components/Dashboard/Header';
import CompaniesPage from '../components/SuperAdmin.js/CompaniesPage';

export default function Companies() {
  return (
    <div style={{ display: 'flex' }}>
      <SuperSide />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Super Admin' }} />
        <CompaniesPage />
      </div>
    </div>
  );
}