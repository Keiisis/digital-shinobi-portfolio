const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pjhucencrlcmbnkcrwud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ4NTQyNSwiZXhwIjoyMDg2MDYxNDI1fQ.6GytVKC89B6-NnfSjKwhb9FNwC5mQbJFdbt58_PEoxk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorage() {
    console.log("📦 Setting up Storage Buckets...");

    const buckets = ['logos', 'testimonials'];

    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.getBucket(bucket);

        if (error && error.message.includes('not found')) {
            console.log(`   (+) Creating bucket: ${bucket}`);
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 1048576, // 1MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
            });
            if (createError) console.error(`   (X) Error creating ${bucket}:`, createError.message);
            else console.log(`   (V) Bucket ${bucket} created.`);
        } else if (data) {
            console.log(`   (i) Bucket ${bucket} already exists.`);
            // Ensure it is public?
            if (!data.public) {
                console.log(`   (i) Updating ${bucket} to be public...`);
                await supabase.storage.updateBucket(bucket, { public: true });
            }
        } else {
            console.error(`   (X) Error checking ${bucket}:`, error?.message);
        }
    }
}

setupStorage();
