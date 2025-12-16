import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais fornecidas
const supabaseUrl = 'https://hoaqohaawgvgzoxsfzyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvYXFvaGFhd2d2Z3pveHNmenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODUzMjIsImV4cCI6MjA4MTM2MTMyMn0.nuLPM_6F-Pk9zknTuqbqu3Egl7HZSaLpM23hsm-BYbg';

export const supabase = createClient(supabaseUrl, supabaseKey);

/*
  --- INSTRUÇÕES PARA O SQL EDITOR DO SUPABASE ---
  Execute este SQL no painel do Supabase para criar a estrutura necessária:

  -- 1. Tabela de Perfis
  create table profiles (
    id uuid references auth.users not null primary key,
    updated_at timestamp with time zone,
    alias text unique,
    content jsonb
  );

  -- 2. Políticas de Segurança (RLS) para Perfis
  alter table profiles enable row level security;
  create policy "Users can view their own profile" on profiles for select using ( auth.uid() = id );
  create policy "Users can update their own profile" on profiles for update using ( auth.uid() = id );
  create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );

  -- 3. Bucket de Storage para Imagens
  insert into storage.buckets (id, name, public) values ('images', 'images', true);
  
  -- 4. Políticas de Storage
  create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' ); 
  create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'images' and auth.role() = 'authenticated' );
*/

// Função para upload de imagem
export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Erro no upload:', error);
    return null;
  }
};
