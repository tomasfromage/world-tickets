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
      // Krok 1: Ověření World ID pomocí MiniKit Verify
      const verifyResult = await MiniKit.commandsAsync.verify({
        action: 'verification',
        signal: eventId.toString(),
      });

      if (verifyResult.finalPayload.status !== 'success') {
        throw new Error('World ID ověření se nezdařilo');
      }

      // Krok 2: Ověření na backend serveru
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
        throw new Error('Ověření na backend serveru selhalo');
      }

      // Krok 3: Získání informací o uživateli z World ID
      const userInfo = await MiniKit.getUserInfo(verifyResult.finalPayload.nullifier_hash);
      
      // Krok 4: Ověření vlastnictví vstupenky v smart contractu
      const ticketVerification = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: TICKET_CONTRACT_ADDRESS,
            abi: TicketNFTABI,
            functionName: 'verifyTicketOwnership',
            args: [eventId], // Zjednodušeno - v reálnosti bychom potřebovali ticket ID
          },
        ],
      });

      if (ticketVerification.finalPayload.status === 'success') {
        // Simulace získání ticket info (v reálné aplikaci by se parsovaly logs)
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
            username: userInfo.username || 'Neznámý uživatel',
            profilePictureUrl: userInfo.profilePictureUrl || '',
            walletAddress: userInfo.walletAddress,
          },
        };

        setVerificationResult(result);
        setVerificationState('success');
        onVerificationComplete?.(result);
      } else {
        throw new Error('Ověření vlastnictví vstupenky selhalo');
      }
    } catch (error) {
      console.error('Chyba při ověřování:', error);
      const result: VerificationResult = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
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

      // Aktualizujeme stav
      setVerificationResult(prev => prev ? {
        ...prev,
        ticketInfo: prev.ticketInfo ? {
          ...prev.ticketInfo,
          hasAttended: true
        } : undefined
      } : null);
    } catch (error) {
      console.error('Chyba při označování účasti:', error);
    }
  };

  const resetVerification = () => {
    setVerificationState('idle');
    setVerificationResult(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-center">Ověření vstupenky</h2>

      {verificationState === 'idle' && (
        <div className="text-center">
          <div className="mb-6">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Požádejte návštěvníka o ověření identity pomocí World ID
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleVerifyAttendee}
            className="w-full"
          >
            Ověřit návštěvníka
          </Button>
        </div>
      )}

      {verificationState === 'verifying' && (
        <div className="text-center">
          <LiveFeedback
            label={{
              pending: 'Ověřuji...',
              success: 'Ověřeno',
              failed: 'Chyba ověření',
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
              {verificationResult.isValid ? 'Vstupenka je platná!' : 'Vstupenka není platná!'}
            </p>
            
            {verificationResult.error && (
              <p className="text-red-600 text-sm mt-2">{verificationResult.error}</p>
            )}
          </div>

          {verificationResult.isValid && verificationResult.userInfo && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Informace o návštěvníkovi</h3>
              
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
                    <span>ID vstupenky:</span>
                    <span>{verificationResult.ticketInfo.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Účast označena:</span>
                    <span className={verificationResult.ticketInfo.hasAttended ? 'text-green-600' : 'text-orange-600'}>
                      {verificationResult.ticketInfo.hasAttended ? 'Ano' : 'Ne'}
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
                  Označit účast
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
            Ověřit dalšího návštěvníka
          </Button>
        </div>
      )}
    </div>
  );
}; 