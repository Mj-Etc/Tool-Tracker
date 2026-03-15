import { WebSocket, WebSocketServer } from 'ws';

export function UPGRADE(
  client: WebSocket,
  server: WebSocketServer
) {
  console.log('A client connected');

  client.on('message', (message) => {
    console.log('Received message:', message.toString());
    // Broadcast message to all connected clients
    server.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(message.toString());
      }
    });
  });

  client.once('close', () => {
    console.log('A client disconnected');
  });
}
