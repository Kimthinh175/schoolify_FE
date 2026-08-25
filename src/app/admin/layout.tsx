import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
