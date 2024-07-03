export const Delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
