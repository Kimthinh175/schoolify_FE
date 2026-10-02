import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { ClassStatus } from '@/types';

/** Nhãn + màu badge cho ClassStatus (ERD: Class.status) */
export const CLASS_STATUS_META: Record<
  ClassStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  ACTIVE: { label: 'Đang học', variant: 'success' },
  UPCOMING: { label: 'Sắp mở', variant: 'warning' },
  PAUSED: { label: 'Tạm dừng', variant: 'secondary' },
  COMPLETED: { label: 'Đã kết thúc', variant: 'outline' },
  CANCELLED: { label: 'Đã huỷ', variant: 'danger' },
};
