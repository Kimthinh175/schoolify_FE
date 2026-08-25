import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
