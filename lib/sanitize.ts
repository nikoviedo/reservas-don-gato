export const sanitizeText = (value: string, max = 200) =>
  value.replace(/[<>]/g, "").trim().slice(0, max);

export const sanitizePhone = (value: string) => value.replace(/[^\d+]/g, "").slice(0, 20);
