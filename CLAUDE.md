# CLAUDE.md – Task Manager v1 frontend (task-manager-v1-frontend)

Cập nhật lần cuối: 2026-11-23 (ADR-020 của VTK IAM: trang công khai `/privacy` nằm ngoài `AuthenticationGate` nên đọc được cả khi API ngừng, liên kết ở chân trang, menu tài khoản và trang đăng nhập, nút "Read the notice" ở `/auth/access?reason=access_denied`, thêm test; chưa commit).

## 1. Quy tắc

- Theo quy tắc chung của chủ dự án (Van Tuan Khanh) trong `~/.claude/CLAUDE.md`: trả lời bằng tiếng Việt; mã, comment, lệnh và commit bằng tiếng Anh; không dùng em dash, dùng en dash "–"; tên biến đầy đủ, không viết tắt (trừ `id`, `url`, `http`, `json`, `db`, `ui`, `api`); comment là câu đầy đủ, nói vì sao và dẫn yêu cầu (ví dụ `FR-AUTHZ-10`, `ADR-020`).
- Git: chỉ commit, merge, push khi được yêu cầu trong lượt đó; "commit" là tạo nhánh từ `main`, commit bằng skill `git-commit`, fast-forward vào `main`, xóa nhánh local, không push. Conventional Commits, tiêu đề tối đa 72 ký tự, không có dòng co-author. Giữ nguyên thay đổi chưa commit của chủ dự án.
- Không log token, mã, cookie hay header `Authorization`; không bao giờ kết nối máy chủ production. `package.json`: không thêm trường `packageManager`.
- Repo này không có script `dev:iam`. Không chạy `pnpm dev` khi `.env` chưa trỏ tới backend local; chạy local theo "Rehearsing locally" trong `docs/IAM-MIGRATION.md` của repo backend: `VITE_BASE_URL=http://localhost:8000/api` trong môi trường của `vite --port 5174 --strictPort`.
- React + Vite + TypeScript + PrimeReact/PrimeFlex + Redux Toolkit: theo cấu trúc sẵn có (`src/pages`, `src/auth`, `src/layout`, `src/routes`).
- `/privacy` phải đứng ngoài `AuthenticationGate` (`src/routes/routes.tsx`), không gọi `/me` hay `/auth/refresh`. Sửa nội dung ở `src/pages/privacy/privacyNoticeText.ts` thì tăng `privacyNoticeVersion` (`privacyNoticeLocation.ts`), triển khai, rồi đổi phiên bản ở console IAM.

## 2. Tổng quan

Giao diện Task Manager v1 (`https://taskmanagerv1.vantuankhanh.com`): người dùng, dự án, công việc, bảng điều khiển. Đăng nhập qua backend và VTK IAM (cookie httpOnly, trình duyệt không giữ token); mô tả ở `README.md`.

Lệnh: `pnpm test` (vitest, hiện 41 test), `npx tsc --noEmit`, `pnpm build`, `pnpm lint` (hiện còn 6 lỗi cũ ở file không liên quan: `layoutcontext.tsx`, `menucontext.tsx`, `TaskChart.tsx`, `UserChart.tsx`, `UserRoleDashboardChart.tsx`, `AdminSection.tsx`).

## 3. Tiến độ

- Xong: đăng nhập chỉ qua VTK IAM (2026-10-16), trang `/auth/access`.
- Đang làm (2026-11-22, chưa commit): ADR-020 của VTK IAM, phần ứng dụng: trang `/privacy` (tiếng Việt, `?lang=en` cho tiếng Anh, phiên bản `2026-11-22`), liên kết ở chân trang, menu tài khoản và trang đăng nhập, "Read the notice" khi `access_denied`.
- Sau khi triển khai: chủ dự án đặt URL và phiên bản `2026-11-22` cho `taskmanager-v1` ở console IAM.
