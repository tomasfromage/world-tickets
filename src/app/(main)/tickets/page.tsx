'use client';

import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { TicketsComponent } from '@/components/TicketsComponent';
import { CreateEventForm } from '@/components/CreateEventForm';
import { MyTickets } from '@/components/MyTickets';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types/events';
import { useState } from 'react';

// Smart contract address - in production would be in environment variables
const TICKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS || '0x...';

export default function TicketsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'myTickets'>('events');
  const { events, isLoading, error, addEvent, refreshEvents } = useEvents({ 
    contractAddress: TICKET_CONTRACT_ADDRESS 
  });

  const handleEventCreated = (newEvent: Event) => {
    addEvent(newEvent);
    setShowCreateForm(false);
    // We can also reload events from blockchain for current data
    setTimeout(() => refreshEvents(), 2000); // Pause for transaction confirmation
  };

  if (error) {
    return (
      <>
        <Page.Header className="p-0">
          <TopBar title="🎫 Tickets" />
        </Page.Header>
        
        <Page.Main className="flex flex-col gap-4 mb-16">
          <div className="text-center text-red-500 p-4">
            <p>Error loading events:</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={refreshEvents}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Try Again
            </button>
          </div>
        </Page.Main>
      </>
    );
  }

  return (
    <>
      <Page.Header className="p-0">
        <TopBar title="🎫 Tickets" />
      </Page.Header>
      
      <Page.Main className="flex flex-col gap-4 mb-16">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎪 Available Events
          </button>
          <button
            onClick={() => setActiveTab('myTickets')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'myTickets'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎫 My Tickets
          </button>
        </div>

        {activeTab === 'events' && (
          <>
            {/* Button for creating new event */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {isLoading ? 'Loading events...' : `Available Events (${events.length})`}
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {showCreateForm ? 'Cancel' : '+ Create Event'}
              </button>
            </div>

            {/* Form for creating event */}
            {showCreateForm && (
              <CreateEventForm
                contractAddress={TICKET_CONTRACT_ADDRESS}
                onEventCreated={handleEventCreated}
              />
            )}

            {/* Events list */}
            <TicketsComponent 
              events={events}
              userAddress=""
              isLoading={isLoading}
            />
          </>
        )}

        {activeTab === 'myTickets' && (
          <MyTickets contractAddress={TICKET_CONTRACT_ADDRESS} />
        )}
      </Page.Main>
    </>
  );
} 