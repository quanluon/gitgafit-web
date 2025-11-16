import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export enum WebSocketEvent {
  // Connection events
  REGISTER_USER = 'register-user',
  REGISTRATION_SUCCESS = 'registration-success',
  REGISTRATION_ERROR = 'registration-error',

  // Workout generation events
  WORKOUT_GENERATION_STARTED = 'workout-generation-started',
  WORKOUT_GENERATION_PROGRESS = 'workout-generation-progress',
  WORKOUT_GENERATION_COMPLETE = 'workout-generation-complete',
  WORKOUT_GENERATION_ERROR = 'workout-generation-error',

  // Meal plan generation events
  MEAL_GENERATION_STARTED = 'meal-generation-started',
  MEAL_GENERATION_PROGRESS = 'meal-generation-progress',
  MEAL_GENERATION_COMPLETE = 'meal-generation-complete',
  MEAL_GENERATION_ERROR = 'meal-generation-error',

  // InBody OCR events
  INBODY_OCR_STARTED = 'inbody-ocr-started',
  INBODY_OCR_PROGRESS = 'inbody-ocr-progress',
  INBODY_OCR_COMPLETE = 'inbody-ocr-complete',
  INBODY_OCR_ERROR = 'inbody-ocr-error',
}

interface NotificationPayload {
  jobId: string | number;
  progress?: number;
  message?: string;
  planId?: string;
  error?: string;
}

type EventHandler = (data: NotificationPayload) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<WebSocketEvent, Set<EventHandler>> = new Map();
  private userId: string | null = null;

  /**
   * Initialize socket connection
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.userId = userId;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.registerUser(userId);
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    this.socket.on(WebSocketEvent.REGISTRATION_SUCCESS, (data: { userId: string }) => {
      console.log('[Socket] Registered successfully:', data.userId);
    });

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Register user with socket server
   */
  private registerUser(userId: string): void {
    if (this.socket) {
      this.socket.emit(WebSocketEvent.REGISTER_USER, { userId });
    }
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    const events = Object.values(WebSocketEvent).filter(
      (event) =>
        event !== WebSocketEvent.REGISTER_USER &&
        event !== WebSocketEvent.REGISTRATION_SUCCESS &&
        event !== WebSocketEvent.REGISTRATION_ERROR,
    );

    events.forEach((event) => {
      this.socket?.on(event, (data: NotificationPayload) => {
        console.log(`[Socket] Received event: ${event}`, data);
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      });
    });
  }

  /**
   * Subscribe to an event
   */
  on(event: WebSocketEvent, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)?.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: WebSocketEvent, handler: EventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
      console.log('[Socket] Disconnected and cleaned up');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

export const socketService = new SocketService();
