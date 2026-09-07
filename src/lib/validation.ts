/** Shared input validation patterns (used by the booking + auth forms). */

/** Basic email shape: something@something.tld */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Alphabets only, single spaces between words, 3–50 chars after trim. */
export const FULL_NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

/** Nepali mobile: 10 digits starting with 98 / 97 / 96. */
export const PHONE_PATTERN = /^9[678]\d{8}$/;
