import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function SettingsPage() {
  return <AdminLayout title="Settings" description="Configure your store and admin preferences"><AdminSettings /></AdminLayout>;
}

