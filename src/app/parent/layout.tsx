import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
