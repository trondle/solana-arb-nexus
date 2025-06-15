
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketSubscription {
  id: string;
  callback: (data: any) => void;
  filter?: (data: any) => boolean;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, WebSocketSubscription>();
  private reconnectInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private useRealConnection = false;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!this.instance) {
      this.instance = new WebSocketManager();
    }
    return this.instance;
  }

  setRealConnection(enabled: boolean) {
    this.useRealConnection = enabled;
  }

  connect(url: string = 'wss://api.example.com/realtime'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        if (this.useRealConnection) {
          // Real WebSocket connection
          this.ws = new WebSocket(url);
          this.setupEventListeners();
          
          this.ws.onopen = () => {
            this.isConnecting = false;
            resolve();
          };
          
          this.ws.onerror = (error) => {
            this.isConnecting = false;
            reject(error);
          };
        } else {
          // Mock WebSocket for development
          this.ws = {
            readyState: 1, // OPEN
            send: (data: string) => {
              console.log('Mock WebSocket send:', data);
            },
            close: () => {
              console.log('Mock WebSocket close');
            },
            addEventListener: (event: string, handler: any) => {
              if (event === 'open') {
                setTimeout(() => handler({}), 100);
              }
            },
            removeEventListener: () => {},
          } as any;

          this.setupEventListeners();
          this.isConnecting = false;
          resolve();
        }
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.subscriptions.forEach(sub => {
        this.sendSubscribeMessage(sub.id);
      });
    });

    this.ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.ws.addEventListener('close', () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      if (this.useRealConnection) {
        this.attemptReconnect();
      }
    });

    this.ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    this.subscriptions.forEach(sub => {
      if (!sub.filter || sub.filter(message.data)) {
        sub.callback(message.data);
      }
    });
  }

  subscribe(
    id: string, 
    callback: (data: any) => void, 
    filter?: (data: any) => boolean
  ): () => void {
    const subscription: WebSocketSubscription = { id, callback, filter };
    this.subscriptions.set(id, subscription);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribeMessage(id);
    }

    return () => {
      this.subscriptions.delete(id);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendUnsubscribeMessage(id);
      }
    };
  }

  private sendSubscribeMessage(id: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel: id,
        timestamp: Date.now()
      }));
    }
  }

  private sendUnsubscribeMessage(id: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel: id,
        timestamp: Date.now()
      }));
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    this.reconnectAttempts++;

    this.reconnectInterval = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
  }

  // Enhanced mock data simulation for development
  startMockDataStream(): void {
    if (this.useRealConnection) return; // Don't start mock if using real connection

    setInterval(() => {
      const mockData = {
        type: 'price_update',
        data: {
          symbol: 'SOL',
          price: 23.45 + (Math.random() - 0.5) * 0.5,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };
      
      this.handleMessage(mockData);
    }, 2000);
  }
}
