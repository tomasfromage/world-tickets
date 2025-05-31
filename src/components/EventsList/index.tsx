'use client';

import { Event, EventFilter } from '@/types/events';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { Calendar, MapPin, DollarCircle } from 'iconoir-react';
import { useState, useEffect } from 'react';

interface EventsListProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  showCreateButton?: boolean;
  onCreateEvent?: () => void;
  isLoading?: boolean;
}

export const EventsList = ({ 
  events, 
  onEventSelect, 
  showCreateButton = false,
  onCreateEvent,
  isLoading = false
}: EventsListProps) => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [filter, setFilter] = useState<EventFilter>({});

  useEffect(() => {
    let filtered = events;

    if (filter.eventType) {
      filtered = filtered.filter(event => event.eventType === filter.eventType);
    }

    if (filter.location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(filter.location!.toLowerCase())
      );
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(event => 
        event.date >= filter.dateFrom!.getTime() / 1000
      );
    }

    if (filter.dateTo) {
      filtered = filtered.filter(event => 
        event.date <= filter.dateTo!.getTime() / 1000
      );
    }

    if (filter.maxPrice) {
      filtered = filtered.filter(event => 
        parseFloat(event.ticketPrice) <= filter.maxPrice!
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeBadge = (type: string) => {
    const colors = {
      'Sport': '🏀',
      'Concert': '🎵',
      'Hackathon': '💻',
      'Conference': '🎯',
      'Other': '📅'
    };
    return colors[type as keyof typeof colors] || '📅';
  };

  // Skeleton component for loading
  const EventSkeleton = () => (
    <div className="p-4 border rounded-lg bg-white animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-300 rounded w-2/3"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
        
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
            <div className="bg-gray-300 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Available Events</h2>
          {showCreateButton && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onCreateEvent}
            >
              Create Event
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            className="px-3 py-1 border rounded text-sm"
            value={filter.eventType || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, eventType: e.target.value || undefined }))}
            disabled={isLoading}
          >
            <option value="">All Types</option>
            <option value="Sport">Sport</option>
            <option value="Concert">Concert</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Conference">Conference</option>
            <option value="Other">Other</option>
          </select>
          
          <input
            type="text"
            placeholder="Location..."
            className="px-3 py-1 border rounded text-sm"
            value={filter.location || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value || undefined }))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          // Show loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events found
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-white"
              onClick={() => onEventSelect(event)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <span className="text-lg">
                    {getEventTypeBadge(event.eventType)} {event.eventType}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm">
                  {event.description}
                </p>
                
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarCircle className="w-4 h-4 text-gray-500" />
                    <span>{event.ticketPrice} WLD</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-500">
                    {event.soldTickets}/{event.totalTickets} sold
                  </span>
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(event.soldTickets / event.totalTickets) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 