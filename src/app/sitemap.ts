export default function sitemap() {
  const base = "https://switchbacklabsco.com";
  const pages = ["", "pm-of-the-future", "how-i-work", "projects", "projects/training", "projects/hubspot-franchise", "projects/crop-planning", "projects/crop-planning/demo", "projects/4soh", "about", "privacy", "terms", "race-trackingV2", "pedalhub", "training"];
  return pages.map((p) => ({ url: `${base}/${p}`.replace(/\/$/, ""), lastModified: new Date() }));
}
