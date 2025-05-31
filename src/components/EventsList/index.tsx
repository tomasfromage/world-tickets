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
    const badges = {
      'Sport': { emoji: '🏀', color: 'bg-orange-100 text-orange-600 border-orange-200' },
      'Concert': { emoji: '🎵', color: 'bg-purple-100 text-purple-600 border-purple-200' },
      'Hackathon': { emoji: '💻', color: 'bg-blue-100 text-blue-600 border-blue-200' },
      'Conference': { emoji: '🎯', color: 'bg-green-100 text-green-600 border-green-200' },
      'Other': { emoji: '📅', color: 'bg-gray-100 text-gray-600 border-gray-200' }
    };
    return badges[type as keyof typeof badges] || badges['Other'];
  };

  // Skeleton component for loading
  const EventSkeleton = () => (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white animate-pulse shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-300 rounded w-2/3"></div>
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
        </div>
        
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
            <div className="bg-gray-300 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        {showCreateButton && (
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onCreateEvent}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              Create Event
            </Button>
          </div>
        )}
        
        <div className="flex gap-3 flex-wrap">
          <select 
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            placeholder="Search location..."
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter.location || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value || undefined }))}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          // Show loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No events found</p>
            <p className="text-gray-400 text-sm">Try changing your filters or check back later</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const badge = getEventTypeBadge(event.eventType);
            return (
              <div 
                key={event.id} 
                className="group p-6 border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer bg-white hover:border-blue-300 hover:-translate-y-1"
                onClick={() => onEventSelect(event)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {event.name}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                      <span className="mr-1">{badge.emoji}</span>
                      {event.eventType}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <DollarCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-green-600">{event.ticketPrice} WLD</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {event.soldTickets}/{event.totalTickets} sold
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((event.soldTickets / event.totalTickets) * 100)}% capacity
                      </span>
                    </div>
                    <div className="w-24">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min((event.soldTickets / event.totalTickets) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}; 