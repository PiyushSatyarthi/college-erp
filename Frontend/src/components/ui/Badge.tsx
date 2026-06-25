import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "published" | "outline";
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        {
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300": variant === "default",
          "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400": variant === "success",
          "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400": variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400": variant === "danger",
          "bg-blue-50 text-blue-800 dark:bg-slate-800 dark:text-blue-400": variant === "info" || variant === "published",
          "text-slate-950 border border-slate-200 dark:text-slate-50 dark:border-slate-800": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
