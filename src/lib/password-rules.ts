/** Shared password rules (used by Sign Up and Reset Password). */
export const passwordRules = [
  {
    label: "8–64 characters",
    met: (value: string) => value.length >= 8 && value.length <= 64,
  },
  {
    label: "At least 1 uppercase letter",
    met: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "At least 1 lowercase letter",
    met: (value: string) => /[a-z]/.test(value),
  },
  { label: "At least 1 number", met: (value: string) => /\d/.test(value) },
  {
    label: "At least 1 special character",
    met: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
  {
    label: "No spaces",
    met: (value: string) => value.length > 0 && !/\s/.test(value),
  },
];

export function meetsAllPasswordRules(value: string): boolean {
  return passwordRules.every((rule) => rule.met(value));
}
