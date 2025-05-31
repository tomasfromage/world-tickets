'use client';

import { Event } from '@/types/events';
import { EventsList } from '@/components/EventsList';
import { BuyTicket } from '@/components/BuyTicket';
import { TicketVerification } from '@/components/TicketVerification';
import { useState } from 'react';

interface TicketsComponentProps {
  events: Event[];
  userAddress: string;
  isLoading?: boolean;
}

export const TicketsComponent = ({ events, isLoading = false }: TicketsComponentProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showBuyTicket, setShowBuyTicket] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'my-tickets' | 'verify'>('events');

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowBuyTicket(true);
  };

  const handleTicketPurchaseSuccess = (ticketId: number) => {
    console.log('Ticket purchased:', ticketId);
    setShowBuyTicket(false);
    setSelectedEvent(null);
    // TODO: Refresh user tickets
  };

  const handleCancelPurchase = () => {
    setShowBuyTicket(false);
    setSelectedEvent(null);
  };

  if (showBuyTicket && selectedEvent) {
    return (
      <BuyTicket
        event={selectedEvent}
        onSuccess={handleTicketPurchaseSuccess}
        onCancel={handleCancelPurchase}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Custom Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'events'
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'my-tickets'
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('my-tickets')}
        >
          My Tickets
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'verify'
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('verify')}
        >
          Verification
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'events' && (
        <EventsList
          events={events}
          onEventSelect={handleEventSelect}
          showCreateButton={false}
          isLoading={isLoading}
        />
      )}
      
      {activeTab === 'my-tickets' && (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">My Tickets</h3>
          <p className="text-gray-600">
            Your purchased tickets will be displayed here
          </p>
          {/* TODO: Implement UserTickets component */}
        </div>
      )}
      
      {activeTab === 'verify' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Ticket Verification</h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            For vendors - verify visitors at entry
          </p>
          <TicketVerification
            eventId={1} // TODO: Dynamic based on selected event
            onVerificationComplete={(result) => {
              console.log('Verification completed:', result);
            }}
          />
        </div>
      )}
    </div>
  );
}; 