// Script to delete the problematic andresquintero2@whccd.edu account
// This will be executed through the admin delete function

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnxbysvezshnikqboplh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Admin service key needed

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAndresAccount() {
  try {
    console.log('Deleting andresquintero2@whccd.edu account...');
    
    const { data, error } = await supabase.functions.invoke('admin-delete-account', {
      body: {
        userEmail: 'andresquintero2@whccd.edu',
        reason: 'Duplicate account causing submission limit issues. User has proper account with andres.quintero@outlook.com'
      }
    });

    if (error) {
      console.error('Error deleting account:', error);
      return;
    }

    console.log('Account deletion result:', data);
    console.log('Account successfully deleted!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

deleteAndresAccount();