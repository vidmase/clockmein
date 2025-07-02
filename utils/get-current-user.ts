import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getCurrentUserId() {
  const supabase = createClientComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user.id;
} 