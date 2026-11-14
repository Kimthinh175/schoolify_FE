'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  align?: 'center' | 'top';
  fullscreen?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

export function Dialog({
  isOpen,
  open,
  onClose,
  showCloseButton = true,
  title,
  description,
  children,
  footer,
  className,
  containerClassName,
  align = 'center',
  fullscreen = false,
  maxWidth = 'md',
}: DialogProps) {
  const modalOpen = Boolean(isOpen ?? open);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'sm:max-w-[92vw]',
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center',
            fullscreen
              ? 'p-0 items-stretch bg-white dark:bg-slate-950'
              : cn(
                  'p-0 sm:p-4',
                  align === 'top'
                    ? 'items-end sm:items-start sm:pt-6 md:pt-10 lg:pt-12'
                    : 'items-end sm:items-center'
                ),
            containerClassName
          )}
        >
          {/* Backdrop */}
          {!fullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />
          )}

          {/* Modal Panel - Mobile Drawer / Desktop Centered / Fullscreen */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: fullscreen ? 0.99 : 0.95, y: fullscreen ? 0 : 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: fullscreen ? 0.99 : 0.95, y: fullscreen ? 0 : 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={cn(
              'relative z-50 w-full bg-white dark:bg-slate-950 flex flex-col',
              fullscreen
                ? 'h-full max-h-screen rounded-none border-0 p-4 sm:p-6 md:px-10 md:py-6 overflow-hidden'
                : 'rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh]',
              !fullscreen && maxWidthClasses[maxWidth],
              className
            )}
          >
            {/* Header */}
            {Boolean(title || description) ? (
              <div className={cn(
                'flex items-start justify-between pb-3 shrink-0',
                fullscreen && 'border-b border-slate-100 dark:border-slate-800/80 pb-4'
              )}>
                <div className="flex-1 min-w-0 mr-3">
                  {title && (
                    typeof title === 'string' ? (
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                    ) : (
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{title}</div>
                    )
                  )}
                  {description && (
                    typeof description === 'string' ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>
                    )
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'shrink-0 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer',
                      fullscreen ? 'p-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5' : 'p-1.5'
                    )}
                  >
                    {fullscreen && <span className="hidden sm:inline text-xs font-medium text-slate-500">Đóng</span>}
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ) : (
              showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'absolute top-4 right-4 z-10 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer',
                    fullscreen ? 'p-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5' : 'p-1.5'
                  )}
                >
                  {fullscreen && <span className="hidden sm:inline text-xs font-medium text-slate-500">Đóng</span>}
                  <X className="h-5 w-5" />
                </button>
              )
            )}

            {/* Body */}
            <div className={cn(
              'overflow-y-auto flex-1 pr-1',
              Boolean(title || description) ? 'py-2' : 'pt-0 pb-1',
              fullscreen && 'py-4 sm:py-6'
            )}>
              {children}
            </div>

            {/* Footer */}
            {footer && <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
