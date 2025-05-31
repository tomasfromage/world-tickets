import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, defineChain } from 'viem';
import { Ticket } from '@/types/events';
import TicketNFTABI from '@/abi/TicketNFT.json';

interface UseUserTicketsProps {
  contractAddress: string;
  userAddress?: string;
}

// Type for smart contract getTicketInfo return value
interface ContractTicketInfo {
  ticketId: bigint;
  eventId: bigint;
  owner: string;
  isForSale: boolean;
  salePrice: bigint;
  specificBuyer: string;
  hasAttended: boolean;
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

// Create client outside component to avoid recreating it
const client = createPublicClient({
  chain: worldchainSepolia,
  transport: http('https://worldchain-sepolia.g.alchemy.com/public'),
});

export function useUserTickets({ contractAddress, userAddress }: UseUserTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's tickets from blockchain
  const loadUserTickets = useCallback(async () => {
    if (!contractAddress || !userAddress) {
      setTickets([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Get user's ticket IDs
      const ticketIds = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: TicketNFTABI,
        functionName: 'getUserTickets',
        args: [userAddress],
      }) as bigint[];

      // Get ticket info for each ticket ID
      const ticketPromises = ticketIds.map(async (ticketId) => {
        const ticketInfo = await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: TicketNFTABI,
          functionName: 'getTicketInfo',
          args: [ticketId],
        }) as ContractTicketInfo;

        return {
          ticketId: Number(ticketInfo.ticketId),
          eventId: Number(ticketInfo.eventId),
          owner: ticketInfo.owner,
          isForSale: ticketInfo.isForSale,
          salePrice: (Number(ticketInfo.salePrice) / 1e18).toString(),
          specificBuyer: ticketInfo.specificBuyer,
          hasAttended: ticketInfo.hasAttended,
        } as Ticket;
      });

      const userTickets = await Promise.all(ticketPromises);
      setTickets(userTickets);
    } catch (err) {
      console.error('Error loading user tickets:', err);
      setError('Failed to load your tickets');
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, userAddress]);

  // Add new ticket to local state
  const addTicket = (newTicket: Ticket) => {
    setTickets(prevTickets => [...prevTickets, newTicket]);
  };

  // Load tickets when dependencies change
  useEffect(() => {
    loadUserTickets();
  }, [contractAddress, userAddress, loadUserTickets]);

  return {
    tickets,
    isLoading,
    error,
    refreshTickets: loadUserTickets,
    addTicket,
  };
} 