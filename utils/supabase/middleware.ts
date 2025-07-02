import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/team',
  '/settings',
  '/api/projects',
  '/api/time',
] //Comment: Routes that require authentication

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth',
  '/verify-email',
  '/reset-password',
] //Comment: Routes that are publicly accessible

export const createClient = async (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  let response = NextResponse.next();
  
  return {
    supabase: createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({ name, ...options });
          },
        },
      }
    ),
    response,
  };
};

