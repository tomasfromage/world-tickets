# 🎫 Tickets - World App Mini App

Decentralized platform for buying and selling tickets integrated into the World App ecosystem.

## Features

### For users:
- **Browse events** - Filter by type, location, date and price
- **Buy tickets** - Payment using WLD/USDC.e via MiniKit Pay
- **Manage tickets** - View owned tickets as NFTs
- **Sell tickets** - Public or private sales
- **Ownership verification** - Cryptographic proof of ticket ownership

### For vendors:
- **Create events** - Templates for different event types
- **Sales management** - Monitor sold tickets
- **Visitor verification** - World ID verification at entry without QR codes
- **Visitor exclusion** - Blacklist system

## Monetization (Profit Sharing)

### Initial sale:
- **Vendor**: 97% of ticket price
- **World App**: 1% fee
- **App Owner**: 2% fee

### Resale:
- **Vendor**: 1% of resale price
- **World App**: 1% fee  
- **App Owner**: 1% fee
- **Seller**: Remainder

## Technical Architecture

### Smart Contracts
- **TicketNFT.sol** - ERC721 contract for tickets
- Functions: `createEvent`, `purchaseTicket`, `listTicketForSale`, `verifyTicketOwnership`

### MiniKit SDK Integration
- **Wallet Auth** - Login using World ID
- **Pay Command** - Payments in WLD/USDC.e
- **Verify Command** - Identity verification at entry
- **Send Transaction** - Smart contract interactions

### Components

#### Frontend
- `EventsList` - Event list with filters
- `BuyTicket` - Ticket purchase with fee calculation
- `TicketVerification` - Visitor verification by vendors
- `TicketsComponent` - Main interface with tabs

#### Backend API
- `/api/initiate-ticket-purchase` - Purchase initialization
- `/api/verify-ticket-owner` - Backend ownership verification

## Installation and Setup

1. **Clone and install**
```bash
git clone https://github.com/ascm00/ethglobal-ticketverse
cd ethglobal-ticketverse
yarn install
```

2. **Environment configuration**
```bash
cp .env.example .env.local
```

Fill in the following variables:
```env
NEXT_PUBLIC_APP_ID=app_your_app_id
NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS=0x...
NEXTAUTH_SECRET=your_secret
HMAC_SECRET_KEY=your_hmac_key
```

3. **Start development server**
```bash
yarn dev
```

4. **Set up ngrok for testing**
```bash
ngrok http 3000
```

5. **Configuration in World Developer Portal**
- Add ngrok URL to `allowedDevOrigins`
- Set smart contract addresses in Advanced configuration
- Enable required permissions (Pay, Verify, Send Transaction)

## Project Structure

```
src/
├── abi/                    # Smart contract ABI
│   └── TicketNFT.json
├── components/             # React components
│   ├── EventsList/         # Event list
│   ├── BuyTicket/          # Ticket purchase
│   ├── TicketVerification/ # Ticket verification
│   └── TicketsComponent/   # Main component
├── types/                  # TypeScript types
│   └── events.ts
├── app/
│   ├── api/               # Backend API endpoints
│   └── (protected)/       # Protected pages
│       └── tickets/       # Main application page
└── auth/                  # Authentication
```

## Security Aspects

### World ID Verification
- All critical operations require World ID proof
- Backend validation of all proofs using `verifyCloudProof`
- Nullifier hash tracking to prevent replay attacks

### Payment Security
- Reference ID for each payment
- Backend verification of all transactions
- Profit sharing implemented on-chain

### Smart Contract Security
- Ownership controls for all operations
- Event-based logging for audit purposes
- Reentrancy protection

## Roadmap

### Phase 1 (Current)
- ✅ Basic ticket buying and selling
- ✅ World ID integration
- ✅ MiniKit Pay integration

### Phase 2
- [ ] Resale marketplace
- [ ] Attendance NFT system
- [ ] Vendor dashboard
- [ ] Push notifications

### Phase 3
- [ ] Cross-chain support
- [ ] DAO governance
- [ ] Staking rewards
- [ ] Mobile application

## MiniKit Usage Examples

### Ticket Purchase
```typescript
const paymentResult = await MiniKit.commandsAsync.pay({
  reference: paymentId,
  to: event.vendor,
  tokens: [{
    symbol: Tokens.WLD,
    token_amount: tokenToDecimals(price, Tokens.WLD).toString(),
  }],
  description: `Ticket for ${event.name}`,
});
```

### Visitor Verification
```typescript
const verifyResult = await MiniKit.commandsAsync.verify({
  action: 'verify-event-entry',
  signal: eventId.toString(),
});
```

### Smart Contract Interaction
```typescript
const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
  transaction: [{
    address: TICKET_CONTRACT_ADDRESS,
    abi: TicketNFTABI,
    functionName: 'purchaseTicket',
    args: [eventId],
  }],
});
```

## Support

For questions and support:
- GitHub Issues: [ethglobal-ticketverse/issues](https://github.com/ascm00/ethglobal-ticketverse/issues)
- World Developer Docs: [docs.world.org/mini-apps](https://docs.world.org/mini-apps)

## License

MIT License - see [LICENSE](LICENSE) file. 