export const maskEmail = (email: string): string => {
  const atIndex = email.indexOf('@');
  if (atIndex <= 3) {
    return email; // Not enough characters to mask
  }
  const prefix = email.substring(0, 3);
  const domain = email.substring(atIndex);
  return `${prefix}***${domain}`;
};
