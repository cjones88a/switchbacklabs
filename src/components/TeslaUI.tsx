/**
 * TESLA-LEVEL UI COMPONENTS
 * Minimal, beautiful, functional - like a Model S dashboard
 */

import React from 'react';

interface TeslaButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function TeslaButton({ 
  onClick, 
  disabled = false, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  children 
}: TeslaButtonProps) {
  const baseClasses = "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-white text-black hover:bg-gray-100 focus:ring-white",
    secondary: "bg-transparent border border-white text-white hover:bg-white hover:text-black focus:ring-white",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-5 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-3xl"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

interface TeslaCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function TeslaCard({ title, children, className = "" }: TeslaCardProps) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface TeslaMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function TeslaMetric({ label, value, unit, trend = 'neutral', className = "" }: TeslaMetricProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-white'
  };
  
  return (
    <div className={`p-4 bg-white/10 rounded-lg ${className}`}>
      <div className="text-sm text-white/70 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${trendColors[trend]}`}>
        {value}
        {unit && <span className="text-lg text-white/70 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

interface TeslaProgressProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function TeslaProgress({ value, max, label, className = "" }: TeslaProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-white/70">{label}</span>
          <span className="text-white">{value}/{max}</span>
        </div>
      )}
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface TeslaAlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}

export function TeslaAlert({ type, title, message, onClose }: TeslaAlertProps) {
  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
  };
  
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };
  
  return (
    <div className={`p-4 rounded-lg border ${typeStyles[type]} backdrop-blur`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
