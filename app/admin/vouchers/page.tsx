import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSettings } from '@/components/admin/AdminSettings';

export default function VouchersPage() {
  return <AdminLayout title="Vouchers" description="Create and manage customer discount vouchers"><AdminSettings mode="voucher" /></AdminLayout>;
}
