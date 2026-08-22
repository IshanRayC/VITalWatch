/**
 * Auth layer — the Clerk seam.
 *
 * The spec calls for `@clerk/nextjs`. This app runs on TanStack Start (Vite),
 * where the equivalent package is `@clerk/tanstack-react-start`, and this build
 * is frontend-only: no Clerk instance, no publishable key, no server middleware.
 * So this module implements the *exact shape* the rest of the app consumes —
 * `useUser()`, `user.publicMetadata.role`, `<SignedIn>` / `<SignedOut>`,
 * `<UserButton />` — backed by a local, presentation-only session.
 *
 * To go live with Clerk, replace ONLY this file's internals:
 *   - wrap the app in <ClerkProvider> inside <body>
 *   - swap SignInPanel/SignUpPanel for Clerk's <SignIn />/<SignUp /> with the
 *     same `appearance` tokens used below
 *   - read the role from Clerk's `user.publicMetadata.role`
 * Nothing else in the codebase needs to change. Clerk Organizations /
 * multi-tenancy / SSO: out of scope (deferred).
 *
 * Roles here are presentation-only: they hide and disable UI. They are NOT
 * security. Server-side RBAC enforcement is out of scope.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { listUsers, STUB_MODE } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/roles";
import type { Role, User } from "@/types/vitalwatch";

export interface AuthUser {
  id: string;
  fullName: string;
  primaryEmailAddress: string;
  /** Custom claim, exactly as it is stored on the Clerk user object. */
  publicMetadata: { role: Role | null };
}

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
  /** Real role from publicMetadata — never affected by the "View as" switcher. */
  realRole: Role | null;
  /** Role the UI is currently rendering for. */
  effectiveRole: Role | null;
  /** Stub mode + real role `admin` only. */
  canSwitchRole: boolean;
  availableUsers: User[];
  signIn: (userId: string) => void;
  signOut: () => void;
  setEffectiveRole: (role: Role) => void;
}

const SESSION_KEY = "vitalwatch.session.v1";
const VIEW_AS_KEY = "vitalwatch.viewAs.v1";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewAs, setViewAs] = useState<Role | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((list) => {
        if (cancelled) return;
        setUsers(list);
        const storedId = window.localStorage.getItem(SESSION_KEY);
        const storedView = window.localStorage.getItem(VIEW_AS_KEY) as Role | null;
        if (storedId && list.some((u) => u.id === storedId)) setUserId(storedId);
        if (storedView) setViewAs(storedView);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const record = users.find((u) => u.id === userId) ?? null;
  const realRole = record?.role ?? null;

  const signIn = useCallback((id: string) => {
    window.localStorage.setItem(SESSION_KEY, id);
    window.localStorage.removeItem(VIEW_AS_KEY);
    setViewAs(null);
    setUserId(id);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(VIEW_AS_KEY);
    setViewAs(null);
    setUserId(null);
  }, []);

  const setEffectiveRole = useCallback((role: Role) => {
    window.localStorage.setItem(VIEW_AS_KEY, role);
    setViewAs(role);
  }, []);

  const canSwitchRole = STUB_MODE && realRole === "admin";

  const value = useMemo<AuthState>(
    () => ({
      isLoaded,
      isSignedIn: record !== null,
      user: record
        ? {
            id: record.id,
            fullName: record.full_name,
            primaryEmailAddress: record.email,
            publicMetadata: { role: record.role },
          }
        : null,
      realRole,
      effectiveRole: canSwitchRole && viewAs ? viewAs : realRole,
      canSwitchRole,
      availableUsers: users,
      signIn,
      signOut,
      setEffectiveRole,
    }),
    [isLoaded, record, realRole, canSwitchRole, viewAs, users, signIn, signOut, setEffectiveRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Mirrors Clerk's `useUser()`. */
export function useUser(): Pick<AuthState, "isLoaded" | "isSignedIn" | "user"> {
  const { isLoaded, isSignedIn, user } = useAuthContext();
  return { isLoaded, isSignedIn, user };
}

/** Session + effective-role controls (the "View as" switcher reads this). */
export function useSession(): AuthState {
  return useAuthContext();
}

export function SignedIn({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuthContext();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuthContext();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

/** Clerk's <UserButton /> equivalent: account summary + sign out. */
export function UserButton() {
  const { user, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const initials = user.fullName
    .split(" ")
    .filter((p) => /[A-Za-z]/.test(p[0] ?? ""))
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        className="flex size-8 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-accent"
      >
        {initials}
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-popover p-3 shadow-xl"
          >
            <p className="text-sm font-medium text-foreground">{user.fullName}</p>
            <p className="mono mt-0.5 text-xs text-muted-foreground">
              {user.primaryEmailAddress}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Role:{" "}
              {user.publicMetadata.role
                ? ROLE_LABEL[user.publicMetadata.role]
                : "no role assigned"}
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="mt-3 w-full rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
