import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { EventsList } from '@/components/EventsList';
import { BuyTicket } from '@/components/BuyTicket';
import { TicketVerification } from '@/components/TicketVerification';
import { Event } from '@/types/events';
import { Marble, TopBar, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { TicketsComponent } from '@/components/TicketsComponent';

// Mock data - v reálné aplikaci by se načítalo z API/smart contractu
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    name: 'ETH Global Hackathon Prague',
    description: 'Největší hackathon v České republice zaměřený na Ethereum ecosystem',
    date: Math.floor(Date.now() / 1000) + 86400 * 7, // za týden
    location: 'Praha, Česká republika',
    ticketPrice: '50',
    totalTickets: 500,
    soldTickets: 157,
    vendor: '0x1234567890123456789012345678901234567890',
    eventType: 'Hackathon',
  },
  {
    id: 2,
    name: 'World Cup Final Watch Party',
    description: 'Sledování finále mistrovství světa s komunitou',
    date: Math.floor(Date.now() / 1000) + 86400 * 3, // za 3 dny
    location: 'São Paulo, Brazílie',
    ticketPrice: '25',
    totalTickets: 200,
    soldTickets: 89,
    vendor: '0x2345678901234567890123456789012345678901',
    eventType: 'Sport',
  },
  {
    id: 3,
    name: 'Blockchain Conference 2024',
    description: 'Konference o budoucnosti blockchainu a decentralizovaných technologií',
    date: Math.floor(Date.now() / 1000) + 86400 * 14, // za 2 týdny
    location: 'Singapore',
    ticketPrice: '150',
    totalTickets: 1000,
    soldTickets: 432,
    vendor: '0x3456789012345678901234567890123456789012',
    eventType: 'Conference',
  },
];

export default async function TicketsPage() {
  const session = await auth();

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="🎫 Tickets"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <Marble src={session?.user.profilePictureUrl} className="w-12" />
            </div>
          }
        />
      </Page.Header>
      
      <Page.Main className="flex flex-col gap-4 mb-16">
        <TicketsComponent 
          events={MOCK_EVENTS}
          userAddress={session?.user?.walletAddress || ''}
        />
      </Page.Main>
    </>
  );
} 