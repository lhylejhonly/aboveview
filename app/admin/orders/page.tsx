import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOrders } from '@/components/admin/AdminOrders';

export default function OrdersPage() {
  return <AdminLayout title="Orders" description="Review and manage customer orders"><AdminOrders /></AdminLayout>;
}
