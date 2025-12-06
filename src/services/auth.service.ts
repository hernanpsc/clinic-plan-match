import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Response types
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SessionResponse {
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

/**
 * Sign up with email, password, and optional user metadata
 */
export const signUp = async (signUpData: SignUpData): Promise<AuthResponse> => {
  const redirectUrl = `${window.location.origin}/`;

  const { data, error } = await supabase.auth.signUp({
    email: signUpData.email,
    password: signUpData.password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        first_name: signUpData.firstName || null,
        last_name: signUpData.lastName || null,
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<SessionResponse> => {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    error,
  };
};

/**
 * Get the current user
 */
export const getUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.getUser();
  return {
    user: data.user,
    error,
  };
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

/**
 * Helper to translate Supabase auth errors to Spanish
 */
export const getAuthErrorMessage = (error: AuthError): string => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Credenciales inválidas. Verifica tu correo y contraseña.',
    'Email not confirmed': 'Por favor confirma tu correo electrónico.',
    'User already registered': 'Este correo ya está registrado. Intenta iniciar sesión.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Signup requires a valid password': 'Se requiere una contraseña válida.',
    'Unable to validate email address: invalid format': 'El formato del correo electrónico no es válido.',
  };

  return errorMessages[error.message] || error.message;
};

// Default export as service object
const AuthService = {
  signIn,
  signUp,
  signOut,
  getSession,
  getUser,
  onAuthStateChange,
  getAuthErrorMessage,
};

export default AuthService;
