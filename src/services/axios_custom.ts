// The instance lives in the authentication module, which installs the
// interceptors of the IAM sign-in on it.
import { apiClient } from "../auth/apiClient";

export default apiClient;
