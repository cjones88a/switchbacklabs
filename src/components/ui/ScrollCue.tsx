export default function ScrollCue() {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-8 opacity-80">
      <div className="w-10 h-10 rounded-full border-2 border-ink grid place-items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
