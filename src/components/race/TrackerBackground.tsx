
/**
 * Decorative background for the Four-Seasons tracker.
 * - Fills the viewport behind content
 * - Low contrast + gradient wash keeps UI readable
 * - aria-hidden so it's ignored by assistive tech
 */
export default function TrackerBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        backgroundImage: 'url(/race/4soh-background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.7
      }}
    />
  );
}
