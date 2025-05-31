import { useState, useEffect } from 'react';
import { createPublicClient, http, defineChain, isAddress } from 'viem';
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

  // Test blockchain connection
  const testConnection = async () => {
    try {
      console.log('Testing blockchain connection...');
      const blockNumber = await client.getBlockNumber();
      console.log('Current block number:', blockNumber);
      return true;
    } catch (err) {
      console.error('Blockchain connection test failed:', err);
      return false;
    }
  };

  // Check if contract exists at address
  const checkContractExists = async (address: string) => {
    try {
      console.log('Checking if contract exists at:', address);
      const bytecode = await client.getBytecode({
        address: address as `0x${string}`,
      });
      const exists = bytecode && bytecode !== '0x';
      console.log('Contract exists:', exists);
      return exists;
    } catch (err) {
      console.error('Error checking contract existence:', err);
      return false;
    }
  };

  // Load events from blockchain
  const loadEvents = async () => {
    if (!contractAddress) {
      setError('Contract address is not provided');
      setIsLoading(false);
      return;
    }

    // Validate contract address format
    if (!isAddress(contractAddress)) {
      setError('Invalid contract address format');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting events loading process...');
      console.log('Contract address:', contractAddress);
      console.log('Chain ID:', worldchainSepolia.id);

      // Test blockchain connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error('Cannot connect to WorldChain Sepolia network');
      }

      // Check if contract exists
      const contractExists = await checkContractExists(contractAddress);
      if (!contractExists) {
        throw new Error('Contract not found at the provided address. Make sure the contract is deployed on WorldChain Sepolia.');
      }

      console.log('Calling getAllEvents function...');
      
      // Get all events using getAllEvents function
      const contractEvents = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: TicketNFTABI,
        functionName: 'getAllEvents',
        args: [],
      }) as ContractEvent[];

      console.log('Raw contract events received:', contractEvents);
      console.log('Number of events:', contractEvents?.length || 0);

      // Check if we got valid data
      if (!contractEvents) {
        throw new Error('getAllEvents returned null/undefined');
      }

      if (!Array.isArray(contractEvents)) {
        throw new Error('getAllEvents did not return an array');
      }

      // If no events found, just set empty array (no error)
      if (contractEvents.length === 0) {
        console.log('No events found in contract');
        setEvents([]);
        setIsLoading(false);
        return;
      }

      // Map contract events to Event objects
      const eventsFromContract: Event[] = contractEvents.map((contractEvent, index) => {
        console.log(`Processing event ${index}:`, contractEvent);
        
        try {
          const event = {
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
          };
          console.log(`Successfully processed event ${index}:`, event);
          return event;
        } catch (processError) {
          console.error(`Error processing event ${index}:`, processError);
          throw new Error(`Error processing event ${index}: ${processError}`);
        }
      });

      console.log('All events successfully loaded:', eventsFromContract);
      setEvents(eventsFromContract);
    } catch (err: any) {
      console.error('Detailed error loading events:', err);
      
      let errorMessage = 'Failed to load events from blockchain';
      
      if (err?.message) {
        if (err.message.includes('Contract not found')) {
          errorMessage = err.message;
        } else if (err.message.includes('Cannot connect')) {
          errorMessage = err.message;
        } else if (err.message.includes('ContractFunctionExecutionError')) {
          errorMessage = 'Contract function failed. The getAllEvents function may not exist or contract is not properly deployed.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network connection error. Check your internet connection.';
        } else if (err.message.includes('getAllEvents')) {
          errorMessage = err.message;
        } else if (err.message.includes('execution reverted')) {
          errorMessage = 'Contract returned an error. It may not be properly initialized.';
        } else {
          errorMessage = `Blockchain error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
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
    console.log('useEvents: contractAddress changed to:', contractAddress);
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