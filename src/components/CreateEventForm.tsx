import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { Event } from '@/types/events';
import TicketNFTABI from '@/abi/TicketNFT.json';

interface CreateEventFormProps {
  onEventCreated?: (event: Event) => void;
  contractAddress: string;
}

export function CreateEventForm({ onEventCreated, contractAddress }: CreateEventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    ticketPrice: '',
    totalTickets: '',
    eventType: 'Conference' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert date to timestamp
      const dateTimestamp = Math.floor(new Date(formData.date).getTime() / 1000);
      
      // Convert price to Wei (assuming 18 decimals)
      const priceInWei = BigInt(parseFloat(formData.ticketPrice) * 1e18).toString();

      // Call smart contract via MiniKit
      const response = await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: contractAddress as `0x${string}`,
          abi: TicketNFTABI,
          functionName: 'createEvent',
          args: [
            formData.name,
            formData.description,
            dateTimestamp,
            formData.location,
            priceInWei,
            parseInt(formData.totalTickets),
            formData.eventType
          ],
        }],
      });

      if (response.finalPayload) {
        // Check status before creating event
        if (response.finalPayload.status === 'success') {
          // Create event object for local state
          const newEvent: Event = {
            id: Date.now(), // In real implementation would get from event log
            name: formData.name,
            description: formData.description,
            date: dateTimestamp,
            location: formData.location,
            ticketPrice: formData.ticketPrice,
            totalTickets: parseInt(formData.totalTickets),
            soldTickets: 0,
            vendor: response.finalPayload.transaction_id || '0x...', // transaction_id available only on success
            eventType: formData.eventType,
          };

          onEventCreated?.(newEvent);
          
          // Reset form
          setFormData({
            name: '',
            description: '',
            date: '',
            location: '',
            ticketPrice: '',
            totalTickets: '',
            eventType: 'Conference' as const
          });
        } else {
          console.error('Transaction submission failed:', response.finalPayload);
          alert('Error creating event. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg h-24"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date and Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ticket Price (WLD)</label>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Number of Tickets</label>
          <input
            type="number"
            name="totalTickets"
            value={formData.totalTickets}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Event Type</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="Conference">Conference</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Sport">Sport</option>
            <option value="Concert">Concert</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </Button>
      </form>
    </div>
  );
} 