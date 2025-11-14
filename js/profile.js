// Gestión de perfil de usuario para HabitFlow
class ProfileManager {
    constructor() {
        this.habitsManager = new HabitsManager();
    }

    init() {
        this.loadProfile();
        this.loadStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botón editar perfil
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showEditModal();
        });

        // Cerrar modal
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('cancel-edit-profile').addEventListener('click', () => {
            this.hideEditModal();
        });

        // Formulario de edición
        document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Agregar objetivo
        document.getElementById('add-goal').addEventListener('click', () => {
            this.addGoalRow();
        });

        // Cambio de zona horaria
        document.getElementById('edit-timezone').addEventListener('change', (e) => {
            this.updateTimeDisplay(e.target.value);
        });

        // Menú de exportación
        const exportBtn = document.getElementById('export-data-btn');
        const exportMenu = document.getElementById('export-menu');
        
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('hidden');
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
                exportMenu.classList.add('hidden');
            }
        });

        // Exportar JSON
        document.getElementById('export-json-btn').addEventListener('click', () => {
            exportMenu.classList.add('hidden');
            this.exportJSON();
        });

        // Exportar PDF
        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            exportMenu.classList.add('hidden');
            this.exportPDF();
        });

        // Cerrar sesión desde perfil
        document.getElementById('logout-profile-btn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                auth.logout();
                window.location.href = 'login.html';
            }
        });

        // Eliminar cuenta
        document.getElementById('delete-account-btn').addEventListener('click', () => {
            this.deleteAccount();
        });
    }

    loadProfile() {
        const profile = auth.getUserProfile();
        const currentUser = auth.getCurrentUser();

        if (!profile && currentUser) {
            // Crear perfil por defecto si no existe
            const defaultProfile = {
                fullName: currentUser.name,
                email: currentUser.email,
                biography: '',
                timezone: 'America/Mexico_City',
                goals: [
                    { text: 'Mejor salud', color: 'blue' },
                    { text: 'Más productividad', color: 'green' },
                    { text: 'Bienestar mental', color: 'purple' }
                ]
            };
            auth.updateUserProfile(defaultProfile);
            this.loadProfile();
            return;
        }

        if (!profile) return;

        // Cargar datos del perfil
        document.getElementById('profile-full-name').textContent = profile.fullName || currentUser.name;
        document.getElementById('profile-email').textContent = profile.email || currentUser.email;
        document.getElementById('profile-biography').textContent = profile.biography || 'Sin biografía';
        
        // Fecha de creación
        const createdAt = currentUser.createdAt || new Date().toISOString();
        const createdDate = new Date(createdAt);
        document.getElementById('profile-created').textContent = createdDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Zona horaria
        const timezoneDisplay = this.getTimezoneDisplay(profile.timezone);
        document.getElementById('profile-timezone').textContent = timezoneDisplay;

        // Hora local
        this.updateLocalTime(profile.timezone);

        // Objetivos
        this.renderGoals(profile.goals || []);
    }

    loadStats() {
        const habits = this.habitsManager.getHabits();
        const today = new Date().toISOString().split('T')[0];

        // Total de hábitos
        document.getElementById('stats-total-habits').textContent = habits.length;

        // Completados hoy
        const completedToday = habits.filter(habit =>
            habit.completions && habit.completions[today]
        ).length;
        document.getElementById('stats-completed-today').textContent = completedToday;

        // Racha actual
        const currentStreak = this.calculateCurrentStreak(habits);
        document.getElementById('stats-current-streak').textContent = `${currentStreak} días`;

        // Mejor racha
        const bestStreak = this.calculateBestStreak(habits);
        document.getElementById('stats-best-streak').textContent = `${bestStreak} días`;

        // Días activos este mes
        const activeDays = this.calculateActiveDays(habits);
        document.getElementById('stats-active-days').textContent = activeDays;
    }

    showEditModal() {
        const profile = auth.getUserProfile();
        const currentUser = auth.getCurrentUser();

        if (!profile) {
            alert('Error al cargar el perfil');
            return;
        }

        // Llenar formulario
        document.getElementById('edit-full-name').value = profile.fullName || currentUser.name;
        document.getElementById('edit-email').value = profile.email || currentUser.email;
        document.getElementById('edit-biography').value = profile.biography || '';
        document.getElementById('edit-timezone').value = profile.timezone || 'America/Mexico_City';

        // Actualizar hora
        this.updateTimeDisplay(profile.timezone || 'America/Mexico_City');

        // Cargar objetivos
        this.loadGoalsInModal(profile.goals || []);

        // Mostrar modal
        document.getElementById('edit-profile-modal').classList.remove('hidden');
    }

    hideEditModal() {
        document.getElementById('edit-profile-modal').classList.add('hidden');
    }

    loadGoalsInModal(goals) {
        const container = document.getElementById('goals-container');
        container.innerHTML = '';

        goals.forEach((goal, index) => {
            const goalRow = this.createGoalRow(goal.text, goal.color, index);
            container.appendChild(goalRow);
        });

        // Si no hay objetivos, agregar uno por defecto
        if (goals.length === 0) {
            const defaultRow = this.createGoalRow('', 'blue', 0);
            container.appendChild(defaultRow);
        }
    }

    createGoalRow(text = '', color = 'blue', index = 0) {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-2';
        row.innerHTML = `
            <input 
                type="text" 
                value="${text}" 
                placeholder="Nuevo objetivo" 
                class="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
            />
            <select class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                <option value="blue" ${color === 'blue' ? 'selected' : ''}>Azul</option>
                <option value="green" ${color === 'green' ? 'selected' : ''}>Verde</option>
                <option value="purple" ${color === 'purple' ? 'selected' : ''}>Púrpura</option>
                <option value="red" ${color === 'red' ? 'selected' : ''}>Rojo</option>
                <option value="yellow" ${color === 'yellow' ? 'selected' : ''}>Amarillo</option>
            </select>
            <button type="button" class="remove-goal text-red-500 hover:text-red-700">
                <span class="material-icons-outlined">delete</span>
            </button>
        `;

        // Agregar evento para eliminar objetivo
        row.querySelector('.remove-goal').addEventListener('click', () => {
            row.remove();
        });

        return row;
    }

    addGoalRow() {
        const container = document.getElementById('goals-container');
        const newRow = this.createGoalRow('', 'blue', container.children.length);
        container.appendChild(newRow);
    }

    saveProfile() {
        const fullName = document.getElementById('edit-full-name').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const biography = document.getElementById('edit-biography').value.trim();
        const timezone = document.getElementById('edit-timezone').value;

        // Validar email
        if (!email || !email.includes('@')) {
            alert('Por favor ingresa un email válido');
            return;
        }

        // Recopilar objetivos
        const goals = [];
        document.querySelectorAll('#goals-container > div').forEach(goalRow => {
            const text = goalRow.querySelector('input[type="text"]').value.trim();
            const color = goalRow.querySelector('select').value;
            if (text) {
                goals.push({ text, color });
            }
        });

        // Actualizar perfil
        const profileData = {
            fullName,
            email,
            biography,
            timezone,
            goals
        };

        if (auth.updateUserProfile(profileData)) {
            alert('Perfil actualizado correctamente');
            this.hideEditModal();
            this.loadProfile();
            // Actualizar nombre en header
            const currentUser = auth.getCurrentUser();
            if (currentUser) {
                document.getElementById('user-name').textContent = currentUser.name;
            }
        } else {
            alert('Error al actualizar el perfil');
        }
    }

    renderGoals(goals) {
        const container = document.getElementById('profile-goals');
        
        if (!goals || goals.length === 0) {
            container.innerHTML = '<p class="text-text-secondary-light dark:text-text-secondary-dark">No tienes objetivos definidos</p>';
            return;
        }

        const colorClasses = {
            blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
        };

        container.innerHTML = goals.map(goal => {
            const colorClass = colorClasses[goal.color] || colorClasses.blue;
            return `<span class="px-3 py-1 ${colorClass} rounded-full text-sm">${goal.text}</span>`;
        }).join('');
    }

    updateTimeDisplay(timezone) {
        const currentTime = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone
        });
        document.getElementById('current-time-display').textContent = currentTime;
    }

    updateLocalTime(timezone) {
        const updateTime = () => {
            const currentTime = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timezone
            });
            document.getElementById('profile-local-time').textContent = currentTime;
        };

        updateTime();
        // Actualizar cada minuto
        setInterval(updateTime, 60000);
    }

    getTimezoneDisplay(timezone) {
        const timezoneMap = {
            'America/Argentina/Buenos_Aires': 'Buenos Aires, Argentina (GMT-3)',
            'America/Mexico_City': 'Ciudad de México (GMT-6)',
            'America/New_York': 'Nueva York (GMT-5)',
            'America/Los_Angeles': 'Los Ángeles (GMT-8)',
            'Europe/Madrid': 'Madrid (GMT+1)',
            'Europe/London': 'Londres (GMT+0)',
            'Asia/Tokyo': 'Tokio (GMT+9)',
            'Australia/Sydney': 'Sídney (GMT+10)'
        };
        return timezoneMap[timezone] || 'Ciudad de México (GMT-6)';
    }

    exportJSON() {
        const habits = this.habitsManager.getHabits();
        const profile = auth.getUserProfile();
        const currentUser = auth.getCurrentUser();

        const data = {
            profile: profile,
            habits: habits,
            exportDate: new Date().toISOString(),
            version: '1.2'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habitflow-data-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const habits = this.habitsManager.getHabits();
        const profile = auth.getUserProfile();
        const currentUser = auth.getCurrentUser();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        const margin = 20;
        const lineHeight = 7;
        const sectionSpacing = 15;

        // Colores
        const primaryColor = [16, 185, 129]; // #10B981
        const darkGray = [31, 41, 55];
        const lightGray = [107, 114, 128];
        const borderGray = [229, 231, 235];

        // Header con fondo verde
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        // Logo/Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('HabitFlow', margin, 30);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Reporte de Hábitos Saludables', margin, 40);

        yPosition = 60;

        // Información del Usuario
        doc.setTextColor(...darkGray);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Usuario', margin, yPosition);
        
        yPosition += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...lightGray);
        doc.text(`Nombre: ${profile?.fullName || currentUser.name}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Email: ${profile?.email || currentUser.email}`, margin, yPosition);
        yPosition += lineHeight;
        if (profile?.timezone) {
            const timezoneDisplay = this.getTimezoneDisplay(profile.timezone);
            doc.text(`Zona Horaria: ${timezoneDisplay}`, margin, yPosition);
            yPosition += lineHeight;
        }
        const createdAt = new Date(currentUser.createdAt || new Date().toISOString());
        doc.text(`Miembro desde: ${createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, yPosition);
        yPosition += sectionSpacing + 5;

        // Estadísticas
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(h => h.completions && h.completions[today]).length;
        const totalHabits = habits.length;
        const currentStreak = this.calculateCurrentStreak(habits);
        const activeDays = this.calculateActiveDays(habits);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkGray);
        doc.text('Estadísticas', margin, yPosition);
        
        yPosition += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...lightGray);
        
        // Cuadro de estadísticas
        const statsBoxY = yPosition - 5;
        doc.setDrawColor(...borderGray);
        doc.setLineWidth(0.5);
        doc.rect(margin, statsBoxY, pageWidth - 2 * margin, 30);
        
        doc.text(`Total de Hábitos: ${totalHabits}`, margin + 5, yPosition + 5);
        doc.text(`Completados Hoy: ${completedToday}`, margin + 5, yPosition + 12);
        doc.text(`Racha Actual: ${currentStreak} días`, pageWidth / 2, yPosition + 5);
        doc.text(`Días Activos (mes): ${activeDays}`, pageWidth / 2, yPosition + 12);
        
        yPosition += 35;

        // Objetivos Personales
        if (profile?.goals && profile.goals.length > 0) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkGray);
            doc.text('Objetivos Personales', margin, yPosition);
            
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightGray);
            
            profile.goals.forEach((goal, index) => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(`• ${goal.text}`, margin + 5, yPosition);
                yPosition += lineHeight;
            });
            yPosition += sectionSpacing;
        }

        // Lista de Hábitos
        if (habits.length > 0) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkGray);
            doc.text('Mis Hábitos', margin, yPosition);
            yPosition += 10;

            habits.forEach((habit, index) => {
                // Verificar si necesitamos nueva página
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Fondo del hábito
                doc.setFillColor(249, 250, 251);
                doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20, 'F');
                
                // Borde
                doc.setDrawColor(...borderGray);
                doc.setLineWidth(0.3);
                doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20);

                // Nombre del hábito
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...darkGray);
                doc.text(habit.name, margin + 5, yPosition + 2);

                // Categoría
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...lightGray);
                doc.text(`Categoría: ${habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}`, margin + 5, yPosition + 8);

                // Meta
                if (habit.goal) {
                    doc.text(`Meta: ${habit.goal}`, pageWidth / 2, yPosition + 8);
                }

                // Estadísticas del hábito
                const habitStreak = this.calculateHabitStreak(habit);
                const habitCompletions = habit.completions ? Object.keys(habit.completions).length : 0;
                doc.text(`Racha: ${habitStreak} días | Completaciones: ${habitCompletions}`, margin + 5, yPosition + 14);

                yPosition += 25;
            });
        } else {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightGray);
            doc.text('No hay hábitos registrados aún.', margin, yPosition);
            yPosition += lineHeight;
        }

        // Footer
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.setFont('helvetica', 'italic');
        doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, footerY);
        doc.text('HabitFlow v1.2 - Transforma tu vida un hábito a la vez', pageWidth - margin, footerY, { align: 'right' });

        // Guardar PDF
        const fileName = `habitflow-reporte-${currentUser.name}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }

    deleteAccount() {
        if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta?')) {
            return;
        }

        if (!confirm('Esta acción eliminará TODOS tus datos permanentemente. ¿Continuar?')) {
            return;
        }

        if (auth.deleteUserAccount()) {
            alert('Cuenta eliminada correctamente');
            window.location.href = 'login.html';
        } else {
            alert('Error al eliminar la cuenta');
        }
    }

    calculateCurrentStreak(habits) {
        if (habits.length === 0) return 0;

        let maxStreak = 0;
        habits.forEach(habit => {
            const streak = this.calculateHabitStreak(habit);
            maxStreak = Math.max(maxStreak, streak);
        });

        return maxStreak;
    }

    calculateBestStreak(habits) {
        return this.calculateCurrentStreak(habits); // Por ahora es lo mismo
    }

    calculateHabitStreak(habit) {
        if (!habit.completions) return 0;

        const dates = Object.keys(habit.completions)
            .filter(date => habit.completions[date])
            .sort()
            .reverse();

        if (dates.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < dates.length; i++) {
            const date = new Date(dates[i]);
            date.setHours(0, 0, 0, 0);
            const diffTime = currentDate - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
                currentDate = date;
            } else if (diffDays === streak + 1) {
                streak++;
                currentDate = date;
            } else {
                break;
            }
        }

        return streak;
    }

    calculateActiveDays(habits) {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        let activeDays = new Set();

        habits.forEach(habit => {
            if (habit.completions) {
                Object.keys(habit.completions).forEach(dateStr => {
                    const date = new Date(dateStr);
                    if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
                        activeDays.add(dateStr);
                    }
                });
            }
        });

        return activeDays.size;
    }
}

