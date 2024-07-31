import Cookies from "js-cookie";

export const clearAllCookie = () => {
  const cookies = Cookies.get();
  const cookiesId = Object.keys(cookies);

  for (let i = 0; i < cookiesId.length; i++) {
    Cookies.remove(cookiesId[i]);
  }
};
