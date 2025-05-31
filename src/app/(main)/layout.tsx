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
      <Page.Footer className="px-0 fixed w-full bg-white bottom-0 border-t border-gray-200 pb-safe">
        <Navigation />
      </Page.Footer>
    </Page>
  );
} 