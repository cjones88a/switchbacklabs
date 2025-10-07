export default function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Switchback Labs</p>
        <nav className="flex gap-4">
          <a href="mailto:switchbacklabsco@gmail.com">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
