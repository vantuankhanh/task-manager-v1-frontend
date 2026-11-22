import { Link } from "react-router-dom";
import { privacyNoticePath } from "../../pages/privacy/privacyNoticeLocation";

const AppFooter = () => {
  return (
    <div className="layout-footer flex-column gap-2">
      <div>
        "Talent is nothing without persistence." -
        <span className="font-bold ml-2">Dean Crawford</span>
      </div>
      {/* The notice of this application is linked from every page (ADR-020 of VTK IAM). */}
      <Link to={privacyNoticePath} className="text-primary text-sm">
        Privacy notice
      </Link>
    </div>
  );
};

export default AppFooter;
