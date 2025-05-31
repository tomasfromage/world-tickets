import { useState, useEffect } from 'react';
import { createPublicClient, http, defineChain } from 'viem';
import { Event } from '@/types/events';
import TicketNFTABI from '@/abi/TicketNFT.json';

interface UseEventsProps {
  contractAddress: string;
}

// Define WorldChain Sepolia testnet
const worldchainSepolia = defineChain({
  id: 4801,
  name: 'WorldChain Sepolia',
  network: 'worldchain-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Worldcoin',
    symbol: 'WLD',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
    public: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldChain Sepolia Explorer',
      url: 'https://worldchain-sepolia.blockscout.com',
    },
  },
  testnet: true,
});

// Type for smart contract getAllEvents return value
type ContractEvent = {
  id: bigint;
  name: string;
  description: string;
  date: bigint;
  location: string;
  ticketPrice: bigint;
  totalTickets: bigint;
  soldTickets: bigint;
  vendor: string;
  eventType: string;
};

export function useEvents({ contractAddress }: UseEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client for reading from blockchain
  const client = createPublicClient({
    chain: worldchainSepolia,
    transport: http('https://worldchain-sepolia.g.alchemy.com/public'),
  });

  // Load events from blockchain
  const loadEvents = async () => {
    if (!contractAddress) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Get all events using getAllEvents function
      const contractEvents = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: TicketNFTABI,
        functionName: 'getAllEvents',
        args: [],
      }) as ContractEvent[];

      // Map contract events to Event objects
      const eventsFromContract: Event[] = contractEvents.map((contractEvent) => ({
        id: Number(contractEvent.id),
        name: contractEvent.name,
        description: contractEvent.description,
        date: Number(contractEvent.date),
        location: contractEvent.location,
        ticketPrice: (Number(contractEvent.ticketPrice) / 1e18).toString(), // Convert from Wei
        totalTickets: Number(contractEvent.totalTickets),
        soldTickets: Number(contractEvent.soldTickets),
        vendor: contractEvent.vendor,
        eventType: contractEvent.eventType as "Conference" | "Sport" | "Concert" | "Hackathon" | "Other",
      }));

      setEvents(eventsFromContract);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events from blockchain. Error: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new event to local state
  const addEvent = (newEvent: Event) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Load events on mount and contract address change
  useEffect(() => {
    loadEvents();
  }, [contractAddress]);

  return {
    events,
    isLoading,
    error,
    refreshEvents: loadEvents,
    addEvent,
  };
} 