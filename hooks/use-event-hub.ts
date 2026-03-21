'use client';

import { useEffect } from 'react';
import { useSWRConfig } from 'swr';

export function useEventHub () {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const es = new EventSource('/api/events');

    es.addEventListener('mutate', (e) => {
      try {
        const { key } = JSON.parse(e.data);
        if (key) {
          if (typeof key === 'string' && key.endsWith('*')) {
            // Wildcard match: revalidate all keys starting with the prefix
            const prefix = key.slice(0, -1);
            mutate((k) => typeof k === 'string' && k.startsWith(prefix));
          } else {
            // Exact match
            mutate(key);
          }
        }
      } catch (error) {
        console.error('Error parsing SSE mutate event:', error);
      }
    });

    // Handle heartbeats or other event types if needed
    es.addEventListener('ping', () => {
      // Just to keep the connection active in some environments
    });

    return () => {
      es.close();
    };
  }, [mutate]);
}
