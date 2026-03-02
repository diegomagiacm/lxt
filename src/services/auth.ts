import { User } from '../../types';

export const loginUser = async (username: string, code: string): Promise<{ user: User | null, error: string | null }> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { user: data.user, error: null };
    } else {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login API error:', error);
    return { user: null, error: 'Connection error' };
  }
};

export const createUser = async (newUser: User): Promise<{ success: boolean, error: string | null }> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    if (response.ok) {
      return { success: true, error: null };
    } else {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to create user' };
    }
  } catch (error) {
    return { success: false, error: 'Connection error' };
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Get users API error:', error);
  }
  return [];
};

export const updateUserStats = async (username: string, extraHours: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${username}/stats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extraHours })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const changePassword = async (username: string, newCode: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const response = await fetch(`/api/users/${username}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newCode })
    });
    
    if (response.ok) {
      return { success: true, error: null };
    } else {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to change password' };
    }
  } catch (error) {
    return { success: false, error: 'Connection error' };
  }
};
