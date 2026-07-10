import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

let recaptchaVerifier: RecaptchaVerifier | null = null;

const SEND_OTP_TIMEOUT_MS = 90_000;

const BILLING_NOT_ENABLED_MSG =
  "SMS sign-in is not available until billing is enabled on your Firebase project. " +
  "In Google Cloud / Firebase Console: upgrade the project to the Blaze (pay-as-you-go) plan " +
  "and add a payment method. Phone Authentication uses SMS, which requires this plan.";

/**
 * Creates the reCAPTCHA widget in #recaptcha-container.
 * Call once the container is mounted, before sendOTP().
 */
export function setupRecaptcha(): RecaptchaVerifier {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "normal",
    callback: () => {},
    "expired-callback": () => {},
  });
  return recaptchaVerifier;
}

/**
 * Sends SMS OTP via Firebase. Stores result on window.confirmationResult.
 * Uses a timeout so the UI does not stay stuck on "Sending…" if the request never settles.
 */
export async function sendOTP(phoneNumber: string): Promise<void> {
  const appVerifier = setupRecaptcha();
  const pending = signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        Object.assign(new Error("SMS request timed out."), {
          code: "auth/request-timeout",
        })
      );
    }, SEND_OTP_TIMEOUT_MS);
  });
  const confirmationResult = await Promise.race([pending, timeout]);
  window.confirmationResult = confirmationResult;
}

/**
 * Verifies the SMS code with Firebase.
 */
export async function verifyOTP(otp: string): Promise<UserCredential> {
  const trimmed = otp.trim();
  if (!window.confirmationResult) {
    throw new Error("No pending verification. Send a code first.");
  }
  return window.confirmationResult.confirm(trimmed);
}

export function clearPhoneAuthSession(): void {
  window.confirmationResult = undefined;
}

export function resetRecaptcha(): void {
  try {
    recaptchaVerifier?.clear();
  } catch {
    /* ignore */
  }
  recaptchaVerifier = null;
  clearPhoneAuthSession();
}

export function firebaseAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    switch (code) {
      case "auth/billing-not-enabled":
        return BILLING_NOT_ENABLED_MSG;
      case "auth/invalid-phone-number":
        return "Invalid phone number. Use format +91 followed by 10 digits.";
      case "auth/missing-phone-number":
        return "Please enter your phone number.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/captcha-check-failed":
      case "auth/invalid-app-credential":
        return "reCAPTCHA verification failed. Refresh and try again.";
      case "auth/invalid-verification-code":
        return "Wrong verification code. Check the SMS and try again.";
      case "auth/code-expired":
        return "This code has expired. Request a new code.";
      case "auth/session-expired":
        return "Session expired. Request a new code.";
      case "auth/request-timeout":
        return "Sending the code took too long. Check your connection and try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";
      case "auth/account-exists-with-different-credential":
        return "This email is already used with another sign-in method.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase. Please add this deployment URL to the 'Authorized domains' list in your Firebase Console (Authentication > Settings > Authorized domains).";
      default:
        break;
    }
  }
  if (error instanceof Error && error.message) {
    const msg = error.message;
    if (msg.includes("billing-not-enabled") || msg.includes("auth/billing-not-enabled")) {
      return BILLING_NOT_ENABLED_MSG;
    }
    if (msg.includes("unauthorized-domain") || msg.includes("auth/unauthorized-domain")) {
      return "This domain is not authorized in Firebase. Please add this deployment URL to the 'Authorized domains' list in your Firebase Console (Authentication > Settings > Authorized domains).";
    }
    return msg;
  }
  return "Something went wrong. Please try again.";
}

/** E.164 for India: +91 + 10-digit mobile (starts 6–9). */
export function normalizeIndiaPhone(input: string): string | null {
  const s = input.trim().replace(/\s/g, "");
  if (/^\+91[6-9]\d{9}$/.test(s)) {
    return s;
  }
  return null;
}
