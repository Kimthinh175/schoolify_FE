'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
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
  bodyClassName?: string;
  containerClassName?: string;
  align?: 'center' | 'top';
  fullscreen?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

const emptySubscribe = () => () => {};

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
  bodyClassName,
  containerClassName,
  align = 'center',
  fullscreen = false,
  maxWidth = 'md',
}: DialogProps) {
  const modalOpen = Boolean(isOpen ?? open);
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  React.useEffect(() => {
    if (!modalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
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

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {modalOpen && (
        <div
          className={cn(
            'fixed inset-0 z-[100] flex justify-center overflow-hidden',
            fullscreen
              ? 'p-0 items-stretch bg-white dark:bg-slate-950'
              : cn(
                  'p-0 sm:p-4 md:p-6',
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
              className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs transition-opacity"
            />
          )}

          {/* Modal Panel - Mobile Drawer / Desktop Centered / Fullscreen */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: fullscreen ? 0.99 : 0.96, y: fullscreen ? 0 : 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: fullscreen ? 0.99 : 0.96, y: fullscreen ? 0 : 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className={cn(
              'relative z-10 w-full bg-white dark:bg-slate-950 flex flex-col min-h-0 overflow-hidden',
              fullscreen
                ? 'h-full max-h-dvh rounded-none border-0 p-4 sm:p-6 md:px-10 md:py-6'
                : 'rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[90dvh]',
              !fullscreen && maxWidthClasses[maxWidth],
              className
            )}
          >
            {/* Header */}
            {Boolean(title || description) ? (
              <div
                className={cn(
                  'flex items-start justify-between pb-3.5 shrink-0 border-b border-slate-100 dark:border-slate-800/80',
                  fullscreen && 'pb-4'
                )}
              >
                <div className="flex-1 min-w-0 mr-3">
                  {title &&
                    (typeof title === 'string' ? (
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {title}
                      </h2>
                    ) : (
                      <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {title}
                      </div>
                    ))}
                  {description &&
                    (typeof description === 'string' ? (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {description}
                      </p>
                    ) : (
                      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {description}
                      </div>
                    ))}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Đóng hộp thoại"
                    className={cn(
                      'shrink-0 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer',
                      fullscreen
                        ? 'p-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5'
                        : 'p-1.5'
                    )}
                  >
                    {fullscreen && (
                      <span className="hidden sm:inline text-xs font-medium text-slate-500">Đóng</span>
                    )}
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ) : (
              showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng hộp thoại"
                  className={cn(
                    'absolute top-4 right-4 z-10 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer',
                    fullscreen
                      ? 'p-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5'
                      : 'p-1.5'
                  )}
                >
                  {fullscreen && (
                    <span className="hidden sm:inline text-xs font-medium text-slate-500">Đóng</span>
                  )}
                  <X className="h-5 w-5" />
                </button>
              )
            )}

            {/* Body */}
            <div
              className={cn(
                'overflow-y-auto overscroll-contain flex-1 min-h-0 pr-1',
                Boolean(title || description) ? 'pt-3.5 pb-1' : 'pt-0 pb-1',
                fullscreen && 'py-4 sm:py-6',
                bodyClassName
              )}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
