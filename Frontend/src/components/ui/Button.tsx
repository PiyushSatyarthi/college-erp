import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-slate-950",
          {
            "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700": variant === "primary",
            "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900": variant === "secondary",
            "bg-white border border-red-300 text-red-600 hover:bg-red-50 dark:bg-slate-950 dark:border-red-900/50 dark:text-red-500 dark:hover:bg-red-900/20": variant === "destructive",
            "border border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100 text-slate-700 dark:text-slate-300": variant === "outline",
            "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 text-slate-600 dark:text-slate-400": variant === "ghost" || variant === "icon",
            "h-9 px-3": size === "sm",
            "h-10 py-2 px-4": size === "md" && variant !== "icon",
            "h-11 px-8": size === "lg",
            "h-10 w-10 p-2": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
