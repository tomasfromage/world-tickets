'use client';

import { Event, EventFilter } from '@/types/events';
import { Button, ListItem } from '@worldcoin/mini-apps-ui-kit-react';
import { Calendar, MapPin, DollarCircle } from 'iconoir-react';
import { useState, useEffect } from 'react';

interface EventsListProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  showCreateButton?: boolean;
  onCreateEvent?: () => void;
}

export const EventsList = ({ 
  events, 
  onEventSelect, 
  showCreateButton = false,
  onCreateEvent 
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
    return new Date(timestamp * 1000).toLocaleDateString('cs-CZ', {
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

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Dostupné události</h2>
          {showCreateButton && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onCreateEvent}
            >
              Vytvořit událost
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            className="px-3 py-1 border rounded text-sm"
            value={filter.eventType || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, eventType: e.target.value || undefined }))}
          >
            <option value="">Všechny typy</option>
            <option value="Sport">Sport</option>
            <option value="Concert">Koncert</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Conference">Konference</option>
            <option value="Other">Ostatní</option>
          </select>
          
          <input
            type="text"
            placeholder="Místo..."
            className="px-3 py-1 border rounded text-sm"
            value={filter.location || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value || undefined }))}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Žádné události nenalezeny
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
                    {event.soldTickets}/{event.totalTickets} prodáno
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