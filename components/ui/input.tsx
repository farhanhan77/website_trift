import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefixText?: string;
  suffixText?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, prefixText, suffixText, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixText && (
            <span className="absolute left-3 text-xs font-medium text-zinc-400 select-none pointer-events-none">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-lg bg-zinc-900/90 border border-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500",
              "focus:border-amber-500/80 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-150",
              prefixText && "pl-10",
              suffixText && "pr-10",
              error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {suffixText && (
            <span className="absolute right-3 text-xs font-medium text-zinc-400 select-none pointer-events-none">
              {suffixText}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
