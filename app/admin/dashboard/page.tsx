import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function DashboardPage() {
  return <AdminLayout title="Dashboard" description="A quick view of your store performance"><AdminDashboard /></AdminLayout>;
}

