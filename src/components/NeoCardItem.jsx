import React from 'react';

/**
 * NeoCardItem: Exactly reproduces the wireframe card component from the user's reference image
 * (e.g. PHP card with protruding accent block, lecturer/depot line, title, rating boxes, and [ > ] arrow)
 */
export default function NeoCardItem({
  badgeText = 'php',
  badgeSubtext = '12 wk ; 0%',
  badgeColor = 'bg-[#68759e]', // muted periwinkle from screenshot
  metaLabel = 'Lecturer',
  metaValue = 'Rasmus Lerdorf',
  metaLinkText = '',
  title = 'learn php 2',
  subtitle = '■ □ Beginner Friendly',
  stars = 5,
  onClick,
  onActionClick,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col sm:flex-row items-stretch bg-white border-2 border-black rounded-lg shadow-neo transition-all hover:-translate-y-0.5 hover:shadow-neo-lg cursor-pointer overflow-hidden ${className}`}
    >
      {/* Left Protruding Accent Block (as seen in screenshot) */}
      <div
        className={`${badgeColor} text-white font-mono p-4 sm:w-36 flex-shrink-0 flex flex-col justify-between border-b-2 sm:border-b-0 sm:border-r-2 border-black`}
      >
        <div className="text-xl sm:text-2xl font-bold tracking-tight lowercase">
          {badgeText}
        </div>
        <div className="text-[11px] font-medium opacity-90 tracking-wide mt-2">
          {badgeSubtext}
        </div>
      </div>

      {/* Main Wireframe Card Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-4">
        {/* Top Meta Line: Lecturer / Depot / District */}
        <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-2">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {metaLabel}
            </span>
            <span className="text-xs font-mono font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">
              {metaValue}
            </span>
          </div>
          {metaLinkText && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 border border-black rounded text-slate-700">
              {metaLinkText}
            </span>
          )}
        </div>

        {/* Big Title & Subtitle / Urgency */}
        <div>
          <h4 className="text-base sm:text-lg font-mono font-bold text-slate-900 leading-snug tracking-tight lowercase group-hover:text-blue-900">
            {title}
          </h4>
          <div className="text-xs font-mono text-slate-600 mt-1 flex items-center gap-1.5">
            <span>{subtitle}</span>
          </div>
        </div>

        {/* Bottom Bar: 5 Star Boxes & Arrow Button [ > ] */}
        <div className="flex items-center justify-between pt-2 border-t border-black/10">
          {/* Star Rating Boxes (as seen in screenshot: [★][★][★][★][★]) */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 border border-black flex items-center justify-center text-[10px] ${
                  i < stars ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                ★
              </div>
            ))}
          </div>

          {/* Forward Arrow Box [ > ] */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onActionClick) onActionClick();
              else if (onClick) onClick();
            }}
            className="w-8 h-8 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center font-mono font-bold text-sm transition-colors shadow-neo-sm"
            title="Inspect Details"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
