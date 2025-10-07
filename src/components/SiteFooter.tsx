export default function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Switchback Labs</p>
        <p>Built for local riders 🫶</p>
      </div>
    </footer>
  );
}
