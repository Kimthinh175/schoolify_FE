import { PublicShell } from './PublicShell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/homepage/styles.css?v=20261104d" precedence="default" />
      <PublicShell>{children}</PublicShell>
    </>
  );
}

