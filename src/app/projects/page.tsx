import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";

export const metadata = { title: "Projects — Switchback Labs" };

export default function Projects() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <ProjectCard
          title="Horsetooth 4SOH Race Tracker"
          blurb="Strava OAuth → segment efforts → Supabase → live leaderboard with admin windows."
          href="/projects/4soh"
          actions={<Link className="underline" href="/race-trackingV2">Live demo</Link>}
        />
        {/* Add more projects later */}
        <ProjectCard
          title="AI-assisted Lightweight Websites"
          blurb="Rapidly scaffold clean, modern marketing sites and internal tools using Next.js, Tailwind, and Vercel."
          href="/projects/ai-sites"
        />
      </div>
    </div>
  );
}
