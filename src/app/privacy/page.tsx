import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata = { title: "Privacy Policy — Switchback Labs" };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 13, 2026"
      lede={
        <>
          <p>
            Switchback Labs is my site. I&apos;m Colt Jones, in Fort Collins, Colorado. This page describes the kinds of information the site may collect, why, and who else receives it.
          </p>
          <p className="mt-4 text-base">
            I update this page when I materially change what data I collect or who I share it with. The date above is the date of the last material change.
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed">
            <li>
              The site hosts experiments, demos, and tools. They can change. A tool that uses personal data says so in the tool.
            </li>
            <li>
              If you connect an outside account, I use secure, encrypted cookies to keep you connected and to remember that you accepted a disclaimer. I don&apos;t keep a database of your activity data beyond what that session needs.
            </li>
            <li>
              Some tools keep what you type in your browser, or in a link you choose to share. Feedback you submit may be public.
            </li>
            <li>
              I don&apos;t sell personal data. Email me if you want something deleted or if you need help disconnecting an account.
            </li>
          </ul>
          <p className="mt-6 text-base">
            Email{" "}
            <a className="text-gray-900 underline underline-offset-4" href="mailto:switchbacklabsco@gmail.com">
              switchbacklabsco@gmail.com
            </a>
            .
          </p>
        </>
      }
    >
      <LegalSection title="Experiments, demos, and tools">
        <p>
          The site is a portfolio. It hosts write-ups, experiments, demos, and tools. I may add, change, or remove them. This policy covers the categories of data those tools use, including tools I add later.
        </p>
        <p>
          A tool can show a shorter, specific note about what it reads. That note does not replace this page. If a new tool collects a new category of data, or sends data to someone this page does not describe, I will update this page.
        </p>
      </LegalSection>

      <LegalSection title="Connected accounts">
        <p>
          A tool may ask you to connect an account you already have. Today, Training Coach can connect Strava. The access it asks for is read-only. It can include activities that are not public. It does not ask to change your Strava account, and I never see your Strava password.
        </p>
        <p>
          After you approve, the tool can read the profile and activities Strava provides for that access, and use a summary of them for the thing you asked the tool to do. I do not keep a database of those activities, of the tokens that prove the connection, or of the result.
        </p>
        <p>
          You can disconnect the app in{" "}
          <a href="https://www.strava.com/settings/apps">Strava&apos;s app settings</a>. You can also delete this site&apos;s cookies in your browser. Strava&apos;s own policy is at{" "}
          <a href="https://www.strava.com/legal/privacy">strava.com/legal/privacy</a>.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and your session">
        <p>
          I use secure, encrypted cookies to keep you connected to a tool and to remember that you accepted a disclaimer. Page scripts cannot read those cookies. They are sent back to this site, not attached to other sites&apos; requests.
        </p>
        <p>
          The connection cookie holds what is needed to stay signed in for that session, such as the access granted by the outside service and when that access expires. The disclaimer cookie remembers that you accepted the current disclaimer. It does not hold your activities, your name, or the result the tool produced. If a disclaimer changes in a material way, the tool can ask you again.
        </p>
        <p>
          You can delete the cookies in your browser. There may not be a disconnect button inside the tool. Disconnecting in the outside service, such as Strava, is the reliable way to revoke access.
        </p>
      </LegalSection>

      <LegalSection title="Generated results">
        <p>
          A tool may send a summary of what you connected, plus what you type into the form, to an AI provider to draft a result. Today that provider is Anthropic. The draft comes back to your browser. I do not write it to a database. Leaving the page drops it, unless your own browser kept it.
        </p>
        <p>
          I do not use that draft to train a model of my own. I do not control how long Anthropic keeps what the tool sends. Their policy applies:{" "}
          <a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a>.
        </p>
      </LegalSection>

      <LegalSection title="What stays in your browser">
        <p>
          Some tools run entirely in your browser. What you type can be saved on that device until you reset the tool or clear the site&apos;s data. If the tool offers a share link, the link contains what you chose to share. Anyone with the link can open it. It is not a private account.
        </p>
      </LegalSection>

      <LegalSection title="Location and maps">
        <p>
          A demo may ask your browser for your location so it can show where you are on a map. That location stays in the page. It is not saved on this server. If the map loads, a mapping provider receives the request for the area on the screen.
        </p>
        <p>
          Figures on a demo, such as weather, may be placeholders rather than a live feed. The tool says which is which.
        </p>
      </LegalSection>

      <LegalSection title="Feedback">
        <p>
          There is no contact form on the site. Email links open your own mail app. I receive a message only if you send one.
        </p>
        <p>
          If a tool offers feedback, sending it can open a public GitHub issue on this site&apos;s repository, or an email to me. A public issue can be read by anyone. It can include what you typed and, if you leave that option on, a share link. I do not receive the note unless you send it.
        </p>
      </LegalSection>

      <LegalSection title="Who else receives data">
        <p>Other people receive data only in these roles:</p>
        <ul>
          <li>
            <strong>The account you connect.</strong> Today that is Strava, when you choose to connect it. Strava already holds that account. Its policy is linked above.
          </li>
          <li>
            <strong>An AI provider,</strong> when you ask a tool to draft something. Today that is Anthropic. Its policy is linked above.
          </li>
          <li>
            <strong>A hosting and infrastructure provider,</strong> which receives the ordinary data needed to serve a page, including the IP address and request headers, and may keep logs of requests and errors. A log can include a short slice of an error. I do not set a custom retention period for those logs.
          </li>
          <li>
            <strong>A mapping provider,</strong> if a map loads, for the area on the screen.
          </li>
          <li>
            <strong>GitHub,</strong> if you submit feedback that opens a public issue.
          </li>
        </ul>
        <p>
          The site code does not add a separate analytics product. If I start using one, that is a material change and I will update this page.
        </p>
      </LegalSection>

      <LegalSection title="What I don't do">
        <ul>
          <li>I don&apos;t sell personal data.</li>
          <li>I don&apos;t keep a database of your activities, connection tokens, generated results, or race results.</li>
          <li>A connected tool does not ask to change the outside account. Training Coach does not write to Strava.</li>
          <li>Sample and demo pages do not publish your name or your results.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How long it stays">
        <ul>
          <li>A connection lasts for that browser session, until you disconnect it, or until you delete the cookie.</li>
          <li>A disclaimer acceptance stays in its cookie until you delete it, or until the disclaimer changes enough that the tool asks again.</li>
          <li>A generated result is not stored on the server.</li>
          <li>Something you save in the browser stays there until you reset it or clear the site&apos;s data. A share link lasts as long as someone keeps the URL.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The site is not aimed at children. It does not ask for a child&apos;s account, and it does not check age. If you believe a child&apos;s information was sent here, email me and I will delete what I can.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          I update this page when I materially change what data I collect or who I share it with. The date at the top changes with that update. Continuing to use the site after that date means you accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          To ask a question, disconnect an account, or request deletion, email{" "}
          <a href="mailto:switchbacklabsco@gmail.com">switchbacklabsco@gmail.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
