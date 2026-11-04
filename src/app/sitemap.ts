export default function sitemap() {
  const base = "https://switchbacklabsco.com";
  const pages = ["", "how-i-work", "projects", "projects/training", "projects/hubspot-franchise", "projects/4soh", "projects/ai-sites", "about", "privacy", "terms", "race-trackingV2", "pedalhub", "training"];
  return pages.map((p) => ({ url: `${base}/${p}`.replace(/\/$/, ""), lastModified: new Date() }));
}
