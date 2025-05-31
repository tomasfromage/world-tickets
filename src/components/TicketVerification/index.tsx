'use client';

import TicketNFTABI from '@/abi/TicketNFT.json';
import { Button, LiveFeedback, Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { CheckCircle, WarningTriangle, User } from 'iconoir-react';
import { useState } from 'react';

interface VerificationResult {
  isValid: boolean;
  ticketInfo?: {
    ticketId: number;
    eventId: number;
    owner: string;
    hasAttended: boolean;
  };
  userInfo?: {
    username: string;
    profilePictureUrl: string;
    walletAddress: string;
  };
  error?: string;
}

interface TicketVerificationProps {
  eventId: number;
  onVerificationComplete?: (result: VerificationResult) => void;
}

export const TicketVerification = ({ eventId, onVerificationComplete }: TicketVerificationProps) => {
  const [verificationState, setVerificationState] = useState<
    'idle' | 'verifying' | 'success' | 'failed'
  >('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const TICKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  //const APP_ID = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

  const handleVerifyAttendee = async () => {
    setVerificationState('verifying');
    setVerificationResult(null);

    try {
      // Step 1: World ID verification using MiniKit Verify
      const verifyResult = await MiniKit.commandsAsync.verify({
        action: 'verification',
        signal: eventId.toString(),
      });

      if (verifyResult.finalPayload.status !== 'success') {
        throw new Error('World ID verification failed');
      }

      // Step 2: Backend server verification
      const backendVerification = await fetch('/api/verify-ticket-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: verifyResult.finalPayload,
          action: 'verification',
          signal: eventId.toString(),
        }),
      });

      const backendResult = await backendVerification.json();
      
      if (!backendResult.success) {
        throw new Error('Backend server verification failed');
      }

      // Step 3: Get user information from World ID
      const userInfo = await MiniKit.getUserInfo(verifyResult.finalPayload.nullifier_hash);
      
      // Step 4: Verify ticket ownership in smart contract
      const ticketVerification = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: TICKET_CONTRACT_ADDRESS,
            abi: TicketNFTABI,
            functionName: 'verifyTicketOwnership',
            args: [eventId], // Simplified - in reality we would need ticket ID
          },
        ],
      });

      if (ticketVerification.finalPayload.status === 'success') {
        // Simulate getting ticket info (in real app would parse logs)
        const mockTicketInfo = {
          ticketId: 1,
          eventId: eventId,
          owner: userInfo.walletAddress,
          hasAttended: false,
        };

        const result: VerificationResult = {
          isValid: true,
          ticketInfo: mockTicketInfo,
          userInfo: {
            username: userInfo.username || 'Unknown User',
            profilePictureUrl: userInfo.profilePictureUrl || '',
            walletAddress: userInfo.walletAddress,
          },
        };

        setVerificationResult(result);
        setVerificationState('success');
        onVerificationComplete?.(result);
      } else {
        throw new Error('Ticket ownership verification failed');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      const result: VerificationResult = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      setVerificationResult(result);
      setVerificationState('failed');
      onVerificationComplete?.(result);
    }
  };

  const handleMarkAttendance = async () => {
    if (!verificationResult?.ticketInfo) return;

    try {
      await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: TICKET_CONTRACT_ADDRESS,
            abi: TicketNFTABI,
            functionName: 'markAttendance',
            args: [verificationResult.ticketInfo.ticketId],
          },
        ],
      });

      // Update state
      setVerificationResult(prev => prev ? {
        ...prev,
        ticketInfo: prev.ticketInfo ? {
          ...prev.ticketInfo,
          hasAttended: true
        } : undefined
      } : null);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const resetVerification = () => {
    setVerificationState('idle');
    setVerificationResult(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-center">Ticket Verification</h2>

      {verificationState === 'idle' && (
        <div className="text-center">
          <div className="mb-6">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Ask the visitor to verify their identity using World ID
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleVerifyAttendee}
            className="w-full"
          >
            Verify Visitor
          </Button>
        </div>
      )}

      {verificationState === 'verifying' && (
        <div className="text-center">
          <LiveFeedback
            label={{
              pending: 'Verifying...',
              success: 'Verified',
              failed: 'Verification Error',
            }}
            state="pending"
            className="w-full"
          >
            <div className="p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </LiveFeedback>
        </div>
      )}

      {(verificationState === 'success' || verificationState === 'failed') && verificationResult && (
        <div className="space-y-4">
          <div className={`text-center p-4 rounded-lg ${
            verificationResult.isValid 
              ? 'bg-green-100 border border-green-300' 
              : 'bg-red-100 border border-red-300'
          }`}>
            {verificationResult.isValid ? (
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            ) : (
              <WarningTriangle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            )}
            
            <p className={`font-semibold ${
              verificationResult.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {verificationResult.isValid ? 'Ticket is valid!' : 'Ticket is not valid!'}
            </p>
            
            {verificationResult.error && (
              <p className="text-red-600 text-sm mt-2">{verificationResult.error}</p>
            )}
          </div>

          {verificationResult.isValid && verificationResult.userInfo && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Visitor Information</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <Marble 
                  src={verificationResult.userInfo.profilePictureUrl} 
                  className="w-12 h-12" 
                />
                <div>
                  <p className="font-medium">{verificationResult.userInfo.username}</p>
                  <p className="text-sm text-gray-600">
                    {verificationResult.userInfo.walletAddress.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {verificationResult.ticketInfo && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ticket ID:</span>
                    <span>{verificationResult.ticketInfo.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Marked:</span>
                    <span className={verificationResult.ticketInfo.hasAttended ? 'text-green-600' : 'text-orange-600'}>
                      {verificationResult.ticketInfo.hasAttended ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}

              {verificationResult.ticketInfo && !verificationResult.ticketInfo.hasAttended && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleMarkAttendance}
                  className="w-full mt-3"
                >
                  Mark Attendance
                </Button>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            size="lg"
            onClick={resetVerification}
            className="w-full"
          >
            Verify Another Visitor
          </Button>
        </div>
      )}
    </div>
  );
}; 