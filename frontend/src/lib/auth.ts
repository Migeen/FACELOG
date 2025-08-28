interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
}

class AuthService {
  private currentUser: User | null = null;

  login(email: string, password: string): Promise<User> {
    // Mock authentication - in real app, this would call an API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@company.com' && password === 'admin123') {
          this.currentUser = {
            id: '1',
            name: 'Admin User',
            email: 'admin@company.com',
            role: 'admin'
          };
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          resolve(this.currentUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
export type { User };