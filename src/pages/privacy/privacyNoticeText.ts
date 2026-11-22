/**
 * The text of the personal data notice of Task Manager, in Vietnamese and
 * English (ADR-020 of VTK IAM, Law 91/2025/QH15 Article 9, Decree 356/2025).
 * Every sentence describes what the code does now: the tables of the backend
 * (Script-*.sql), its routes and controllers, the account deletion handler
 * (src/utils/iamAccountDeletion.js of the backend) and the sign-in through
 * VTK IAM. When one of them changes, change this text in the same change and
 * bump privacyNoticeVersion (privacyNoticeLocation.ts).
 */

export type PrivacyNoticeLanguage = "vi" | "en";

export const privacyNoticeLanguages: PrivacyNoticeLanguage[] = ["vi", "en"];

export interface IPrivacyNoticeSummaryRow {
  label: string;
  text: string;
}

export interface IPrivacyNoticeSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface IPrivacyNoticeText {
  documentTitle: string;
  heading: string;
  versionLabel: string;
  introduction: string;
  summaryHeading: string;
  /** The five lines of the summary box: data, purpose, recipients, retention, deletion. */
  summaryRows: IPrivacyNoticeSummaryRow[];
  sections: IPrivacyNoticeSection[];
  sharedPartsHeading: string;
  sharedPartsText: string;
  sharedPartsLinkLabel: string;
  changesHeading: string;
  changesText: string;
  /** Label of the link to the other language, written in that language. */
  otherLanguageLabel: string;
  homeLinkLabel: string;
}

