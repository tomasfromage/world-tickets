// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _eventIdCounter;
    uint256 private _ticketIdCounter;

    struct Event {
        uint256 id;
        string name;
        string description;
        uint256 date;
        string location;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 soldTickets;
        address vendor;
        string eventType;
    }

    struct Ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        bool isForSale;
        uint256 salePrice;
        address specificBuyer;
        bool hasAttended;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;
    
    uint256[] public eventIds;

    event EventCreated(uint256 indexed eventId, string name, uint256 price, uint256 totalTickets, address indexed vendor);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer, uint256 price);
    event TicketResold(uint256 indexed ticketId, address indexed seller, address indexed buyer, uint256 price);

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(msg.sender) {}

    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _date,
        string memory _location,
        uint256 _ticketPrice,
        uint256 _totalTickets,
        string memory _eventType
    ) public returns (uint256) {
        uint256 eventId = _eventIdCounter;
        _eventIdCounter++;

        events[eventId] = Event({
            id: eventId,
            name: _name,
            description: _description,
            date: _date,
            location: _location,
            ticketPrice: _ticketPrice,
            totalTickets: _totalTickets,
            soldTickets: 0,
            vendor: msg.sender,
            eventType: _eventType
        });

        eventIds.push(eventId);

        emit EventCreated(eventId, _name, _ticketPrice, _totalTickets, msg.sender);
        return eventId;
    }

    function purchaseTicket(uint256 _eventId) public payable returns (uint256) {
        Event storage evt = events[_eventId];
        require(evt.soldTickets < evt.totalTickets, "Event sold out");
        require(msg.value >= evt.ticketPrice, "Insufficient payment");

        uint256 ticketId = _ticketIdCounter;
        _ticketIdCounter++;

        _safeMint(msg.sender, ticketId);

        tickets[ticketId] = Ticket({
            ticketId: ticketId,
            eventId: _eventId,
            owner: msg.sender,
            isForSale: false,
            salePrice: 0,
            specificBuyer: address(0),
            hasAttended: false
        });

        userTickets[msg.sender].push(ticketId);
        evt.soldTickets++;

        // Profit distribution
        uint256 vendorShare = (msg.value * 97) / 100; // 97% to vendor
        uint256 platformShare = msg.value - vendorShare; // 3% to platform

        payable(evt.vendor).transfer(vendorShare);
        // Platform share stays in contract for now

        emit TicketPurchased(ticketId, _eventId, msg.sender, msg.value);
        return ticketId;
    }

    function getAllEvents() public view returns (Event[] memory) {
        Event[] memory allEvents = new Event[](eventIds.length);
        for (uint i = 0; i < eventIds.length; i++) {
            allEvents[i] = events[eventIds[i]];
        }
        return allEvents;
    }

    function getUserTickets(address _user) public view returns (uint256[] memory) {
        return userTickets[_user];
    }

    function getTicketInfo(uint256 _ticketId) public view returns (Ticket memory) {
        return tickets[_ticketId];
    }

    function listTicketForSale(uint256 _ticketId, uint256 _price, address _specificBuyer) public {
        require(ownerOf(_ticketId) == msg.sender, "Not ticket owner");
        tickets[_ticketId].isForSale = true;
        tickets[_ticketId].salePrice = _price;
        tickets[_ticketId].specificBuyer = _specificBuyer;
    }

    function buyResaleTicket(uint256 _ticketId) public payable {
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.isForSale, "Ticket not for sale");
        require(msg.value >= ticket.salePrice, "Insufficient payment");
        
        if (ticket.specificBuyer != address(0)) {
            require(msg.sender == ticket.specificBuyer, "Not authorized buyer");
        }

        address seller = ownerOf(_ticketId);
        _transfer(seller, msg.sender, _ticketId);

        ticket.owner = msg.sender;
        ticket.isForSale = false;
        ticket.salePrice = 0;
        ticket.specificBuyer = address(0);

        // Update user tickets
        _removeTicketFromUser(seller, _ticketId);
        userTickets[msg.sender].push(_ticketId);

        // Profit distribution for resale
        uint256 sellerShare = (msg.value * 97) / 100; // 97% to seller
        uint256 platformShare = msg.value - sellerShare; // 3% to platform

        payable(seller).transfer(sellerShare);

        emit TicketResold(_ticketId, seller, msg.sender, msg.value);
    }

    function verifyTicketOwnership(uint256 _ticketId) public view returns (bool) {
        return ownerOf(_ticketId) == msg.sender;
    }

    function markAttendance(uint256 _ticketId) public {
        require(ownerOf(_ticketId) == msg.sender || owner() == msg.sender, "Not authorized");
        tickets[_ticketId].hasAttended = true;
    }

    function ejectAttendee(uint256 _eventId, address _attendee) public {
        require(events[_eventId].vendor == msg.sender || owner() == msg.sender, "Not authorized");
        // Implementation would require tracking attendees
    }

    function _removeTicketFromUser(address user, uint256 ticketId) internal {
        uint256[] storage userTicketList = userTickets[user];
        for (uint i = 0; i < userTicketList.length; i++) {
            if (userTicketList[i] == ticketId) {
                userTicketList[i] = userTicketList[userTicketList.length - 1];
                userTicketList.pop();
                break;
            }
        }
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 