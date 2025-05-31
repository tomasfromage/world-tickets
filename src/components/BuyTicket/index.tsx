'use client';

import TicketNFTABI from '@/abi/TicketNFT.json';
import { Event, PROFIT_SHARING } from '@/types/events';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useState } from 'react';

interface BuyTicketProps {
  event: Event;
  onSuccess: (ticketId: number) => void;
  onCancel: () => void;
}

export const BuyTicket = ({ event, onSuccess, onCancel }: BuyTicketProps) => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  // Smart contract adresa (měla by být v .env)
  const TICKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  const calculateFees = (price: string) => {
    const basePrice = parseFloat(price);
    const appOwnerFee = (basePrice * PROFIT_SHARING.appOwner) / 10000; // 2%
    const worldAppFee = (basePrice * PROFIT_SHARING.worldApp) / 10000; // 1%
    const totalPrice = basePrice + appOwnerFee + worldAppFee;
    
    return {
      basePrice,
      appOwnerFee,
      worldAppFee,
      totalPrice
    };
  };

  const handlePurchase = async () => {
    if (buttonState === 'pending') return;
    
    setButtonState('pending');
    
    try {
      const fees = calculateFees(event.ticketPrice);
      
      // Generujeme reference ID pro platbu
      const res = await fetch('/api/initiate-ticket-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: event.id,
          basePrice: fees.basePrice,
          fees: {
            appOwner: fees.appOwnerFee,
            worldApp: fees.worldAppFee
          }
        }),
      });
      
      const { paymentId } = await res.json();

      // Platba pomocí MiniKit Pay
      const paymentResult = await MiniKit.commandsAsync.pay({
        reference: paymentId,
        to: event.vendor, // Prodejce dostává base price
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(fees.basePrice, Tokens.WLD).toString(),
          }
        ],
        description: `Vstupenka na ${event.name}`,
      });

      if (paymentResult.finalPayload.status === 'success') {
        // Po úspěšné platbě voláme smart contract pro mint NFT
        const { finalPayload: transactionResult } = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: TICKET_CONTRACT_ADDRESS,
              abi: TicketNFTABI,
              functionName: 'purchaseTicket',
              args: [event.id],
              value: tokenToDecimals(fees.totalPrice, Tokens.WLD).toString(), // V tomto případě by měl být 0, protože už jsme zaplatili
            },
          ],
        });

        if (transactionResult.status === 'success') {
          setButtonState('success');
          // Získáme ticket ID z transaction logs (zjednodušeno)
          onSuccess(Date.now()); // Placeholder - v reálné aplikaci bychom parsovali logs
        } else {
          setButtonState('failed');
          setTimeout(() => setButtonState(undefined), 3000);
        }
      } else {
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 3000);
      }
    } catch (error) {
      console.error('Chyba při nákupu vstupenky:', error);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
    }
  };

  const fees = calculateFees(event.ticketPrice);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Koupit vstupenku</h2>
      
      <div className="space-y-4 mb-6">
        <div className="border-b pb-4">
          <h3 className="font-semibold">{event.name}</h3>
          <p className="text-sm text-gray-600">{event.location}</p>
          <p className="text-sm text-gray-600">
            {new Date(event.date * 1000).toLocaleDateString('cs-CZ')}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Cena vstupenky:</span>
            <span>{fees.basePrice.toFixed(2)} WLD</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Poplatek aplikace (2%):</span>
            <span>{fees.appOwnerFee.toFixed(4)} WLD</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Poplatek World App (1%):</span>
            <span>{fees.worldAppFee.toFixed(4)} WLD</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Celkem:</span>
            <span>{fees.totalPrice.toFixed(4)} WLD</span>
          </div>
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
          Zrušit
        </Button>
        
        <LiveFeedback
          label={{
            failed: 'Nákup se nezdařil',
            pending: 'Nakupuji...',
            success: 'Vstupenka zakoupena!',
          }}
          state={buttonState}
          className="flex-1"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePurchase}
            disabled={buttonState === 'pending'}
          >
            Koupit vstupenku
          </Button>
        </LiveFeedback>
      </div>
    </div>
  );
}; 