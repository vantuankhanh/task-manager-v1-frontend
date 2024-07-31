export const toBase64 = (input: string) => {
  return btoa(input);
};

export const fromBase64 = (input: string) => {
  return atob(input);
};
