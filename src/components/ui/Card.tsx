import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden",
        hoverEffect &&
          "transition-all duration-200 hover:shadow-card-hover hover:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
