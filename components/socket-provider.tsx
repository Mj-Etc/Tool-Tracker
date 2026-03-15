'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import { SOCKET_EVENT_MAP } from '@/lib/socket-events';

type SocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const { mutate } = useSWRConfig();

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        
        // Centralized Dispatcher logic
        const handler = SOCKET_EVENT_MAP[type];
        
        if (typeof handler === 'string') {
          mutate(handler);
        } else if (Array.isArray(handler)) {
          handler.forEach(key => mutate(key));
        } else if (typeof handler === 'function') {
          handler(mutate, payload);
        }
      } catch (e) {
        console.warn('Received non-JSON or unhandled socket message:', event.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    setSocket(ws);
  };

  useEffect(() => {
    connect();
    return () => {
      if (socket) socket.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      socket.send(messageString);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
