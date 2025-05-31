'use client';
import { Page } from '@/components/PageLayout';
import { EventsList } from '@/components/EventsList';
import { useEvents } from '@/hooks/useEvents';
import { TopBar, Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparks } from 'iconoir-react';
import contractAddress from '../../../../contract-address.json';
import { Event } from '@/types/events';

export default function Home() {
  const router = useRouter();
  const { events, isLoading, error } = useEvents({ 
    contractAddress: contractAddress.address 
  });

  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(true);
  const [verificationState, setVerificationState] = useState<'pending' | 'success' | 'failed' | undefined>(undefined);

  // Automatically open verification dialog after loading
  useEffect(() => {
    // Small delay to let the page load
    const timer = setTimeout(() => {
      if (!isVerified && showVerification) {
        handleVerification();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleVerification = async () => {
    setVerificationState('pending');
    
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: 'verification',
        verification_level: VerificationLevel.Device,
      });

      // Verify the proof
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({
          payload: result.finalPayload,
          action: 'verification',
        }),
      });

      const data = await response.json();
      if (data.verifyRes.success) {
        setVerificationState('success');
        setIsVerified(true);
        setTimeout(() => {
          setShowVerification(false);
        }, 1500);
      } else {
        setVerificationState('failed');
        setTimeout(() => {
          setVerificationState(undefined);
        }, 2000);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationState('failed');
      setTimeout(() => {
        setVerificationState(undefined);
      }, 2000);
    }
  };

  const handleEventSelect = (event: Event) => {
    // Navigate to event detail
    router.push(`/tickets?eventId=${event.id}`);
  };

  const handleSkipVerification = () => {
    setShowVerification(false);
    setIsVerified(true);
  };

  return (
    <>
      <Page.Header className="p-0">
        <TopBar title="Tickets" />
      </Page.Header>
      
      <Page.Main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mb-16">
        {showVerification && !isVerified && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
                <p className="text-sm text-gray-600">
                  Secure your access to events with World ID
                </p>
              </div>
              
              <LiveFeedback
                label={{
                  failed: 'Verification failed',
                  pending: 'Verifying...',
                  success: 'Verified!',
                }}
                state={verificationState}
                className="w-full mb-4"
              >
                <Button
                  onClick={handleVerification}
                  disabled={verificationState === 'pending'}
                  size="lg"
                  variant="primary"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 font-semibold"
                >
                  {verificationState === 'pending' ? 'Verifying...' : 'Verify World ID'}
                </Button>
              </LiveFeedback>

              <Button
                onClick={handleSkipVerification}
                size="sm"
                variant="tertiary"
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {(!showVerification || isVerified) && (
          <div className="w-full">
            {/* Hero Section */}
            <div className="px-6 py-16">
              <div className="max-w-md mx-auto text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                    <Sparks className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900">Tickets</h1>
                </div>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  Discover amazing events and buy tickets securely on blockchain
                </p>
                {isVerified && (
                  <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200 mb-8">
                    <Shield className="w-4 h-4 mr-2" />
                    Verified with World ID
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 min-h-screen">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-center">
                  <p className="font-medium">Error loading events</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Events Section */}
              <div className="mb-8 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Available Events</h2>
                  <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                  </div>
                </div>

                <EventsList
                  events={events}
                  onEventSelect={handleEventSelect}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </Page.Main>
    </>
  );
} 