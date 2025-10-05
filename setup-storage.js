import supabase from './backend/src/lib/supabase.js';

async function setupStorageBucket() {
  try {
    console.log('Setting up profile-pictures bucket...');

    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.id === 'profile-pictures');

    if (!bucketExists) {
      // Crear el bucket si no existe
      const { data: bucket, error: bucketError } = await supabase.storage.createBucket('profile-pictures', {
        public: true, // Hacer el bucket público
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB límite
      });

      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        return;
      }

      console.log('Bucket created successfully');
    } else {
      console.log('Bucket already exists');
    }

    // Intentar listar archivos en el bucket para verificar permisos
    const { data: files, error: filesError } = await supabase.storage
      .from('profile-pictures')
      .list();

    if (filesError) {
      console.error('Error accessing bucket (permissions issue?):', filesError);
    } else {
      console.log('Bucket is accessible, files:', files?.length || 0);
    }

    console.log('Storage setup completed!');
    console.log('Note: Make sure RLS policies are configured in Supabase Dashboard if needed');

  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorageBucket();
