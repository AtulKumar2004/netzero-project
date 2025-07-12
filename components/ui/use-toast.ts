'use client';

import { toast as sonnerToast } from 'sonner';

export const toast = {
  message: (title: string, options?: { description?: string }) => {
    sonnerToast(title, {
      description: options?.description,
    });
  },
  success: (title: string, options?: { description?: string }) => {
    sonnerToast.success(title, {
      description: options?.description,
    });
  },
  error: (title: string, options?: { description?: string }) => {
    sonnerToast.error(title, {
      description: options?.description,
    });
  },
  warning: (title: string, options?: { description?: string }) => {
    sonnerToast.warning?.(title, {
      description: options?.description,
    });
  },
  info: (title: string, options?: { description?: string }) => {
    sonnerToast.info?.(title, {
      description: options?.description,
    });
  },
};
