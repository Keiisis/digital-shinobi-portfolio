const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pjhucencrlcmbnkcrwud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaHVjZW5jcmxjbWJua2Nyd3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ4NTQyNSwiZXhwIjoyMDg2MDYxNDI1fQ.6GytVKC89B6-NnfSjKwhb9FNwC5mQbJFdbt58_PEoxk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    console.log("⚡ Connecting to Supabase with Service Role...");

    const email = 'chefkeiis377@gmail.com';
    const password = 'Degagebb2626';
    const username = 'Keys';

    // 1. Check if user exists (by trying to create)
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            username: username,
            full_name: 'Kevin Chacha',
            avatar_url: 'https://i.pravatar.cc/150?u=keiis'
        }
    });

    if (error) {
        console.error("❌ Error creating user:", error.message);
        // If user already exists, we might want to update the password to be sure?
        // But createUser usually fails if email taken.
    } else {
        console.log("✅ Admin User Created:", data.user.id);
        console.log("   Email:", data.user.email);
        console.log("   Metadata:", data.user.user_metadata);
    }
}

createAdmin();
