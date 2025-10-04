import { LeaderboardRow, formatTime } from '@/lib/leaderboards';
import { CSVExportButton } from './CSVExportButton';

interface TableProps {
  title: string;
  subtitle: string;
  icon: string;
  rows: LeaderboardRow[];
}

export function Table({ title, subtitle, icon, rows }: TableProps) {
  const seasons = [
    { key: 'fall', name: 'Fall 2025' },
    { key: 'winter', name: 'Winter 2025' },
    { key: 'spring', name: 'Spring 2026' },
    { key: 'summer', name: 'Summer 2026' },
  ] as const;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur">
      {/* Header */}
      <div className="px-4 py-3 bg-white/5 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              {icon} {title}
            </h2>
            <p className="text-sm text-white/60 mt-1">{subtitle}</p>
          </div>
          <CSVExportButton title={title} rows={rows} />
        </div>
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-white/5 backdrop-blur sticky top-0 border-b border-white/10">
        <div className="font-semibold text-white">#</div>
        <div className="font-semibold text-white">Rider</div>
        {seasons.map((season) => (
          <div key={season.key} className="text-center text-sm font-semibold text-white">
            {season.name}
          </div>
        ))}
      </div>
      
      {/* Table Body */}
      <div>
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-white/60">
            No riders yet. Be the first to complete the loop!
          </div>
        ) : (
          rows.map((row, idx) => (
            <div 
              key={row.riderId} 
              className="grid grid-cols-6 gap-4 px-4 py-3 border-t border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="font-semibold text-white">{idx + 1}</div>
              <div className="truncate text-white">{row.riderName}</div>
              {seasons.map((season) => (
                <div key={season.key} className="text-center">
                  {row.seasons[season.key] ? (
                    <span className="inline-block min-w-[60px] text-center rounded-md px-2 py-1 text-sm bg-white/10 text-white">
                      {formatTime(row.seasons[season.key])}
                    </span>
                  ) : (
                    <span className="text-white/30">–</span>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

