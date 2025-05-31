import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { Event } from '@/types/events';
import TicketNFTABI from '@/abi/TicketNFT.json';

interface UseEventsProps {
  contractAddress: string;
}

export function useEvents({ contractAddress }: UseEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client for reading from blockchain
  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  // Load events from blockchain
  const loadEvents = async () => {
    if (!contractAddress) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Get EventCreated logs
      const eventLogs = await client.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'EventCreated',
          inputs: [
            { indexed: true, name: 'eventId', type: 'uint256' },
            { indexed: false, name: 'name', type: 'string' },
            { indexed: false, name: 'price', type: 'uint256' },
            { indexed: false, name: 'totalTickets', type: 'uint256' },
            { indexed: true, name: 'vendor', type: 'address' },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Map logs to Event objects
      const eventsFromLogs: Event[] = await Promise.all(
        eventLogs.map(async (log) => {
          const eventId = log.args.eventId as bigint;
          
          // Get event details from smart contract
          try {
            const eventDetails = await client.readContract({
              address: contractAddress as `0x${string}`,
              abi: TicketNFTABI,
              functionName: 'getEvent',
              args: [eventId],
            }) as any[];

            // Assuming getEvent return structure: [name, description, date, location, price, totalTickets, soldTickets, vendor, eventType]
            return {
              id: Number(eventId),
              name: eventDetails[0] as string,
              description: eventDetails[1] as string,
              date: Number(eventDetails[2]),
              location: eventDetails[3] as string,
              ticketPrice: (Number(eventDetails[4]) / 1e18).toString(), // Convert from Wei
              totalTickets: Number(eventDetails[5]),
              soldTickets: Number(eventDetails[6]),
              vendor: eventDetails[7] as string,
              eventType: eventDetails[8] as "Conference" | "Sport" | "Concert" | "Hackathon" | "Other",
            };
          } catch (contractError) {
            console.error('Error reading event details:', contractError);
            // Fallback with data from log
            return {
              id: Number(eventId),
              name: log.args.name as string,
              description: 'Loading description...',
              date: Math.floor(Date.now() / 1000) + 86400, // Placeholder
              location: 'Loading location...',
              ticketPrice: (Number(log.args.price) / 1e18).toString(),
              totalTickets: Number(log.args.totalTickets),
              soldTickets: 0,
              vendor: log.args.vendor as string,
              eventType: 'Other' as const,
            };
          }
        })
      );

      setEvents(eventsFromLogs);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events from blockchain');
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