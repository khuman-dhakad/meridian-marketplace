import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Star, Sparkles, Flame } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "verified" | "vip" | "featured" | "urgent" | "neutral" | "outline";
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  showIcon = true,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const variantStyles = {
    verified: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    vip: "bg-amber-50 text-amber-800 border border-amber-300 font-semibold",
    featured: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    urgent: "bg-rose-50 text-rose-700 border border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    outline: "bg-white text-slate-700 border border-slate-300",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {showIcon && variant === "verified" && (
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
      )}
      {showIcon && variant === "vip" && (
        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
      )}
      {showIcon && variant === "featured" && (
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
      )}
      {showIcon && variant === "urgent" && (
        <Flame className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
      )}
      {children}
    </span>
  );
};
