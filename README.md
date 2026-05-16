# Project Setup

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env` and set your Firebase web app values (from Firebase Console → Project settings).
3. Run `npm run dev` to start the development server.

## Firebase Authentication (phone OTP + Google)

- In the Firebase Console, enable **Authentication** → **Sign-in method** → **Phone** and **Google**.
- Add your dev domain under **Authorized domains** (e.g. `localhost`).
- For SMS testing, use a real device/SIM or [Firebase phone test numbers](https://firebase.google.com/docs/auth/web/phone-auth#test-with-phone-numbers) in the console.

Environment variables (Vite):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`

This project was generated through Alpha. For more information, visit [dualite.dev](https://dualite.dev).