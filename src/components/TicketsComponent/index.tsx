'use client';

import { Event } from '@/types/events';
import { EventsList } from '@/components/EventsList';
import { BuyTicket } from '@/components/BuyTicket';
import { useState } from 'react';

interface TicketsComponentProps {
  events: Event[];
  userAddress: string;
  isLoading?: boolean;
}

export const TicketsComponent = ({ events, isLoading = false }: TicketsComponentProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showBuyTicket, setShowBuyTicket] = useState(false);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowBuyTicket(true);
  };

  const handleTicketPurchaseSuccess = (ticketId: number) => {
    console.log('Ticket purchased successfully! Ticket ID:', ticketId);
    setShowBuyTicket(false);
    setSelectedEvent(null);
    // TODO: Show success message and refresh tickets
    alert(`Ticket #${ticketId} purchased successfully! Check "My Tickets" tab.`);
  };

  const handleCancelPurchase = () => {
    setShowBuyTicket(false);
    setSelectedEvent(null);
  };

  // Show BuyTicket modal when event is selected
  if (showBuyTicket && selectedEvent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          <BuyTicket
            event={selectedEvent}
            onSuccess={handleTicketPurchaseSuccess}
            onCancel={handleCancelPurchase}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <EventsList
        events={events}
        onEventSelect={handleEventSelect}
        showCreateButton={false}
        isLoading={isLoading}
      />
    </div>
  );
}; 