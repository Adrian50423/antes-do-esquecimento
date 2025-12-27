
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className, 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-xl font-bold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]";
  
  const variants = {
    primary: "bg-yellow-600 hover:bg-yellow-500 text-black shadow-2xl hover:scale-105 active:scale-95",
    outline: "border border-yellow-900/30 text-yellow-600 hover:bg-yellow-950/20 hover:border-yellow-600",
    ghost: "text-gray-500 hover:text-yellow-500 hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
