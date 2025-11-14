// Sistema de autenticación para HabitFlow
class Auth {
    constructor() {
        // No cargar usuarios aquí, se cargarán cuando se necesiten
        this.ensureTestUser();
    }

    // Obtener usuarios desde localStorage (siempre la versión más reciente)
    getUsers() {
        try {
            const stored = localStorage.getItem('habitflow-users');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    }

    // Guardar usuarios en localStorage
    saveUsers(users) {
        try {
            localStorage.setItem('habitflow-users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error al guardar usuarios:', error);
            return false;
        }
    }

    // Asegurar que el usuario de prueba existe
    ensureTestUser() {
        const users = this.getUsers();
        const testUserEmail = 'prueba@habitflow.com';
        const testUserExists = users.find(u => u.email && u.email.toLowerCase().trim() === testUserEmail.toLowerCase().trim());
        
        if (!testUserExists) {
            const testUser = {
                id: '8dc52c09-804a-450f-84c8-6e273a9480dd',
                name: 'Usuario Prueba',
                email: testUserEmail,
                password: 'prueba123',
                createdAt: new Date().toISOString(),
                profile: {
                    fullName: 'Usuario de Prueba HabitFlow',
                    email: testUserEmail,
                    biography: 'Desarrollador apasionado por los hábitos saludables. Me encanta mejorar mi vida día a día.',
                    timezone: 'America/Mexico_City',
                    goals: [
                        { text: 'Mejorar mi salud física', color: 'green' },
                        { text: 'Desarrollar disciplina mental', color: 'blue' },
                        { text: 'Aumentar mi productividad', color: 'purple' }
                    ]
                }
            };
            users.push(testUser);
            this.saveUsers(users);
        }
    }

    async register(name, email, password) {
        try {
            // Intentar usar la API primero
            if (typeof api !== 'undefined' && api) {
                const result = await api.register(name, email, password);
                if (result.success) {
                    return true;
                } else {
                    console.error('Error en API register:', result.error);
                    return false;
                }
            }
        } catch (error) {
            console.warn('API no disponible, usando LocalStorage como fallback:', error);
        }

        // Fallback a LocalStorage si la API no está disponible
        const users = this.getUsers();
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        if (users.find(u => u.email && u.email.toLowerCase().trim() === normalizedEmail)) {
            return false;
        }

        const user = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.trim(),
            password: password,
            createdAt: new Date().toISOString(),
            profile: {
                fullName: name.trim(),
                email: email.trim(),
                timezone: 'America/Mexico_City',
                goals: [
                    { text: 'Mejor salud', color: 'blue' },
                    { text: 'Más productividad', color: 'green' },
                    { text: 'Bienestar mental', color: 'purple' }
                ]
            }
        };

        users.push(user);
        return this.saveUsers(users);
    }

    async login(email, password) {
        try {
            // Intentar usar la API primero
            if (typeof api !== 'undefined' && api) {
                const result = await api.login(email, password);
                if (result.success) {
                    return true;
                } else {
                    console.error('Error en API login:', result.error);
                    return false;
                }
            }
        } catch (error) {
            console.warn('API no disponible, usando LocalStorage como fallback:', error);
        }

        // Fallback a LocalStorage si la API no está disponible
        const users = this.getUsers();
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        const normalizedPassword = password ? password.trim() : '';
        
        const user = users.find(u => {
            const userEmail = u.email ? u.email.toLowerCase().trim() : '';
            const userPassword = u.password ? u.password.trim() : '';
            return userEmail === normalizedEmail && userPassword === normalizedPassword;
        });
        
        if (user) {
            const displayName = user.profile?.fullName || user.name;
            try {
                localStorage.setItem('habitflow-current-user', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: displayName
                }));
                return true;
            } catch (error) {
                console.error('Error al guardar sesión:', error);
                return false;
            }
        }
        
        return false;
    }

    logout() {
        // Cerrar sesión en la API si está disponible
        if (typeof api !== 'undefined' && api) {
            api.logout();
        }
        localStorage.removeItem('habitflow-current-user');
    }

    getCurrentUser() {
        try {
            const stored = localStorage.getItem('habitflow-current-user');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            return null;
        }
    }

    getUserProfile() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        const users = this.getUsers();
        const user = users.find(u => u.id === currentUser.id);
        return user ? user.profile : null;
    }

    updateUserProfile(profileData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const users = this.getUsers();
        const user = users.find(u => u.id === currentUser.id);
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

        return this.saveUsers(users);
    }

    deleteUserAccount() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        // Eliminar usuario de la lista
        const users = this.getUsers();
        const filteredUsers = users.filter(u => u.id !== currentUser.id);
        this.saveUsers(filteredUsers);

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
    
    // Método para forzar la creación del usuario de prueba (útil para debugging)
    forceCreateTestUser() {
        const testUserEmail = 'prueba@habitflow.com';
        const normalizedTestEmail = testUserEmail.toLowerCase().trim();
        
        // Obtener usuarios actuales
        let users = this.getUsers();
        
        // Eliminar usuario de prueba existente si hay alguno con email similar
        users = users.filter(u => {
            const userEmail = u.email ? u.email.toLowerCase().trim() : '';
            return userEmail !== normalizedTestEmail;
        });
        
        // Crear nuevo usuario de prueba
        const testUser = {
            id: '8dc52c09-804a-450f-84c8-6e273a9480dd',
            name: 'Usuario Prueba',
            email: testUserEmail,
            password: 'prueba123',
            createdAt: new Date().toISOString(),
            profile: {
                fullName: 'Usuario de Prueba HabitFlow',
                email: testUserEmail,
                biography: 'Desarrollador apasionado por los hábitos saludables. Me encanta mejorar mi vida día a día.',
                timezone: 'America/Mexico_City',
                goals: [
                    { text: 'Mejorar mi salud física', color: 'green' },
                    { text: 'Desarrollar disciplina mental', color: 'blue' },
                    { text: 'Aumentar mi productividad', color: 'purple' }
                ]
            }
        };
        
        users.push(testUser);
        this.saveUsers(users);
        return testUser;
    }
    
    // Método de debug para verificar usuarios
    debugUsers() {
        const users = this.getUsers();
        console.log('=== DEBUG: Usuarios en LocalStorage ===');
        console.log('Total usuarios:', users.length);
        users.forEach((u, idx) => {
            console.log(`${idx + 1}. Email: ${u.email}, Password: ${u.password ? '***' : 'N/A'}, ID: ${u.id}`);
        });
        const testUser = users.find(u => u.email && u.email.toLowerCase().includes('prueba'));
        if (testUser) {
            console.log('Usuario de prueba encontrado:', testUser);
        } else {
            console.log('⚠️ Usuario de prueba NO encontrado');
        }
        console.log('=====================================');
    }
}

// Instancia global de autenticación
const auth = new Auth();

// Exponer método de debug en la consola (solo para desarrollo)
if (typeof window !== 'undefined') {
    window.debugAuth = () => {
        auth.debugUsers();
        console.log('Para forzar creación del usuario de prueba, ejecuta: auth.forceCreateTestUser()');
    };
}

