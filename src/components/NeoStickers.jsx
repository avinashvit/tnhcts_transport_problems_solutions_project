import React from 'react';

// Chamfered / Cut-Corner Black Badge (as seen in screenshot: "/ info")
export function ChamferBadge({ text = '/ info', className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`chamfer-badge bg-black text-white font-mono text-xs font-bold px-3 py-1.5 inline-flex items-center justify-center select-none shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-pointer ${className}`}
    >
      <span>{text}</span>
    </div>
  );
}

// Neon Lime Sticky Note (as seen in screenshot: "note \n the commit must include ..")
export function NeonStickyNote({
  title = 'note',
  lines = ['the route', 'must include ..'],
  className = '',
  rotate = '-rotate-3',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#86efac] text-slate-900 border-2 border-black p-3.5 rounded-sm font-mono shadow-neo transition-transform hover:rotate-0 hover:scale-105 cursor-pointer ${rotate} ${className}`}
    >
      <div className="text-[11px] font-bold text-slate-700 tracking-wider mb-1 flex items-center justify-between">
        <span>{title}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
      </div>
      <div className="text-xs font-semibold leading-tight text-slate-950">
        {Array.isArray(lines) ? (
          lines.map((l, i) => (
            <div key={i} className="whitespace-nowrap">
              {l}
            </div>
          ))
        ) : (
          <div className="whitespace-pre-line">{lines}</div>
        )}
      </div>
    </div>
  );
}

// Code Tag Sticker (as seen in screenshot: "< /html>")
export function CodeTag({ text = '< /html>', className = '' }) {
  return (
    <div
      className={`font-mono text-xs font-bold text-pink-600 bg-pink-100/90 border border-pink-300 px-2.5 py-1 rounded-sm shadow-xs select-none inline-block ${className}`}
    >
      {text}
    </div>
  );
}

// 4-Point Starburst (✦ white sparkle seen in screenshot)
export function Starburst({ size = 28, className = '', color = 'white' }) {
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] text-white"
        style={{ color: color }}
      >
        <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
      </svg>
    </div>
  );
}

// Directional Arrow Pad (as seen in screenshot: small white square with ↙ ↗)
export function ArrowPad({ className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-9 h-9 bg-white border-2 border-black rounded-md flex items-center justify-center font-mono text-xs font-bold shadow-neo-sm hover:bg-slate-50 transition-colors cursor-pointer select-none ${className}`}
    >
      <div className="grid grid-cols-2 gap-1 text-[11px] leading-none text-slate-900">
        <span>↙</span>
        <span>↗</span>
      </div>
    </div>
  );
}

// Top-left Bracket Glyph (as seen in both cards in screenshot: minimal bracket symbol)
export function BracketGlyph({ className = '', size = 20 }) {
  return (
    <div className={`font-mono font-bold text-slate-900 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 4H4v6h3" />
        <path d="M10 11l-3 3 3 3" />
        <path d="M7 14h10" />
      </svg>
    </div>
  );
}
