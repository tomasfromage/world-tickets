import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  
  // Pokud je uživatel přihlášen, přesměruj na tickets
  if (session?.user) {
    redirect('/tickets');
  }

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🎫 Tickets</h1>
          <p className="text-gray-600 mb-6">
            Decentralizovaná platforma pro nákup a prodej vstupenek
          </p>
        </div>
        <AuthButton />
      </Page.Main>
    </Page>
  );
}
