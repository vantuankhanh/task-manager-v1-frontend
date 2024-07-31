import axios from "axios";
import secureLocalStorage from "react-secure-storage";

// Tạo một instance Axios
const axiosCustom = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept REQUEST trước khi được gửi
axiosCustom.interceptors.request.use(
  (config) => {
    // Check hệ thống có token hay không và cập nhật Authorization header nếu có
    const token = secureLocalStorage.getItem("refresh_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept RESPONSE khi được trả về
axiosCustom.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check xem error trả về có phải là 401 Unauthorized không và đã thử làm mới token hay chưa ?
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Thực hiện gửi request để làm mới token
        const currentToken = secureLocalStorage.getItem("refresh_token");
        const response = await axios({
          method: "get",
          url: import.meta.env.VITE_BASE_URL + "/refresh-token",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        // Cập nhật token mới và gửi lại request gốc với token mới
        const newToken = response.data.refresh_token;
        secureLocalStorage.setItem("refresh_token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (error) {
        // Nếu không thể làm mới token, chuyển hướng đến trang đăng nhập hoặc xử lý lỗi khác
        // Ví dụ: window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Nếu không phải là lỗi 401 Unauthorized hoặc không thể làm mới token, trả về lỗi
    return Promise.reject(error);
  }
);

export default axiosCustom;
