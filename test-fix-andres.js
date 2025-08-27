// Test script to fix Andres's account
import { supabase } from '@/integrations/supabase/client';

async function fixAndresAccount() {
  try {
    const { data, error } = await supabase.functions.invoke('fix-andres-account');
    
    if (error) {
      console.error('Error fixing Andres account:', error);
      return;
    }
    
    console.log('Success fixing Andres account:', data);
  } catch (error) {
    console.error('Error calling fix function:', error);
  }
}

fixAndresAccount();