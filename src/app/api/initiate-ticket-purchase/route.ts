import { NextRequest, NextResponse } from 'next/server';

interface PurchaseRequest {
  eventId: number;
  basePrice: number;
  fees: {
    appOwner: number;
    worldApp: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, basePrice, fees } = (await req.json()) as PurchaseRequest;
    
    // Generujeme jedinečný payment ID
    const paymentId = crypto.randomUUID().replace(/-/g, '');
    
    // V reálné aplikaci byste zde:
    // 1. Uložili payment record do databáze
    // 2. Ověřili dostupnost vstupenek pro event
    // 3. Nastavili expiraci pro platbu
    
    // Simulace databázové operace
    console.log('Iniciating ticket purchase:', {
      paymentId,
      eventId,
      basePrice,
      fees,
      timestamp: Date.now()
    });
    
    // TODO: Store in database
    // await db.payments.create({
    //   id: paymentId,
    //   eventId,
    //   basePrice,
    //   appOwnerFee: fees.appOwner,
    //   worldAppFee: fees.worldApp,
    //   status: 'pending',
    //   createdAt: new Date()
    // });

    return NextResponse.json({ 
      paymentId,
      success: true 
    });
    
  } catch (error) {
    console.error('Error initiating ticket purchase:', error);
    return NextResponse.json(
      { 
        error: 'Chyba při inicializaci nákupu',
        success: false 
      },
      { status: 500 }
    );
  }
} 