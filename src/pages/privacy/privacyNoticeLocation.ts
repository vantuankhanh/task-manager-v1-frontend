/**
 * Where the personal data notice of this application lives and which version
 * it is (ADR-020 of VTK IAM, FR-AUTHZ-10). The version is the date the text
 * was published, "YYYY-MM-DD" (".2" for a second change on one day). Change
 * it together with the text in privacyNoticeText.ts, deploy, and only then set
 * the same version for "taskmanager-v1" in the VTK IAM console: from then on
 * every user is asked to accept the new text.
 */
export const privacyNoticeVersion = "2026-11-22";

/** Public page, registered at VTK IAM as the notice URL of the application. */
export const privacyNoticePath = "/privacy";

/**
 * The notice of VTK IAM holds the parts both notices share (the rights of the
 * data subject, how to send a request, response times, breach notice, people
 * under 16, contact), because the same controller runs both.
 */
export const iamPrivacyNoticeUrl = "https://auth.vantuankhanh.com/privacy";
