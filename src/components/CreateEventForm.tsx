import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { Event } from '@/types/events';
import TicketNFTABI from '@/abi/TicketNFT.json';
import { 
  Calendar, 
  MapPin, 
  Dollar, 
  CreditCard, 
  User,
  Text,
  Sparks
} from 'iconoir-react';

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
    time: '',
    location: '',
    ticketPrice: '',
    totalTickets: '',
    eventType: 'Conference' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combine date and time
      const dateTimeString = `${formData.date}T${formData.time}`;
      const dateTimestamp = Math.floor(new Date(dateTimeString).getTime() / 1000);
      
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
            time: '',
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

  const eventTypeOptions = [
    { value: 'Conference', label: 'Conference', icon: '🎤' },
    { value: 'Hackathon', label: 'Hackathon', icon: '💻' },
    { value: 'Sport', label: 'Sport', icon: '⚽' },
    { value: 'Concert', label: 'Concert', icon: '🎵' },
    { value: 'Workshop', label: 'Workshop', icon: '🛠️' },
    { value: 'Other', label: 'Other', icon: '📋' },
  ];

  return (
    <div className="relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl" />
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparks className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
              <p className="text-sm text-gray-600">Fill in the details to create your event</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Text className="w-4 h-4 text-blue-500" />
              Event Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your event name..."
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Text className="w-4 h-4 text-green-500" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event in detail..."
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 h-32 resize-none"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className="w-4 h-4 text-purple-500" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-14 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              style={{ colorScheme: 'light' }}
              required
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full h-14 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              style={{ colorScheme: 'light' }}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="w-4 h-4 text-red-500" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Event venue or address..."
              className="w-full h-14 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Ticket Price */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Dollar className="w-4 h-4 text-yellow-500" />
              Ticket Price (WLD)
            </label>
            <div className="relative">
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full h-14 px-4 pr-16 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                step="0.01"
                min="0"
                required
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                WLD
              </div>
            </div>
          </div>

          {/* Total Tickets */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="w-4 h-4 text-indigo-500" />
              Total Tickets
            </label>
            <input
              type="number"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleInputChange}
              placeholder="100"
              className="w-full h-14 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              min="1"
              required
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CreditCard className="w-4 h-4 text-pink-500" />
              Event Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eventTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 min-w-0 ${
                    formData.eventType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value={option.value}
                    checked={formData.eventType === option.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xl flex-shrink-0">{option.icon}</span>
                  <span className="font-medium text-sm truncate">{option.label}</span>
                  {formData.eventType === option.value && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin text-white" />
                  Creating Event...
                </div>
              ) : (
                <div className="flex items-center gap-3 text-white">
                  <Sparks className="w-5 h-5" />
                  Create Event
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Footer note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <span className="text-blue-500">ℹ️</span>
            Your event will be created on the WorldChain blockchain and tickets will be minted as NFTs.
          </p>
        </div>
      </div>
    </div>
  );
} 