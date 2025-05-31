'use client';

import TicketNFTABI from '@/abi/TicketNFT.json';
import { Event } from '@/types/events';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';
import { useState } from 'react';

interface BuyTicketProps {
  event: Event;
  onSuccess: (ticketId: number) => void;
  onCancel: () => void;
}

// Define type for verification data
interface VerificationData {
  nullifier_hash: string;
  merkle_root: string;
  proof: string;
  verification_level: string;
}

export const BuyTicket = ({ event, onSuccess, onCancel }: BuyTicketProps) => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  // Smart contract address
  const TICKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  // Handle World ID verification
  const handleVerification = async () => {
    try {
      console.log('Starting World ID verification...');
      
      const result = await MiniKit.commandsAsync.verify({
        action: 'ticket-purchase', // Unique action for ticket purchasing
        verification_level: VerificationLevel.Device, // Device level verification
        signal: `${event.id}`, // Use event ID as signal
      });

      if (result.finalPayload && result.finalPayload.status === 'success') {
        const successPayload = result.finalPayload as ISuccessResult;
        console.log('World ID verification successful:', successPayload);
        
        setIsVerified(true);
        setVerificationData({
          nullifier_hash: successPayload.nullifier_hash || '',
          merkle_root: successPayload.merkle_root || '',
          proof: successPayload.proof || '',
          verification_level: successPayload.verification_level || 'device',
        });
      } else {
        console.error('World ID verification failed:', result.finalPayload);
        alert('World ID verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during World ID verification:', error);
      alert('Error during verification. Please try again.');
    }
  };

  // Handle ticket purchase after verification
  const handlePurchase = async () => {
    if (!isVerified) {
      alert('Please verify your World ID first!');
      return;
    }
    
    if (buttonState === 'pending') return;
    
    setButtonState('pending');
    
    try {
      // Convert price to Wei (18 decimals)
      const priceInWei = BigInt(parseFloat(event.ticketPrice) * 1e18).toString();
      
      console.log('Purchasing ticket for event:', event.id);
      console.log('Price in Wei:', priceInWei);

      // Call smart contract to purchase ticket
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: TICKET_CONTRACT_ADDRESS,
            abi: TicketNFTABI,
            functionName: 'purchaseTicket',
            args: [event.id],
            value: priceInWei, // Payment amount in Wei
          },
        ],
      });

      if (finalPayload && finalPayload.status === 'success') {
        console.log('Ticket purchase successful:', finalPayload);
        setButtonState('success');
        
        // Get ticket ID from transaction (simplified - in real app parse transaction logs)
        const ticketId = Date.now(); // Placeholder
        onSuccess(ticketId);
        
        setTimeout(() => {
          setButtonState(undefined);
        }, 3000);
      } else {
        console.error('Ticket purchase failed:', finalPayload);
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 3000);
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🎫 Buy Ticket</h2>
      
      <div className="space-y-4 mb-6">
        <div className="border-b pb-4">
          <h3 className="font-semibold">{event.name}</h3>
          <p className="text-sm text-gray-600">📍 {event.location}</p>
          <p className="text-sm text-gray-600">
            📅 {new Date(event.date * 1000).toLocaleDateString('cs-CZ')}
          </p>
          <p className="text-sm text-gray-600">
            🎭 {event.eventType}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Ticket Price:</span>
            <span>{event.ticketPrice} WLD</span>
          </div>
          <div className="text-sm text-gray-600">
            Available tickets: {event.totalTickets - event.soldTickets} / {event.totalTickets}
          </div>
        </div>

        {/* World ID Verification Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">🌍 World ID Verification Required</h3>
          {!isVerified ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                You need to verify your World ID to purchase tickets.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleVerification}
              >
                Verify with World ID
              </Button>
            </div>
          ) : (
            <div className="text-green-600">
              <p className="text-sm">✅ World ID verified successfully!</p>
              <p className="text-xs text-gray-500">
                Nullifier hash: {verificationData?.nullifier_hash?.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onCancel}
          disabled={buttonState === 'pending'}
        >
          Cancel
        </Button>
        
        <LiveFeedback
          label={{
            failed: 'Purchase failed',
            pending: 'Purchasing...',
            success: 'Ticket purchased!',
          }}
          state={buttonState}
          className="flex-1"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePurchase}
            disabled={buttonState === 'pending' || !isVerified}
          >
            {isVerified ? 'Buy Ticket' : 'Verify World ID First'}
          </Button>
        </LiveFeedback>
      </div>
    </div>
  );
}; 