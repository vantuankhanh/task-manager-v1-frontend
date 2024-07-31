export const customAbort = (timeoutMs: number = 15000) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs);

  return abortController.signal;
};
