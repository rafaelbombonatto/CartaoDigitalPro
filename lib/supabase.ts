
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para acesso seguro a variáveis de ambiente
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn(`Erro ao ler variável de ambiente ${key}`, e);
  }
  return undefined;
};

// Fallbacks para garantir funcionamento em ambientes de preview/dev sem build do Vite
//const SUPABASE_URL_FALLBACK = "https://hoaqohaawgvgzoxsfzyt.supabase.co";
const SUPABASE_URL_FALLBACK = "https://analisecardpro.com.br";
const SUPABASE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvYXFvaGFhd2d2Z3pveHNmenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODUzMjIsImV4cCI6MjA4MTM2MTMyMn0.nuLPM_6F-Pk9zknTuqbqu3Egl7HZSaLpM23hsm-BYbg";

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || SUPABASE_URL_FALLBACK;
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || SUPABASE_KEY_FALLBACK;

if (!supabaseUrl || !supabaseKey) {
  console.warn('ATENÇÃO: Credenciais do Supabase não encontradas. Verifique suas variáveis de ambiente.');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || ''
);

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
    console.error('Erro no processamento da imagem:', error);
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

// Verificar disponibilidade do Alias
export const checkAliasAvailability = async (alias: string, currentUserId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('alias', alias);

    if (error || !data) return true;

    for (const profile of data) {
        if (profile.id !== currentUserId) {
            return false;
        }
    }
    
    return true;
};
