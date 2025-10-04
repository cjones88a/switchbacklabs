"use client";

import { LeaderboardRow, formatTime } from '@/lib/leaderboards';

interface CSVExportButtonProps {
  title: string;
  rows: LeaderboardRow[];
}

function exportToCSV(title: string, rows: LeaderboardRow[]) {
  const seasons = [
    { key: 'fall', name: 'Fall 2025' },
    { key: 'winter', name: 'Winter 2025' },
    { key: 'spring', name: 'Spring 2026' },
    { key: 'summer', name: 'Summer 2026' },
  ] as const;

  // Create CSV headers
  const headers = ['Rank', 'Rider', ...seasons.map(s => s.name)];
  
  // Create CSV rows
  const csvRows = rows.map((row, idx) => [
    idx + 1,
    row.riderName,
    ...seasons.map(season => row.seasons[season.key] ? formatTime(row.seasons[season.key]) : '–')
  ]);
  
  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_leaderboard.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function CSVExportButton({ title, rows }: CSVExportButtonProps) {
  return (
    <button
      onClick={() => exportToCSV(title, rows)}
      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
      title="Export to CSV"
    >
      📊 CSV
    </button>
  );
}
