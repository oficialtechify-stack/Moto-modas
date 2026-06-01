import React from 'react';

export interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  variant?: 'amber' | 'dark' | 'emerald' | 'crimson';
}

// Keep a dummy GlassFilter so we don't break App.tsx imports!
export const GlassFilter: React.FC = () => null;

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  onClick,
  disabled = false,
  variant = 'amber',
}) => {
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Sleek streetwear design: sharp corners, solid vibrant contrast, bold slanted uppercase text
  let btnClasses = "relative flex items-center justify-center text-center select-none cursor-pointer transition-all duration-150 rounded-none font-black italic uppercase tracking-wider ";

  if (disabled) {
    btnClasses += "opacity-45 cursor-not-allowed pointer-events-none ";
  }

  // Streetwear colour variants inspired by Monochrome Luxury Aesthetics
  if (variant === 'amber') {
    // Elegant Solid White brand button
    btnClasses += "bg-white text-black border-2 border-white hover:bg-black hover:text-white hover:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]";
  } else if (variant === 'dark') {
    // Urban dark block with clean white/gray borders and hover highlight
    btnClasses += "bg-zinc-950 text-zinc-300 border-2 border-zinc-800 hover:border-white hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]";
  } else if (variant === 'emerald') {
    // Elegant grayscale accent button
    btnClasses += "bg-zinc-100 text-black border-2 border-zinc-100 hover:bg-black hover:text-white hover:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]";
  } else if (variant === 'crimson') {
    // Urban hot streetwear red active button
    btnClasses += "bg-[#ff2d55] text-white border-2 border-black hover:bg-black hover:text-[#ff2d55] hover:border-[#ff2d55] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]";
  }

  const content = (
    <div
      onClick={handleInteraction}
      className={`${btnClasses} ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center gap-2 w-full">
        {children}
      </div>
    </div>
  );

  return href && !disabled ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};
