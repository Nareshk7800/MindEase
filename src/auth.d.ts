export function signupWithEmailPassword(args: {
  name: string;
  email: string;
  password: string;
}): Promise<{
  ok: boolean;
  error?: string;
  user?: unknown;
}>;

export function loginWithEmailPassword(args: {
  email: string;
  password: string;
}): Promise<{
  ok: boolean;
  error?: string;
  user?: unknown;
}>;

