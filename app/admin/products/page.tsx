import { ProductManagement } from '@/components/admin/ProductManagement';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function ProductsPage() {
  return <AdminLayout title="Products" description="Manage your catalog, inventory, and product status"><ProductManagement /></AdminLayout>;
}

