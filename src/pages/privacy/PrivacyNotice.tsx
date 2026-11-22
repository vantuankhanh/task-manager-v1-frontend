import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  iamPrivacyNoticeUrl,
  privacyNoticePath,
  privacyNoticeVersion,
} from "./privacyNoticeLocation";
import {
  IPrivacyNoticeSection,
  PrivacyNoticeLanguage,
  privacyNoticeTexts,
} from "./privacyNoticeText";

/**
 * "?lang=en" shows the English text; anything else, or nothing, the
 * Vietnamese one. Only these two fixed values select a text: nothing of the
 * address bar is ever shown on the page.
 */
const selectPrivacyNoticeLanguage = (search: string): PrivacyNoticeLanguage =>
  new URLSearchParams(search).get("lang") === "en" ? "en" : "vi";

const PrivacyNoticeSection = ({
  section,
}: {
  section: IPrivacyNoticeSection;
}) => (
  <section className="mb-5" aria-labelledby={section.id}>
    <h2 id={section.id} className="text-900 text-2xl font-bold mb-3">
      {section.heading}
    </h2>
    {section.items && (
      <ul className="text-700 line-height-3 pl-4 m-0 mb-3">
        {section.items.map((item) => (
          <li key={item} className="mb-2">
            {item}
          </li>
        ))}
      </ul>
    )}
    {section.paragraphs?.map((paragraph) => (
      <p key={paragraph} className="text-700 line-height-3 mt-0 mb-3">
        {paragraph}
      </p>
    ))}
  </section>
);

/**
 * /privacy: the personal data notice of this application (ADR-020 of VTK
 * IAM, FR-AUTHZ-10). A public page: it shows for a visitor without a session,
 * because VTK IAM links to it from its consent page before the person has
 * signed in here. It starts with the five-line summary and holds only what is
 * particular to Task Manager; the shared parts are a link to the notice of
 * VTK IAM.
 */
const PrivacyNotice = () => {
  const location = useLocation();
  const language = selectPrivacyNoticeLanguage(location.search);
  const text = privacyNoticeTexts[language];
  const otherLanguage: PrivacyNoticeLanguage = language === "vi" ? "en" : "vi";

  useEffect(() => {
    const previousDocumentTitle = document.title;
    document.title = text.documentTitle;
    return () => {
      document.title = previousDocumentTitle;
    };
  }, [text.documentTitle]);

  return (
    <div className="surface-ground min-h-screen py-5 px-3">
      <main
        lang={language}
        className="surface-card border-round-xl shadow-1 p-4 md:p-6 mx-auto"
        style={{ maxWidth: "52rem" }}
      >
        <div className="flex justify-content-end mb-3">
          <Link
            to={`${privacyNoticePath}?lang=${otherLanguage}`}
            lang={otherLanguage}
            hrefLang={otherLanguage}
            className="text-primary font-medium no-underline"
          >
            {text.otherLanguageLabel}
          </Link>
        </div>

        <h1 className="text-900 text-4xl font-bold mt-0 mb-2">
          {text.heading}
        </h1>
        <p className="text-600 font-medium mt-0 mb-4">
          {text.versionLabel} {privacyNoticeVersion}
        </p>
        <p className="text-700 line-height-3 mt-0 mb-5">{text.introduction}</p>

        <section
          className="border-1 border-primary border-round-lg p-4 mb-6"
          aria-labelledby="privacy-summary"
        >
          <h2
            id="privacy-summary"
            className="text-900 text-2xl font-bold mt-0 mb-3"
          >
            {text.summaryHeading}
          </h2>
          <dl className="m-0">
            {text.summaryRows.map((summaryRow) => (
              <div key={summaryRow.label} className="mb-3">
                <dt className="text-900 font-bold mb-1">{summaryRow.label}</dt>
                <dd className="text-700 line-height-3 m-0">
                  {summaryRow.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {text.sections.map((section) => (
          <PrivacyNoticeSection key={section.id} section={section} />
        ))}

        <section className="mb-5" aria-labelledby="privacy-shared">
          <h2 id="privacy-shared" className="text-900 text-2xl font-bold mb-3">
            {text.sharedPartsHeading}
          </h2>
          <p className="text-700 line-height-3 mt-0 mb-3">
            {text.sharedPartsText}
          </p>
          <a
            href={
              language === "en"
                ? `${iamPrivacyNoticeUrl}?lang=en`
                : iamPrivacyNoticeUrl
            }
            className="text-primary font-medium"
            rel="noopener"
          >
            {text.sharedPartsLinkLabel}
          </a>
        </section>

        <section className="mb-5" aria-labelledby="privacy-changes">
          <h2
            id="privacy-changes"
            className="text-900 text-2xl font-bold mb-3"
          >
            {text.changesHeading}
          </h2>
          <p className="text-700 line-height-3 mt-0 mb-0">{text.changesText}</p>
        </section>

        <Link to="/" className="text-primary font-medium">
          {text.homeLinkLabel}
        </Link>
      </main>
    </div>
  );
};

export default PrivacyNotice;