const vietnameseText: IPrivacyNoticeText = {
  documentTitle: "Thông báo xử lý dữ liệu cá nhân – Task Manager",
  heading: "Thông báo xử lý dữ liệu cá nhân của Task Manager",
  versionLabel: "Phiên bản",
  introduction:
    "Thông báo này nói Task Manager lưu những dữ liệu nào của bạn, để làm gì, ai nhận, lưu trong bao lâu và cách xóa. Dữ liệu tài khoản VTK IAM (dịch vụ đăng nhập) có thông báo riêng, dẫn ở cuối trang.",
  summaryHeading: "Tóm tắt",
  summaryRows: [
    {
      label: "Dữ liệu",
      text: "Họ tên, email và vai trò của bạn (nhận từ VTK IAM), mã tài khoản và mã phiên đăng nhập VTK IAM; các công việc giao cho bạn (thời gian, trạng thái, ghi chú) và các dự án (tên, số tiền thanh toán, thời gian, ghi chú).",
    },
    {
      label: "Mục đích",
      text: "Giao việc và theo dõi tiến độ công việc, dự án.",
    },
    {
      label: "Bên nhận",
      text: "Quản trị viên của Task Manager; VTK IAM (cùng bên kiểm soát); Cloudflare (Hoa Kỳ), nơi mọi truy cập đi qua và bản sao lưu đã mã hóa được lưu. Không có bên nào khác.",
    },
    {
      label: "Thời gian lưu",
      text: "Tới khi bạn rút lại đồng ý hoặc xóa tài khoản. Khi đó họ tên và email của bạn bị thay bằng giá trị giữ chỗ; công việc, dự án và ghi chú vẫn được giữ nhưng không còn gắn với bạn.",
    },
    {
      label: "Cách xóa",
      text: "Rút lại đồng ý với Task Manager hoặc xóa tài khoản ở trang tài khoản VTK IAM; ứng dụng được báo và ẩn danh dữ liệu của bạn.",
    },
  ],
  sections: [
    {
      id: "privacy-who",
      heading: "1. Task Manager là gì, ai chịu trách nhiệm",
      paragraphs: [
        "Task Manager là ứng dụng giao và theo dõi công việc theo dự án. Bạn đăng nhập bằng tài khoản VTK IAM; tài khoản và vai trò của bạn trong ứng dụng do VTK IAM quản lý.",
        "Văn Tuấn Khanh, một cá nhân, vận hành Task Manager và VTK IAM, và là bên kiểm soát và xử lý dữ liệu cá nhân của bạn trong cả hai.",
      ],
    },
    {
      id: "privacy-data",
      heading: "2. Dữ liệu ứng dụng lưu",
      items: [
        "Tài khoản trong ứng dụng: họ tên và email (nhận từ VTK IAM ở lần đăng nhập đầu tiên; email được cập nhật khi bạn đổi email ở VTK IAM), vai trò (quản trị viên hoặc người dùng, theo vai trò ở VTK IAM), mã tài khoản VTK IAM, mã phiên đăng nhập VTK IAM gần nhất và thời điểm cập nhật email gần nhất.",
        "Công việc: email của người được giao, dự án, thời gian bắt đầu và kết thúc, trạng thái, và ghi chú tự do tối đa 200 ký tự.",
        "Dự án: tên, số tiền thanh toán, thời gian bắt đầu và kết thúc, mức ưu tiên, và ghi chú tối đa 200 ký tự. Dự án không gắn với một người cụ thể.",
        "Phiên đã kết thúc: khi phiên đăng nhập VTK IAM của bạn kết thúc (đăng xuất, tài khoản bị khóa, đổi mật khẩu), ứng dụng ghi mã phiên và mã tài khoản trong khoảng một giờ để từ chối các token của phiên đó.",
        "Nhật ký máy chủ: phương thức và đường dẫn của từng yêu cầu (đường dẫn có thể chứa email, ví dụ khi xem công việc của một người), các lỗi, và mã tài khoản VTK IAM trong một số dòng. Nhật ký không ghi địa chỉ IP.",
      ],
      paragraphs: [
        "Ứng dụng không lưu mật khẩu, số điện thoại, ảnh, ngày sinh hay địa chỉ IP trong cơ sở dữ liệu, và không cho tải tệp lên. Nội dung bạn gõ vào ghi chú được lưu nguyên văn, nên đừng ghi vào đó dữ liệu cá nhân không cần cho công việc.",
      ],
    },
    {
      id: "privacy-purpose",
      heading: "3. Mục đích",
      items: [
        "Giao công việc trong từng dự án, theo dõi trạng thái và thời gian, và hiện bảng tổng quan.",
        "Nhận ra bạn khi đăng nhập và giữ email trong ứng dụng trùng với email ở VTK IAM: ứng dụng hỏi VTK IAM thông tin của bạn ở lần đầu tiên và sau đó mỗi phiên đăng nhập một lần.",
      ],
      paragraphs: [
        "Dữ liệu không được dùng cho quảng cáo, không được bán, không được dùng để lập hồ sơ về bạn, và ứng dụng không có công cụ phân tích hành vi.",
      ],
    },
    {
      id: "privacy-recipients",
      heading: "4. Ai xem và nhận dữ liệu",
      items: [
        "Quản trị viên của Task Manager (người có vai trò quản trị viên ở VTK IAM): xem họ tên, email của mọi người dùng và mọi dự án, công việc; tạo, sửa và xóa dự án, công việc. Người dùng thường chỉ xem tài khoản của mình, các công việc giao cho mình và các dự án có các công việc đó.",
        "VTK IAM: cho bạn đăng nhập và gửi cho ứng dụng mã tài khoản, email, họ tên và vai trò của bạn. Ứng dụng không gửi dữ liệu công việc hay dự án cho VTK IAM.",
        "Cloudflare (Hoa Kỳ): mọi truy cập tới ứng dụng đi qua Cloudflare để chống tấn công, nên Cloudflare thấy địa chỉ IP, trình duyệt và nội dung các yêu cầu của bạn. Bản sao lưu đã mã hóa của cơ sở dữ liệu được lưu trên Cloudflare R2.",
        "Nhà cung cấp máy chủ thuê tại Việt Nam: ứng dụng và cơ sở dữ liệu chạy trên cùng máy chủ với VTK IAM.",
      ],
      paragraphs: [
        "Ứng dụng không tự gửi email, không dùng dịch vụ phân tích, theo dõi lỗi hay quảng cáo, và không tải phông chữ hay script từ bên ngoài. Cloudflare là dịch vụ ở nước ngoài, nên phần dữ liệu nêu trên được chuyển ra nước ngoài.",
      ],
    },
    {
      id: "privacy-retention",
      heading: "5. Thời gian lưu, rút lại đồng ý và xóa tài khoản",
      items: [
        "Dữ liệu trong cơ sở dữ liệu của ứng dụng được lưu tới khi bạn rút lại đồng ý với Task Manager hoặc xóa tài khoản VTK IAM. Ứng dụng không tự xóa công việc hay dự án cũ theo thời gian.",
        "Rút lại đồng ý và xóa tài khoản đều làm ở trang tài khoản VTK IAM. VTK IAM báo cho ứng dụng: chậm nhất khoảng một ngày sau khi bạn rút lại đồng ý, hoặc khi tài khoản bị xóa sau 14 ngày chờ.",
        "Khi nhận được thông báo, ứng dụng thay họ tên của bạn bằng \"Deleted account\", thay email bằng một địa chỉ giữ chỗ không thuộc về ai, đặt vai trò về người dùng thường, bỏ liên kết với tài khoản và phiên VTK IAM, và xóa các dòng phiên đã kết thúc của bạn. Các công việc giao cho bạn chuyển sang địa chỉ giữ chỗ đó.",
        "Công việc, dự án và ghi chú được giữ lại để quản trị viên còn lịch sử công việc của dự án. Ghi chú tự do không bị sửa, nên có thể còn nhắc tới bạn; muốn xóa phần đó, hãy nhờ quản trị viên sửa ghi chú, hoặc gửi yêu cầu theo thông báo của VTK IAM.",
        "Nếu sau đó bạn đồng ý lại và đăng nhập, ứng dụng tạo cho bạn một tài khoản mới; dữ liệu cũ đã ẩn danh không được nối lại với bạn.",
        "Bản sao lưu: tạo mỗi đêm và mã hóa; 7 bản gần nhất được giữ trên máy chủ, và mỗi bản được giữ 14 ngày trên Cloudflare R2. Dữ liệu trước khi ẩn danh vì vậy có thể còn trong bản sao lưu tới khoảng 15 ngày.",
      ],
    },
    {
      id: "privacy-cookies",
      heading: "6. Cookie",
      paragraphs: [
        "Ứng dụng chỉ dùng cookie cần cho việc đăng nhập, đặt trên tên miền API và không đọc được bằng script: token truy cập, token làm mới, token định danh, và một cookie tạm trong lúc đăng nhập (10 phút). Trang web không ghi gì vào localStorage, sessionStorage hay cookie, và không có cookie quảng cáo hay đo lường.",
      ],
    },
  ],
  sharedPartsHeading: "7. Quyền của bạn, cách gửi yêu cầu và liên hệ",
  sharedPartsText:
    "Task Manager và VTK IAM có cùng một bên kiểm soát, nên các phần chung nằm trong thông báo của VTK IAM: quyền của chủ thể dữ liệu, cách gửi yêu cầu và thời hạn trả lời, việc báo sự cố trong 72 giờ, người dưới 16 tuổi, và địa chỉ liên hệ.",
  sharedPartsLinkLabel: "Đọc thông báo xử lý dữ liệu cá nhân của VTK IAM",
  changesHeading: "8. Thay đổi thông báo",
  changesText:
    "Khi nội dung thông báo này thay đổi, số phiên bản ở đầu trang đổi theo, và VTK IAM hỏi bạn đồng ý lại ở lần đăng nhập kế tiếp vào Task Manager.",
  otherLanguageLabel: "English",
  homeLinkLabel: "Về trang chủ",
};

