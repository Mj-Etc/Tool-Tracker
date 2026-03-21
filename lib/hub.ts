import { EventEmitter } from 'events';

class EventHub extends EventEmitter {
  private static instance: EventHub;

  public static getInstance(): EventHub {
    if (!EventHub.instance) {
      EventHub.instance = new EventHub();
    }
    return EventHub.instance;
  }

  public broadcast(event: string, data: any) {
    this.emit('message', { event, data });
  }

  public subscribe(cb: (msg: any) => void) {
    this.on('message', cb);
    return () => this.off('message', cb);
  }
}

export const eventHub = EventHub.getInstance();
