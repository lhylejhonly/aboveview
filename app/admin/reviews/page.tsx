import { AdminReviews } from '@/components/admin/AdminReviews';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function ReviewsPage() {
  return <AdminLayout title="Reviews" description="Monitor and moderate customer feedback"><AdminReviews /></AdminLayout>;
}
