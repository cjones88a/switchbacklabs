"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export function Tabs({ children, defaultValue, value, onValueChange }: {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || "");
  
  const currentValue = value !== undefined ? value : activeTab;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className="w-full">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            activeValue: currentValue, 
            onValueChange: handleValueChange 
          } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className, activeValue, onValueChange }: {
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-2 rounded-full bg-zinc-100 p-1",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
        return React.cloneElement(child, { 
          activeValue, 
          onValueChange 
        } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ 
  children, 
  value, 
  className, 
  activeValue, 
  onValueChange 
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const isActive = activeValue === value;
  
  return (
    <button
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium text-zinc-700 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-zinc-900 transition",
        isActive && "bg-white shadow text-zinc-900",
        className
      )}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  children, 
  value, 
  activeValue, 
  className 
}: {
  children: React.ReactNode;
  value: string;
  activeValue?: string;
  className?: string;
}) {
  if (activeValue !== value) return null;
  
  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  );
}