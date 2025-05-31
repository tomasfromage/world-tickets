'use client';

import { useState } from 'react';
import { createPublicClient, http, defineChain } from 'viem';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { getValidatedContractAddress } from '@/utils/contract';
import TicketNFTABI from '@/abi/TicketNFT.json';

// Define WorldChain Sepolia testnet
const worldchainSepolia = defineChain({
  id: 4801,
  name: 'WorldChain Sepolia',
  network: 'worldchain-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Worldcoin',
    symbol: 'WLD',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
    public: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldChain Sepolia Explorer',
      url: 'https://worldchain-sepolia.blockscout.com',
    },
  },
  testnet: true,
});

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

interface ABIItem {
  name?: string;
  type: string;
  inputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
}

export function BlockchainDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const client = createPublicClient({
    chain: worldchainSepolia,
    transport: http('https://worldchain-sepolia.g.alchemy.com/public'),
  });

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DiagnosticResult[] = [];

    // Test 1: Contract address configuration
    try {
      const contractAddress = getValidatedContractAddress();
      tests.push({
        test: 'Contract address configuration',
        status: 'success',
        message: `Address loaded: ${contractAddress}`,
        details: { contractAddress }
      });
    } catch (error) {
      tests.push({
        test: 'Contract address configuration',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      setResults([...tests]);
      setIsRunning(false);
      return;
    }

    setResults([...tests]);

    // Test 2: RPC connection
    try {
      const blockNumber = await client.getBlockNumber();
      tests.push({
        test: 'WorldChain Sepolia RPC connection',
        status: 'success',
        message: `Connected - current block: ${blockNumber}`,
        details: { blockNumber: blockNumber.toString(), rpcUrl: 'https://worldchain-sepolia.g.alchemy.com/public' }
      });
    } catch (error) {
      tests.push({
        test: 'WorldChain Sepolia RPC connection',
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setResults([...tests]);

    // Test 3: Contract existence
    try {
      const contractAddress = getValidatedContractAddress();
      const bytecode = await client.getBytecode({
        address: contractAddress as `0x${string}`,
      });
      
      if (bytecode && bytecode !== '0x') {
        tests.push({
          test: 'Contract existence',
          status: 'success',
          message: `Contract found, bytecode size: ${bytecode.length}`,
          details: { bytecodeLength: bytecode.length }
        });
      } else {
        tests.push({
          test: 'Contract existence',
          status: 'error',
          message: 'Contract not found at the specified address'
        });
      }
    } catch (error) {
      tests.push({
        test: 'Contract existence',
        status: 'error',
        message: `Error checking contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setResults([...tests]);

    // Test 4: getAllEvents function call
    try {
      const contractAddress = getValidatedContractAddress();
      const events = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: TicketNFTABI,
        functionName: 'getAllEvents',
        args: [],
      });

      tests.push({
        test: 'getAllEvents function call',
        status: 'success',
        message: `Function called successfully, returned ${Array.isArray(events) ? events.length : 0} events`,
        details: { eventsCount: Array.isArray(events) ? events.length : 0, events }
      });
    } catch (error) {
      tests.push({
        test: 'getAllEvents function call',
        status: 'error',
        message: `Function call error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setResults([...tests]);

    // Test 5: ABI verification
    const getAllEventsFunction = TicketNFTABI.find((item: ABIItem) => item.name === 'getAllEvents');
    if (getAllEventsFunction) {
      tests.push({
        test: 'ABI verification - getAllEvents function',
        status: 'success',
        message: 'getAllEvents function found in ABI',
        details: { function: getAllEventsFunction }
      });
    } else {
      tests.push({
        test: 'ABI verification - getAllEvents function',
        status: 'error',
        message: 'getAllEvents function not found in ABI'
      });
    }

    setResults([...tests]);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔍 Blockchain Diagnostic</h3>
      
      <Button 
        variant="primary" 
        onClick={runDiagnostic} 
        disabled={isRunning}
        className="mb-4"
      >
        {isRunning ? 'Running tests...' : 'Run Diagnostic'}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="border rounded p-3 bg-white">
              <div className="flex items-center gap-2 font-medium">
                <span>{getStatusIcon(result.status)}</span>
                <span>{result.test}</span>
              </div>
              <p className={`text-sm mt-1 ${result.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                {result.message}
              </p>
              {result.details && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">Show details</summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 