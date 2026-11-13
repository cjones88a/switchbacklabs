import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { DISCLAIMER_TEXT } from "@/lib/trainingDisclaimerCopy";

export const metadata = { title: "Terms of Service — Switchback Labs" };

export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      updated="November 13, 2026"
      lede={
        <>
          <p>
            Switchback Labs is a portfolio of write-ups, experiments, demos, and tools. They can be added, changed, or removed. You can read them and try them. This is not a paid product, a consultancy engagement, or a live race-timing service.
          </p>
          <p className="mt-4 text-base">
            I update these terms when I materially change what the site offers or what you are asked to accept. The date above is the date of the last material change. Continuing to use the site after that date means you accept the update.
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed">
            <li>
              Tools are optional. A tool that connects an outside account, or that drafts something for you, says so in the tool.
            </li>
            <li>
              A training plan is AI-generated. It is not medical, health, or professional coaching advice. You train at your own risk.
            </li>
            <li>
              Sample pages are not live results. They do not publish your name.
            </li>
            <li>
              I may limit how often a tool can be used, to prevent abuse and to control cost.
            </li>
          </ul>
        </>
      }
    >
      <LegalSection title="The site">
        <p>
          No account is required to read the site. The pages describe work I have done and tools I have built to show that work. They are not an offer to take on a client. The site is not aimed at children.
        </p>
      </LegalSection>

      <LegalSection title="Tools">
        <p>
          Experiments, demos, and tools on the site may change. A tool may be unfinished. Details that matter for that tool, such as what it reads and what it does not save, are shown in the tool. Those details do not replace this page.
        </p>
        <p>
          If you connect an outside account, you can revoke that access in the other service. For Strava, that is{" "}
          <a href="https://www.strava.com/settings/apps">Strava&apos;s app settings</a>. I never see your password for that account. A connected tool asks for read access. It does not ask to change the account.
        </p>
      </LegalSection>

      <LegalSection title="Generated plans and advice">
        <p>
          A tool may ask an AI provider to draft a result from information you connect and from what you type. Today that provider is Anthropic. The result is a draft. It can be wrong. You have to accept the following before a training plan is generated:
        </p>
        <p>{DISCLAIMER_TEXT}</p>
        <p>
          That acceptance is remembered in an encrypted cookie in this browser. It is not a record of your activities or of the plan. If the disclaimer changes in a material way, the tool can ask again. The same limits apply to any later tool that generates training, health, or similar advice: it is not professional advice, and you are responsible for how you use it.
        </p>
        <p>
          Anthropic&apos;s policy is at{" "}
          <a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a>.
        </p>
      </LegalSection>

      <LegalSection title="Browser tools and shared links">
        <p>
          Some tools are calculators or prototypes that run in the browser. The figures you type are yours. The tool may not look up live prices, yields, or other outside data. If it gives you a share link, anyone with the link can open what you put in it.
        </p>
        <p>
          Feedback you choose to send can be posted in public, including as a GitHub issue, or emailed to me. Do not include anything in that note that you need to keep private.
        </p>
      </LegalSection>

      <LegalSection title="Sample data">
        <p>
          Some pages show fictional or sample data so the interface can be tried. They are not live timing or live results. They do not connect your account. There is no step that publishes your name or your results.
        </p>
      </LegalSection>

      <LegalSection title="Limits">
        <p>
          I may limit how often tools can be used, to prevent abuse and to control cost. A tool can refuse a new request when that happens. Trying again later is the remedy. I do not promise that a tool will be available, or that it will keep working in its current form.
        </p>
      </LegalSection>

      <LegalSection title="As-is">
        <p>
          The pages, the tools, and any generated result are provided as-is. I do not promise they are accurate, complete, or fit for a particular purpose. I am not your coach, your doctor, or your attorney. You use the site at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          I update these terms when I materially change what the site offers or what you are asked to accept. The date at the top changes with that update. Continuing to use the site after that date means you accept the updated terms.
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
