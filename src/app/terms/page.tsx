import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata = { title: "Terms of Service — Switchback Labs" };

export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      updated="November 13, 2026"
      lede={
        <>
          <p>
            Switchback Labs is a portfolio. The pages are write-ups and prototypes I built to show the work. You can read them and try the prototypes. This is not a paid product, a consultancy engagement, or a race-timing service.
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed">
            <li>
              <strong className="font-medium text-gray-900">Training Coach</strong> is optional. It reads Strava rides you already have and asks Anthropic to draft a week. The draft is not a promise, and it is not medical advice.
            </li>
            <li>
              <strong className="font-medium text-gray-900">The crop prototype</strong> is a browser calculator. The numbers are whatever you type.
            </li>
            <li>
              <strong className="font-medium text-gray-900">The race page</strong> is fictional sample data. There is no step that publishes your name or your times.
            </li>
          </ul>
        </>
      }
    >
      <LegalSection title="The site">
        <p>
          No account is required to read the site. The pages describe work I have done. They are not an offer to take on a client. The site is not aimed at children.
        </p>
      </LegalSection>

      <LegalSection title="Training Coach">
        <p>
          Training Coach is voluntary. You choose to connect Strava. The app asks Strava for read access, including private activities. It does not ask to change your Strava account. I never see your Strava password. You can revoke Switchback Labs in{" "}
          <a href="https://www.strava.com/settings/apps">Strava&apos;s app settings</a>.
        </p>
        <p>
          When you generate a week, the app sends a summary of recent rides and the form you filled in to Anthropic, which drafts the plan. The plan is a draft. It can be wrong. It is not medical advice, and it is not a substitute for a coach or a doctor. I do not guarantee that a plan is safe, accurate, or suited to you. You decide whether to ride it.
        </p>
      </LegalSection>

      <LegalSection title="Crop planning prototype">
        <p>
          The crop page is a browser prototype for trying budget numbers. The figures you type are yours. The page does not look up live prices or yields. A share link contains the plan. Anyone with the link can open it.
        </p>
      </LegalSection>

      <LegalSection title="The race page">
        <p>
          The race page shows fictional sample riders bundled with the site. It is not live timing. It does not connect your Strava account. There is no consent step that publishes your name or your times.
        </p>
      </LegalSection>

      <LegalSection title="As-is">
        <p>
          The pages, the prototypes, and any generated plan are provided as-is. I do not promise they are accurate, complete, or fit for a particular purpose. I am not your coach, your doctor, or your attorney.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email: <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
