import { redirect } from "next/navigation";

/** The training app lives at /training. Keep this path from 404ing old links. */
export default function TrainingPlanRedirect() {
  redirect("/training");
}
