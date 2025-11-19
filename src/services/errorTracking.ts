import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';
import { useAuthStore } from '@store/authStore';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  stack?: string;
  componentStack?: string;
  [key: string]: unknown;
}

class ErrorTrackingService {
  private isInitialized = false;

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: 'Unhandled Promise Rejection',
        error: event.reason,
        promise: true,
      });
    });

    this.isInitialized = true;
  }

  logError(
    error: Error | string | unknown,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext,
  ): void {
    try {
      const errorInfo = this.extractErrorInfo(error);
      const fullContext = this.buildContext(context);

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error('[Error Tracking]', {
          ...errorInfo,
          severity,
          context: fullContext,
        });
      }

      // Send to Firebase Analytics
      if (analytics) {
        logEvent(analytics, 'exception', {
          description: errorInfo.message,
          fatal: severity === ErrorSeverity.CRITICAL,
          error_type: errorInfo.type,
          error_message: errorInfo.message,
          error_stack: errorInfo.stack?.substring(0, 500) || undefined, // Limit stack trace length
          severity,
          ...fullContext,
        });
      }
    } catch (trackingError) {
      // Fallback to console if Firebase fails
      console.error('[Error Tracking] Failed to log error:', trackingError);
      console.error('[Error Tracking] Original error:', error);
    }
  }

  logCrash(error: Error | unknown, context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.CRITICAL, {
      ...context,
      crash: true,
    });
  }

  logWarning(message: string, context?: ErrorContext): void {
    this.logError(message, ErrorSeverity.LOW, {
      ...context,
      warning: true,
    });
  }

  private extractErrorInfo(error: Error | string | unknown): {
    message: string;
    type: string;
    stack?: string;
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        type: error.name || 'Error',
        stack: error.stack,
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        type: 'StringError',
      };
    }

    if (error && typeof error === 'object') {
      const errorObj = error as { message?: string; name?: string; stack?: string };
      return {
        message: errorObj.message || String(error),
        type: errorObj.name || 'UnknownError',
        stack: errorObj.stack,
      };
    }

    return {
      message: String(error),
      type: 'UnknownError',
    };
  }

  private buildContext(additionalContext?: ErrorContext): ErrorContext {
    const authState = useAuthStore.getState();
    const baseContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      userId: authState.user?._id,
      isAuthenticated: authState.isAuthenticated,
    };

    return {
      ...baseContext,
      ...additionalContext,
    };
  }
}

export const errorTracking = new ErrorTrackingService();

