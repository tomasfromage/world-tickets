import { Page } from '@/components/PageLayout';
import { Pay } from '@/components/Pay';
import { Transaction } from '@/components/Transaction';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { ViewPermissions } from '@/components/ViewPermissions';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default function Home() {
  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Home"
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <UserInfo />
        <Verify />
        <Pay />
        <Transaction />
        <ViewPermissions />
      </Page.Main>
    </>
  );
} 