const englishText: IPrivacyNoticeText = {
  documentTitle: "Personal data notice – Task Manager",
  heading: "Personal data notice of Task Manager",
  versionLabel: "Version",
  introduction:
    "This notice says which of your data Task Manager keeps, what for, who receives it, how long it is kept and how to delete it. The data of your VTK IAM account (the sign-in service) has its own notice, linked at the end of this page.",
  summaryHeading: "Summary",
  summaryRows: [
    {
      label: "Data",
      text: "Your name, email and role (received from VTK IAM), your VTK IAM account id and sign-in session id; the tasks assigned to you (times, status, notes) and the projects (name, payment amount, times, notes).",
    },
    {
      label: "Purpose",
      text: "Assigning work and following the progress of tasks and projects.",
    },
    {
      label: "Recipients",
      text: "The administrators of Task Manager; VTK IAM (the same controller); Cloudflare (United States), which every request passes through and which stores the encrypted backups. Nobody else.",
    },
    {
      label: "Retention",
      text: "Until you withdraw your consent or delete your account. Your name and email are then replaced by placeholders; tasks, projects and notes are kept but no longer tied to you.",
    },
    {
      label: "Deletion",
      text: "Withdraw your consent to Task Manager or delete your account on the VTK IAM account page; the application is told and anonymizes your data.",
    },
  ],
  sections: [
    {
      id: "privacy-who",
      heading: "1. What Task Manager is, and who is responsible",
      paragraphs: [
        "Task Manager is an application for assigning and following work by project. You sign in with your VTK IAM account; your account and your role in the application are managed at VTK IAM.",
        "Van Tuan Khanh, a private person, runs Task Manager and VTK IAM, and is the controller and processor of your personal data in both.",
      ],
    },
    {
      id: "privacy-data",
      heading: "2. Data the application keeps",
      items: [
        "Your account in the application: name and email (received from VTK IAM at your first sign-in; the email is updated when you change it at VTK IAM), role (administrator or user, from your role at VTK IAM), your VTK IAM account id, your latest VTK IAM sign-in session id and when the email was last updated.",
        "Tasks: the email of the person assigned, the project, start and end times, status, and a free-text note of up to 200 characters.",
        "Projects: name, payment amount, start and end times, priority, and a note of up to 200 characters. A project is not tied to one person.",
        "Ended sessions: when your VTK IAM sign-in session ends (sign-out, a locked account, a changed password), the application records the session id and your account id for about an hour, to refuse the tokens of that session.",
        "Server logs: the method and path of each request (a path can contain an email, for example when the tasks of one person are shown), errors, and your VTK IAM account id in some lines. The logs do not record IP addresses.",
      ],
      paragraphs: [
        "The application keeps no password, phone number, photo, date of birth or IP address in its database, and has no file upload. What you type into a note is kept as written, so do not put personal data there that the work does not need.",
      ],
    },
    {
      id: "privacy-purpose",
      heading: "3. Purpose",
      items: [
        "Assigning tasks within each project, following their status and times, and showing the dashboard.",
        "Recognizing you when you sign in and keeping your email here the same as at VTK IAM: the application asks VTK IAM for your profile the first time, and then once per sign-in session.",
      ],
      paragraphs: [
        "The data is not used for advertising, not sold, not used to profile you, and the application has no behaviour analytics.",
      ],
    },
    {
      id: "privacy-recipients",
      heading: "4. Who sees and receives the data",
      items: [
        "The administrators of Task Manager (people with the administrator role at VTK IAM): they see the name and email of every user and every project and task, and create, change and delete projects and tasks. A normal user sees only their own account, the tasks assigned to them and the projects those tasks belong to.",
        "VTK IAM: signs you in and gives the application your account id, email, name and role. The application sends no task or project data to VTK IAM.",
        "Cloudflare (United States): every request to the application passes through Cloudflare for protection against attacks, so Cloudflare sees your IP address, your browser and the content of your requests. The encrypted backups of the database are stored on Cloudflare R2.",
        "The hosting provider of the rented server in Vietnam: the application and its database run on the same server as VTK IAM.",
      ],
      paragraphs: [
        "The application sends no email itself, uses no analytics, error tracking or advertising service, and loads no fonts or scripts from elsewhere. Cloudflare is a service abroad, so the data named above is transferred abroad.",
      ],
    },
    {
      id: "privacy-retention",
      heading: "5. Retention, withdrawing your consent and deleting your account",
      items: [
        "The data in the application's database is kept until you withdraw your consent to Task Manager or delete your VTK IAM account. The application does not delete old tasks or projects by itself over time.",
        "You withdraw your consent and delete your account on the VTK IAM account page. VTK IAM tells the application: at the latest about a day after you withdraw your consent, or when the account is deleted after its 14-day wait.",
        "On that notice the application replaces your name with \"Deleted account\" and your email with a placeholder address that belongs to nobody, sets your role back to user, removes the link to your VTK IAM account and session, and deletes your ended-session rows. The tasks assigned to you move to that placeholder address.",
        "Tasks, projects and notes are kept, so the administrators keep the history of the work of each project. Free-text notes are not changed, so they may still mention you; to have that removed, ask an administrator to edit the note, or send a request as the VTK IAM notice describes.",
        "If you later accept again and sign in, the application creates a new account for you; the old, anonymized data is not linked to you again.",
        "Backups: made every night and encrypted; the 7 newest are kept on the server, and each is kept for 14 days on Cloudflare R2. Data from before the anonymization can therefore remain in a backup for up to about 15 days.",
      ],
    },
    {
      id: "privacy-cookies",
      heading: "6. Cookies",
      paragraphs: [
        "The application uses only the cookies the sign-in needs, set on the API domain and not readable by scripts: the access token, the refresh token, the ID token, and a temporary cookie during sign-in (10 minutes). The web page writes nothing to localStorage, sessionStorage or cookies, and there are no advertising or measurement cookies.",
      ],
    },
  ],
  sharedPartsHeading: "7. Your rights, how to send a request, and contact",
  sharedPartsText:
    "Task Manager and VTK IAM have the same controller, so the shared parts are in the notice of VTK IAM: the rights of the data subject, how to send a request and the response times, the breach notice within 72 hours, people under 16, and the contact address.",
  sharedPartsLinkLabel: "Read the personal data notice of VTK IAM",
  changesHeading: "8. Changes to this notice",
  changesText:
    "When this notice changes, the version at the top of the page changes with it, and VTK IAM asks you to accept it again at your next sign-in to Task Manager.",
  otherLanguageLabel: "Tiếng Việt",
  homeLinkLabel: "Back to the start page",
};

export const privacyNoticeTexts: Record<
  PrivacyNoticeLanguage,
  IPrivacyNoticeText
> = {
  vi: vietnameseText,
  en: englishText,
};
