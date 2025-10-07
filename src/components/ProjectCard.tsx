import Link from "next/link";

export default function ProjectCard({
  title, blurb, href, actions,
}: { title:string; blurb:string; href:string; actions?:React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-700 mt-1">{blurb}</p>
      <div className="flex gap-3 mt-3">
        <Link className="underline" href={href}>Details</Link>
        {actions}
      </div>
    </div>
  );
}
