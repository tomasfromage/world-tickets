const hre = require("hardhat");

async function main() {
  console.log("Deploying TicketNFT contract to WorldChain...");

  // Get the ContractFactory and Signers here.
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  
  // Deploy the contract
  const ticketNFT = await TicketNFT.deploy("WorldTickets", "WTIX");

  // Wait for deployment to finish
  await ticketNFT.waitForDeployment();

  const contractAddress = await ticketNFT.getAddress();
  console.log("TicketNFT deployed to:", contractAddress);
  
  // Save the contract address to file
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('contract-address.json', JSON.stringify(contractInfo, null, 2));
  console.log("Contract info saved to contract-address.json");
  
  console.log("\n🎉 Deployment successful!");
  console.log("📋 Next steps:");
  console.log("1. Copy this address to your .env.local file:");
  console.log(`   NEXT_PUBLIC_TICKET_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Restart your Next.js application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 