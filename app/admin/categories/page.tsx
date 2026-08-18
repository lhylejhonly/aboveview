import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function CategoriesPage() {
  return <AdminLayout title="Categories" description="Manage collections and see product assignments"><CategoryManagement /></AdminLayout>;
}

