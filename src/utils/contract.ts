// Utility for getting smart contract address
import contractAddressConfig from '../../contract-address.json';

/**
 * Gets TicketNFT contract address from environment variables or configuration
 */
export function getContractAddress(): string {
  // Prefer environment variable
  const envAddress = process.env.NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS;
  if (envAddress && envAddress !== '0x...') {
    return envAddress;
  }

  // Fallback to address from config file
  if (contractAddressConfig?.address) {
    return contractAddressConfig.address;
  }

  throw new Error(
    'Contract address not found. Please set NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS environment variable or check contract-address.json'
  );
}

/**
 * Validates if address is in correct format
 */
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Gets contract address and validates it
 */
export function getValidatedContractAddress(): string {
  const address = getContractAddress();
  
  if (!isValidContractAddress(address)) {
    throw new Error(`Invalid contract address format: ${address}`);
  }
  
  return address;
} 