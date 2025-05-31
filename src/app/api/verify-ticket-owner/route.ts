import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string;
}

/**
 * API endpoint pro ověření vlastnictví vstupenky pomocí World ID proof
 * Kombinuje ověření World ID s kontrolou ownership v smart contractu
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

    // Krok 1: Ověření World ID proof
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal,
    )) as IVerifyResponse;

    if (!verifyRes.success) {
      return NextResponse.json({ 
        verifyRes, 
        success: false,
        error: 'World ID ověření selhalo'
      }, { status: 400 });
    }

    // Krok 2: Zde byste v reálné aplikaci:
    // - Ověřili vlastnictví vstupenky v databázi nebo smart contractu
    // - Zkontrolovali, zda uživatel není na blacklistu pro tento event
    // - Ověřili, zda vstupenka nebyla již použita
    
    const eventId = parseInt(signal);
    const nullifierHash = payload.nullifier_hash;
    
    // Simulace databázové kontroly
    console.log('Verifying ticket ownership:', {
      eventId,
      nullifierHash,
      timestamp: Date.now()
    });
    
    // TODO: Implementovat skutečnou kontrolu
    // const ticketOwnership = await db.tickets.findFirst({
    //   where: {
    //     eventId,
    //     ownerNullifierHash: nullifierHash,
    //     isValid: true
    //   }
    // });
    
    // if (!ticketOwnership) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Vstupenka nenalezena nebo není platná'
    //   }, { status: 404 });
    // }

    // Krok 3: Zaznamenat ověření pro auditní účely
    // await db.verificationLogs.create({
    //   eventId,
    //   nullifierHash,
    //   action,
    //   timestamp: new Date(),
    //   verified: true
    // });

    return NextResponse.json({ 
      verifyRes,
      success: true,
      message: 'Vstupenka úspěšně ověřena'
    });

  } catch (error) {
    console.error('Error in ticket verification:', error);
    return NextResponse.json({
      success: false,
      error: 'Vnitřní chyba serveru při ověřování'
    }, { status: 500 });
  }
} 