// The instance lives in the authentication module, which installs the
// interceptors of the active mode (legacy or iam) on it.
import { apiClient } from "../auth/apiClient";

export default apiClient;
