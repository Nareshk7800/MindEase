/* global console */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.js";

function mapFirebaseAuthError(error) {
  const code = error?.code ? String(error.code) : "";
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/email-already-in-use":
      return "Email is already in use. Please log in instead.";
    case "auth/missing-email":
      return "Email is required.";
    case "auth/missing-password":
      return "Password is required.";
    default:
      return error?.message ? String(error.message) : "Signup failed. Please try again.";
  }
}

export async function signupWithEmailPassword({ name, email, password }) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name && String(name).trim().length > 0) {
      await updateProfile(cred.user, { displayName: String(name).trim() });
    }

    console.log("Firebase signup success:", {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
    });

    return { ok: true, user: cred.user };
  } catch (e) {
    console.error("Firebase signup error:", e);
    return { ok: false, error: mapFirebaseAuthError(e) };
  }
}

export async function loginWithEmailPassword({ email, password }) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: cred.user };
  } catch (e) {
    return { ok: false, error: mapFirebaseAuthError(e) };
  }
}

