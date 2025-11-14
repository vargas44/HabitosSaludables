// Cliente API para conectar frontend con backend PostgreSQL
const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.currentUser = this.getStoredUser();
    }

    getStoredUser() {
        try {
            const stored = localStorage.getItem('habitflow-current-user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('habitflow-current-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('habitflow-current-user');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Agregar user-id header si hay usuario autenticado
        if (this.currentUser) {
            headers['user-id'] = this.currentUser.id;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en API request:', error);
            throw error;
        }
    }

    // ==================== AUTENTICACIÓN ====================
    
    async register(name, email, password) {
        const result = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        if (result.success) {
            this.setCurrentUser(result.user);
        }
        
        return result;
    }

    async login(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (result.success) {
            this.setCurrentUser(result.user);
        }
        
        return result;
    }

    logout() {
        this.setCurrentUser(null);
    }

    // ==================== HÁBITOS ====================

    async getHabits() {
        const result = await this.request('/habits', { method: 'GET' });
        console.log('API getHabits - Resultado crudo:', result);
        // Asegurar que las completaciones estén en el formato correcto
        if (result.success && result.habits) {
            result.habits = result.habits.map(habit => {
                const completions = habit.completions || {};
                console.log(`API - Hábito ${habit.name}:`, {
                    id: habit.id,
                    completions: completions,
                    completionsType: typeof completions,
                    completionsKeys: Object.keys(completions),
                    completionsIsObject: completions instanceof Object && !Array.isArray(completions)
                });
                return {
                    ...habit,
                    completions: completions
                };
            });
        }
        console.log('API getHabits - Resultado procesado:', result);
        return result;
    }

    async createHabit(habitData) {
        return await this.request('/habits', {
            method: 'POST',
            body: JSON.stringify(habitData)
        });
    }

    async updateHabit(habitId, habitData) {
        return await this.request(`/habits/${habitId}`, {
            method: 'PUT',
            body: JSON.stringify(habitData)
        });
    }

    async deleteHabit(habitId) {
        return await this.request(`/habits/${habitId}`, {
            method: 'DELETE'
        });
    }

    // ==================== COMPLETACIONES ====================

    async completeHabit(habitId, date = null) {
        return await this.request(`/habits/${habitId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ date: date || new Date().toISOString().split('T')[0] })
        });
    }

    async uncompleteHabit(habitId, date = null) {
        return await this.request(`/habits/${habitId}/complete`, {
            method: 'DELETE',
            body: JSON.stringify({ date: date || new Date().toISOString().split('T')[0] })
        });
    }

    // ==================== PROGRESO ====================

    async recordProgress(habitId, progressValue, date = null) {
        return await this.request(`/habits/${habitId}/progress`, {
            method: 'POST',
            body: JSON.stringify({
                progress_value: progressValue,
                date: date || new Date().toISOString().split('T')[0]
            })
        });
    }

    // ==================== ESTADÍSTICAS ====================

    async getStatistics() {
        return await this.request('/statistics', { method: 'GET' });
    }

    // ==================== PERFIL ====================

    async getProfile() {
        return await this.request('/profile', { method: 'GET' });
    }

    async updateProfile(profileData) {
        return await this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
}

// Instancia global del cliente API
const api = new ApiClient();

