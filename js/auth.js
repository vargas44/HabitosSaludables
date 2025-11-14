// Sistema de autenticación para HabitFlow
class Auth {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        const stored = localStorage.getItem('habitflow-users');
        return stored ? JSON.parse(stored) : [];
    }

    saveUsers() {
        localStorage.setItem('habitflow-users', JSON.stringify(this.users));
    }

    register(name, email, password) {
        // Verificar si el usuario ya existe
        if (this.users.find(u => u.email === email)) {
            return false;
        }

        // Crear nuevo usuario con datos de perfil por defecto
        const user = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password, // En producción, esto debería estar hasheado
            createdAt: new Date().toISOString(),
            profile: {
                fullName: name,
                email: email,
                timezone: 'America/Mexico_City',
                goals: [
                    { text: 'Mejor salud', color: 'blue' },
                    { text: 'Más productividad', color: 'green' },
                    { text: 'Bienestar mental', color: 'purple' }
                ]
            }
        };

        this.users.push(user);
        this.saveUsers();
        return true;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Usar nombre del perfil si existe, sino el nombre del usuario
            const displayName = user.profile?.fullName || user.name;
            
            // Guardar sesión actual
            localStorage.setItem('habitflow-current-user', JSON.stringify({
                id: user.id,
                email: user.email,
                name: displayName
            }));
            return true;
        }
        
        return false;
    }

    logout() {
        localStorage.removeItem('habitflow-current-user');
    }

    getCurrentUser() {
        const stored = localStorage.getItem('habitflow-current-user');
        return stored ? JSON.parse(stored) : null;
    }

    getUserProfile() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        const user = this.users.find(u => u.id === currentUser.id);
        return user ? user.profile : null;
    }

    updateUserProfile(profileData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const user = this.users.find(u => u.id === currentUser.id);
        if (!user) return false;

        // Actualizar perfil
        user.profile = {
            ...user.profile,
            ...profileData
        };

        // Actualizar datos básicos si cambian
        if (profileData.fullName) {
            user.name = profileData.fullName;
            currentUser.name = profileData.fullName;
            localStorage.setItem('habitflow-current-user', JSON.stringify(currentUser));
        }

        if (profileData.email) {
            user.email = profileData.email;
            currentUser.email = profileData.email;
            localStorage.setItem('habitflow-current-user', JSON.stringify(currentUser));
        }

        this.saveUsers();
        return true;
    }

    deleteUserAccount() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        // Eliminar usuario de la lista
        this.users = this.users.filter(u => u.id !== currentUser.id);
        this.saveUsers();

        // Eliminar datos del usuario
        localStorage.removeItem(`habitflow-habits-${currentUser.id}`);
        localStorage.removeItem('habitflow-current-user');

        return true;
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Instancia global de autenticación
const auth = new Auth();

