'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const email = getString(formData, 'email');
  const password = getString(formData, 'password');

  if (!email || !password) {
    redirectWithError('/login', 'Email and password are required.');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError('/login', error.message);
  }

  redirect('/matches/today');
}

export async function signup(formData: FormData) {
  const displayName = getString(formData, 'displayName');
  const email = getString(formData, 'email');
  const password = getString(formData, 'password');

  if (!displayName || !email || !password) {
    redirectWithError('/signup', 'Display name, email, and password are required.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    redirectWithError('/signup', error.message);
  }

  if (!data.user) {
    redirectWithError('/signup', 'Could not create a user account.');
  }

  if (!data.session) {
    redirect(
      `/login?notice=${encodeURIComponent(
        'Account created. Confirm your email if Supabase sent a link, then sign in.',
      )}`,
    );
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    display_name: displayName,
  });

  if (profileError) {
    redirectWithError(
      '/signup',
      'Account created, but the profile row could not be created. Check that email confirmations are disabled for the MVP or add the profile trigger from the README.',
    );
  }

  redirect('/matches/today');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
