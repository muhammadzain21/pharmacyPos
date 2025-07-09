import { createHashRouter } from 'react-router-dom';
import App from '@/App';
import Index from '@/pages/Index';
import { MedicineManagementPage } from '@/pages/MedicineManagementPage';
import { POSPage } from '@/pages/POSPage';
import { ReturnsPage } from '@/pages/ReturnsPage';
import { StaffAttendancePage } from '@/pages/StaffAttendancePage';
import { SupplierManagementPage } from '@/pages/SupplierManagementPage';
import LoginPage from '@/pages/LoginPage';
import RequireAuth from '@/components/RequireAuth';
import { Outlet } from 'react-router-dom';

const AppLayout = () => <App><Outlet /></App>;

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { path: '/', element: <Index /> },
      { path: '/dashboard', element: <Index /> },
      { path: '/medicines', element: <MedicineManagementPage /> },
      { path: '/pos', element: <POSPage /> },
      { path: '/returns', element: <ReturnsPage /> },
      { path: '/staff', element: <StaffAttendancePage /> },
      { path: '/suppliers', element: <SupplierManagementPage /> },
    ],
  },
]);
