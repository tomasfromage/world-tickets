import { redirect } from 'next/navigation';

export default function Home() {
  // Přesměruj na hlavní stránku aplikace
  redirect('/home');
}
