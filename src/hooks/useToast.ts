import { useCallback } from 'react';
import toast, { Toast } from 'react-hot-toast';
import type { Renderable } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  id?: string;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

export function useToast() {
  const showSuccess = useCallback(
    (message: string | ((t: Toast) => Renderable), options?: ToastOptions): void => {
      if (options?.id) {
        toast.dismiss(options.id);
      }
      toast.success(message, {
        duration: options?.duration ?? 2000,
        id: options?.id,
        position: options?.position ?? 'top-center',
      });
    },
    [],
  );

  const showError = useCallback(
    (message: string | ((t: Toast) => Renderable), options?: ToastOptions): void => {
      if (options?.id) {
        toast.dismiss(options.id);
      }
      toast.error(message, {
        duration: options?.duration ?? 4000,
        id: options?.id,
        position: options?.position ?? 'top-center',
      });
    },
    [],
  );

  const showInfo = useCallback(
    (message: string | ((t: Toast) => Renderable), options?: ToastOptions): void => {
      if (options?.id) {
        toast.dismiss(options.id);
      }
      toast(message, {
        duration: options?.duration ?? 3000,
        id: options?.id,
        position: options?.position ?? 'top-center',
      });
    },
    [],
  );

  const showLoading = useCallback((message: string, options?: ToastOptions): string => {
    if (options?.id) {
      toast.dismiss(options.id);
    }
    return toast.loading(message, {
      id: options?.id,
      position: options?.position ?? 'top-center',
    });
  }, []);

  const dismiss = useCallback((id?: string): void => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }, []);

  const dismissAll = useCallback((): void => {
    toast.dismiss();
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismiss,
    dismissAll,
  };
}
