'use client';

import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { TicketsComponent } from '@/components/TicketsComponent';
import { CreateEventForm } from '@/components/CreateEventForm';
import { MyTickets } from '@/components/MyTickets';
import { BlockchainDiagnostic } from '@/components/BlockchainDiagnostic';
import { useEvents } from '@/hooks/useEvents';
import { getValidatedContractAddress } from '@/utils/contract';
import { Event } from '@/types/events';
import { useState, useEffect } from 'react';

export default function TicketsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'myTickets' | 'diagnostic'>('events');
  
  // Use new utility function to get contract address
  const [contractAddress, setContractAddress] = useState<string>('');
  const [contractError, setContractError] = useState<string | null>(null);

  // Initialize contract address
  useEffect(() => {
    try {
      const address = getValidatedContractAddress();
      setContractAddress(address);
      console.log('Tickets: Using contract address:', address);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error getting contract address';
      setContractError(errorMsg);
      console.error('Tickets: Error getting contract address:', error);
    }
  }, []);

  const { events, isLoading, error, addEvent, refreshEvents } = useEvents({ 
    contractAddress 
  });

  const handleEventCreated = (newEvent: Event) => {
    addEvent(newEvent);
    setShowCreateForm(false);
    // We can also reload events from blockchain for current data
    setTimeout(() => refreshEvents(), 2000); // Pause for transaction confirmation
  };

  // Display contract address error
  if (contractError) {
    return (
      <>
        <Page.Header className="p-0">
          <TopBar title="🎫 Tickets" />
        </Page.Header>
        
        <Page.Main className="flex flex-col gap-4 mb-16">
          <div className="text-center text-red-500 p-4">
            <p>Contract configuration error:</p>
            <p className="text-sm">{contractError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </Page.Main>
      </>
    );
  }

  // Waiting for contract address to load
  if (!contractAddress) {
    return (
      <>
        <Page.Header className="p-0">
          <TopBar title="🎫 Tickets" />
        </Page.Header>
        
        <Page.Main className="flex flex-col gap-4 mb-16">
          <div className="text-center p-4">
            <p>Loading contract configuration...</p>
          </div>
        </Page.Main>
      </>
    );
  }

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
            <p className="text-xs mt-2">Contract address: {contractAddress}</p>
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
        {/* Navigation tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'events' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('myTickets')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'myTickets' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'diagnostic' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Diagnostic
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
                contractAddress={contractAddress}
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
          <MyTickets contractAddress={contractAddress} />
        )}

        {activeTab === 'diagnostic' && (
          <BlockchainDiagnostic />
        )}
      </Page.Main>
    </>
  );
} 