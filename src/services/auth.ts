import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { User } from '../../types';
import { INITIAL_USERS } from '../../constants';

// Mock storage for demo purposes if Supabase is not connected
const getMockUsers = () => {
  const stored = localStorage.getItem('mock_users');
  if (stored) return JSON.parse(stored);
  return [...INITIAL_USERS];
};

let MOCK_USERS: User[] = getMockUsers();

const saveMockUsers = () => {
  localStorage.setItem('mock_users', JSON.stringify(MOCK_USERS));
};

export const loginUser = async (username: string, code: string): Promise<{ user: User | null, error: string | null }> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('code', code) // In production, use hashed passwords!
        .single();

      if (error) return { user: null, error: 'Credenciales inválidas' };
      
      // Map DB response to User type
      const user: User = {
        username: data.username,
        code: data.code,
        role: data.role,
        salesCount: data.sales_count || 0,
        extraHours: data.extra_hours || 0,
        id: data.id
      };
      
      return { user, error: null };
    } catch (err) {
      console.error("Supabase login error:", err);
      return { user: null, error: 'Error de conexión' };
    }
  } else {
    // Refresh mock users from storage just in case
    MOCK_USERS = getMockUsers();
    const user = MOCK_USERS.find(u => u.username === username && u.code === code);
    if (user) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { user, error: null };
    }
    return { user: null, error: 'Usuario o contraseña incorrectos' };
  }
};

export const createUser = async (newUser: User): Promise<{ success: boolean, error: string | null }> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('users').insert([{
      username: newUser.username,
      code: newUser.code,
      role: newUser.role,
      sales_count: 0,
      extra_hours: 0
    }]);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } else {
    MOCK_USERS.push(newUser);
    saveMockUsers();
    return { success: true, error: null };
  }
};

export const getUsers = async (): Promise<User[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('users').select('*');
    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        username: d.username,
        code: d.code,
        role: d.role,
        salesCount: d.sales_count || 0,
        extraHours: d.extra_hours || 0
      }));
    }
    return [];
  }
  return getMockUsers();
}

export const updateUserStats = async (username: string, extraHours: number): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
     // First get current
     const { data: current } = await supabase.from('users').select('extra_hours').eq('username', username).single();
     if (!current) return false;
     
     const { error } = await supabase.from('users').update({ extra_hours: (current.extra_hours || 0) + extraHours }).eq('username', username);
     return !error;
  } else {
    const idx = MOCK_USERS.findIndex(u => u.username === username);
    if (idx !== -1) {
      MOCK_USERS[idx].extraHours = (MOCK_USERS[idx].extraHours || 0) + extraHours;
      saveMockUsers();
      return true;
    }
    return false;
  }
}

export const changePassword = async (username: string, newCode: string): Promise<{ success: boolean, error: string | null }> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('users').update({ code: newCode }).eq('username', username);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } else {
    const idx = MOCK_USERS.findIndex(u => u.username === username);
    if (idx !== -1) {
      MOCK_USERS[idx].code = newCode;
      saveMockUsers();
      return { success: true, error: null };
    }
    return { success: false, error: 'Usuario no encontrado' };
  }
};
