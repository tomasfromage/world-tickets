export interface Event {
  id: number;
  name: string;
  description: string;
  date: number; // timestamp
  location: string;
  ticketPrice: string; // v WLD/USDC
  totalTickets: number;
  soldTickets: number;
  vendor: string; // adresa
  eventType: 'Sport' | 'Concert' | 'Hackathon' | 'Conference' | 'Other';
  imageUrl?: string;
}

export interface Ticket {
  ticketId: number;
  eventId: number;
  owner: string;
  isForSale: boolean;
  salePrice: string;
  specificBuyer?: string; // pro private sale
  hasAttended: boolean;
}

export interface TicketListing {
  ticketId: number;
  event: Event;
  price: string;
  seller: string;
  isPrivate: boolean;
  specificBuyer?: string;
}

export interface EventFilter {
  eventType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  maxPrice?: number;
}

export interface ProfitSharing {
  vendor: number; // 1% z resale
  worldApp: number; // 1% z initial + 1% z resale  
  appOwner: number; // 2% z initial + 1% z resale
}

export const PROFIT_SHARING: ProfitSharing = {
  vendor: 100, // 1% v basis points
  worldApp: 100, // 1%
  appOwner: 200, // 2% pro initial, 1% pro resale
}; 