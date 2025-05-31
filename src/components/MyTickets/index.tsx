'use client';

import { useState, useEffect } from 'react';
import { useUserTickets } from '@/hooks/useUserTickets';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { Ticket, Event } from '@/types/events';

interface MyTicketsProps {
  contractAddress: string;
}

export function MyTickets({ contractAddress }: MyTicketsProps) {
  const [userAddress, setUserAddress] = useState<string>('');
  const [eventsMap, setEventsMap] = useState<Map<number, Event>>(new Map());

  // Get user's wallet address from MiniKit
  useEffect(() => {
    const getUserAddress = async () => {
      try {
        // Get user's wallet address (this is a simplified example)
        // In real app, you might get this from user session or wallet connection
        const walletAddress = '0x...'; // Placeholder - would get from MiniKit user data
        setUserAddress(walletAddress);
      } catch (error) {
        console.error('Error getting user address:', error);
      }
    };

    getUserAddress();
  }, []);

  const { tickets, isLoading: ticketsLoading, error: ticketsError, refreshTickets } = useUserTickets({
    contractAddress,
    userAddress,
  });

  const { events } = useEvents({ contractAddress });

  // Create a map of events for easy lookup
  useEffect(() => {
    const map = new Map<number, Event>();
    events.forEach(event => {
      map.set(event.id, event);
    });
    setEventsMap(map);
  }, [events]);

  // Get event details for a ticket
  const getEventForTicket = (ticket: Ticket): Event | undefined => {
    return eventsMap.get(ticket.eventId);
  };

  if (!userAddress) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">Please connect your wallet to view your tickets.</p>
        <Button variant="primary" size="lg" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  if (ticketsLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading your tickets...</p>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error loading tickets: {ticketsError}</p>
        <Button variant="secondary" size="lg" onClick={refreshTickets}>
          Try Again
        </Button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">You don&apos;t have any tickets yet.</p>
        <p className="text-sm text-gray-500">Purchase tickets for events to see them here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🎫 My Tickets ({tickets.length})</h2>
        <Button variant="secondary" size="sm" onClick={refreshTickets}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => {
          const event = getEventForTicket(ticket);
          
          return (
            <div
              key={ticket.ticketId}
              className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {event?.name || `Event #${ticket.eventId}`}
                  </h3>
                  
                  {event && (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>📍 {event.location}</p>
                      <p>📅 {new Date(event.date * 1000).toLocaleDateString('cs-CZ')}</p>
                      <p>🎭 {event.eventType}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="font-medium">Ticket ID:</span> #{ticket.ticketId}</p>
                    <p><span className="font-medium">Status:</span> 
                      {ticket.hasAttended ? (
                        <span className="text-green-600 ml-1">✅ Attended</span>
                      ) : (
                        <span className="text-blue-600 ml-1">🎫 Valid</span>
                      )}
                    </p>
                    {ticket.isForSale && (
                      <p><span className="font-medium">For Sale:</span> 
                        <span className="text-orange-600 ml-1">💰 {ticket.salePrice} WLD</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-blue-600">
                    #{ticket.ticketId}
                  </div>
                  {event && (
                    <div className="text-sm text-gray-500">
                      {event.ticketPrice} WLD
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                {!ticket.hasAttended && (
                  <Button variant="secondary" size="sm" className="flex-1">
                    Show QR Code
                  </Button>
                )}
                
                {!ticket.isForSale && !ticket.hasAttended && (
                  <Button variant="secondary" size="sm" className="flex-1">
                    List for Sale
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 