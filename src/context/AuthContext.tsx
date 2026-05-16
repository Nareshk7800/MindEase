import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../firebase/config";

type AuthUser = {
  username: string;
  email?: string;
  phone?: string;
};

type StoredUser = {
  username: string;
  email: string;
  phone?: string;
  password: string;
  note?: string;
};

function normalizePhoneDigits(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

type AuthContextType = {
  user: AuthUser | null;
  signup: (args: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    note?: string;
  }) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  login: (args: { identifier: string; password: string }) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "equimind_users";
const CURRENT_KEY = "equimind_current_user";

function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.username) return null;
    return {
      username: String(parsed.username),
      email: parsed.email ? String(parsed.email) : undefined,
      phone: parsed.phone ? String(parsed.phone) : undefined,
    };
  } catch {
    return null;
  }
}

function authUserFromFirebase(fbUser: {
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
}): AuthUser {
  return {
    username:
      fbUser.displayName ||
      fbUser.phoneNumber ||
      fbUser.email?.split("@")[0] ||
      "Member",
    email: fbUser.email || undefined,
    phone: fbUser.phoneNumber || undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(loadCurrentUser());
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const current = authUserFromFirebase(fbUser);
        setUser(current);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
      }
    });
    return () => unsub();
  }, []);

  const signup = async ({
    username,
    email,
    phone,
    password,
    note,
  }: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    note?: string;
  }) => {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    const pw = password;

    if (!u) return { ok: false, error: "Username is required." };
    if (!e) return { ok: false, error: "Email is required." };
    if (pw.trim().length < 4) {
      return { ok: false, error: "Password must be at least 4 characters." };
    }

    const users = loadUsers();
    const exists = users.some(
      (x) =>
        (x.username ? x.username.toLowerCase() : "") === u.toLowerCase() ||
        (x.email ? x.email.toLowerCase() : "") === e
    );
    if (exists) return { ok: false, error: "User already exists." };

    const next: StoredUser[] = [
      ...users,
      { username: u, email: e, phone: phone?.trim() || undefined, password: pw, note },
    ];
    saveUsers(next);

    const current: AuthUser = {
      username: u,
      email: e,
      phone: phone?.trim() || undefined,
    };
    localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
    setUser(current);

    return { ok: true };
  };

  const login = async ({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }) => {
    const id = identifier.trim().toLowerCase();
    if (!id) return { ok: false, error: "Username or email is required." };

    const users = loadUsers();
    const phoneNorm = normalizePhoneDigits(id);
    const found = users.find((x) => {
      const uMatch = x.username ? x.username.toLowerCase() === id : false;
      const eMatch = x.email ? x.email.toLowerCase() === id : false;
      const pMatch =
        phoneNorm &&
        x.phone &&
        normalizePhoneDigits(x.phone) === phoneNorm;
      return uMatch || eMatch || Boolean(pMatch);
    });
    if (!found || found.password !== password) {
      return { ok: false, error: "Invalid username or password." };
    }

    const current: AuthUser = {
      username: found.username,
      email: found.email,
      phone: found.phone,
    };
    localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
    setUser(current);

    return { ok: true };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      /* ignore */
    }
    localStorage.removeItem(CURRENT_KEY);
    setUser(null);
  };

  const value = useMemo(() => {
    return { user, signup, login, logout };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
