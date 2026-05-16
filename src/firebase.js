import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyAjr6U4y9MYlMQCSP2x8qhswDf8Y6wwaZk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "mindease-58b7c.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "mindease-58b7c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

