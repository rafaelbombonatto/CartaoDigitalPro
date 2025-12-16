import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais fornecidas
const supabaseUrl = 'https://hoaqohaawgvgzoxsfzyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvYXFvaGFhd2d2Z3pveHNmenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODUzMjIsImV4cCI6MjA4MTM2MTMyMn0.nuLPM_6F-Pk9zknTuqbqu3Egl7HZSaLpM23hsm-BYbg';

export const supabase = createClient(supabaseUrl, supabaseKey);

/*
  --- INSTRUÇÕES CRÍTICAS PARA SQL EDITOR DO SUPABASE ---
  Execute este SQL para garantir que os links públicos funcionem:

  -- 1. Políticas de Segurança (RLS) - ATUALIZADO PARA PERMITIR LEITURA PÚBLICA
  -- Remova políticas antigas de SELECT se existirem e adicione esta:
  drop policy if exists "Users can view their own profile" on profiles;
  create policy "Public profiles are viewable by everyone" on profiles for select using ( true );
  
  -- Mantenha as de escrita restritas:
  create policy "Users can update their own profile" on profiles for update using ( auth.uid() = id );
  create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );
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

// Buscar perfil por Slug/Alias (Público)
export const getProfileByAlias = async (alias: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('alias', alias)
        .single();
    
    return { data, error };
};