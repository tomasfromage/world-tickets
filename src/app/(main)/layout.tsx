import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Page>
      {children}
      <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer>
    </Page>
  );
} 