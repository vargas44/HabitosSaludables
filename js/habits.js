// Gestión de hábitos para HabitFlow
class HabitsManager {
    constructor() {
        this.currentUser = auth.getCurrentUser();
        this.habits = this.loadHabits();
    }

    loadHabits() {
        if (!this.currentUser) return [];
        const stored = localStorage.getItem(`habitflow-habits-${this.currentUser.id}`);
        return stored ? JSON.parse(stored) : [];
    }

    saveHabits() {
        if (!this.currentUser) return;
        localStorage.setItem(`habitflow-habits-${this.currentUser.id}`, JSON.stringify(this.habits));
    }

    init() {
        this.setupEventListeners();
        this.renderHabits();
        this.updateStats();
    }

    setupEventListeners() {
        // Botón nuevo hábito
        document.getElementById('new-habit-btn').addEventListener('click', () => {
            this.showModal();
        });

        // Cerrar modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-habit').addEventListener('click', () => {
            this.hideModal();
        });

        // Formulario de hábito
        document.getElementById('habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHabit();
        });

        // Búsqueda y filtros
        document.getElementById('habit-search').addEventListener('input', () => {
            this.renderHabits();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.renderHabits();
        });

        document.getElementById('sort-habits').addEventListener('change', () => {
            this.renderHabits();
        });

        // Vista detallada del hábito
        document.getElementById('close-detail-modal').addEventListener('click', () => {
            this.hideHabitDetail();
        });

        document.getElementById('decrease-progress').addEventListener('click', () => {
            const input = document.getElementById('progress-value-input');
            const currentValue = parseInt(input.value) || 1;
            input.value = Math.max(1, currentValue - 1);
        });

        document.getElementById('increase-progress').addEventListener('click', () => {
            const input = document.getElementById('progress-value-input');
            const currentValue = parseInt(input.value) || 1;
            input.value = currentValue + 1;
        });

        document.getElementById('update-progress-btn').addEventListener('click', () => {
            this.updateHabitProgress(true);
        });

        document.getElementById('subtract-progress-btn').addEventListener('click', () => {
            this.updateHabitProgress(false);
        });

        document.getElementById('mark-completed-btn').addEventListener('click', () => {
            this.markHabitCompleted();
        });

        document.getElementById('reset-progress-btn').addEventListener('click', () => {
            this.resetHabitProgress();
        });
    }

    showModal(habitId = null) {
        const modal = document.getElementById('habit-modal');
        const form = document.getElementById('habit-form');
        const title = document.getElementById('modal-title');

        if (habitId) {
            // Editar hábito existente
            const habit = this.habits.find(h => h.id === habitId);
            if (habit) {
                title.textContent = 'Editar Hábito';
                document.getElementById('habit-id').value = habit.id;
                document.getElementById('habit-name').value = habit.name;
                document.getElementById('habit-category').value = habit.category;
                document.getElementById('habit-goal').value = habit.goal || '';
                document.getElementById('habit-description').value = habit.description || '';
            }
        } else {
            // Nuevo hábito
            title.textContent = 'Nuevo Hábito';
            form.reset();
            document.getElementById('habit-id').value = '';
        }

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('habit-modal').classList.add('hidden');
        document.getElementById('habit-form').reset();
        document.getElementById('habit-id').value = '';
    }

    saveHabit() {
        const id = document.getElementById('habit-id').value;
        const name = document.getElementById('habit-name').value.trim();
        const category = document.getElementById('habit-category').value;
        const goal = document.getElementById('habit-goal').value.trim();
        const description = document.getElementById('habit-description').value.trim();

        if (!name) return;

        if (id) {
            // Actualizar hábito existente
            const habit = this.habits.find(h => h.id === id);
            if (habit) {
                habit.name = name;
                habit.category = category;
                habit.goal = goal;
                habit.description = description;
                habit.icon = this.getCategoryIcon(category);
                habit.color = this.getCategoryColor(category);
            }
        } else {
            // Crear nuevo hábito
            const habit = {
                id: Date.now().toString(),
                name: name,
                category: category,
                goal: goal,
                description: description,
                icon: this.getCategoryIcon(category),
                color: this.getCategoryColor(category),
                completions: {},
                createdAt: new Date().toISOString()
            };
            this.habits.push(habit);
        }

        this.saveHabits();
        this.hideModal();
        this.renderHabits();
        this.updateStats();
    }

    deleteHabit(habitId) {
        if (confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.renderHabits();
            this.updateStats();
        }
    }

    toggleHabitCompletion(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];

        if (!habit.completions) {
            habit.completions = {};
        }

        if (habit.completions[today]) {
            delete habit.completions[today];
        } else {
            habit.completions[today] = true;
        }

        this.saveHabits();
        this.renderHabits();
        this.updateStats();
    }

    getFilteredHabits() {
        let filtered = [...this.habits];

        // Búsqueda
        const searchTerm = document.getElementById('habit-search').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(habit =>
                habit.name.toLowerCase().includes(searchTerm) ||
                (habit.goal && habit.goal.toLowerCase().includes(searchTerm)) ||
                (habit.description && habit.description.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro por categoría
        const category = document.getElementById('category-filter').value;
        if (category) {
            filtered = filtered.filter(habit => habit.category === category);
        }

        // Ordenamiento
        const sortBy = document.getElementById('sort-habits').value;
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'streak':
                    return this.calculateStreak(b) - this.calculateStreak(a);
                case 'completion':
                    return this.calculateCompletionRate(b) - this.calculateCompletionRate(a);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    renderHabits() {
        const container = document.getElementById('habits-list');
        const emptyState = document.getElementById('empty-state');
        const filteredHabits = this.getFilteredHabits();

        if (filteredHabits.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        filteredHabits.forEach(habit => {
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.completions && habit.completions[today];
            const streak = this.calculateStreak(habit);
            const completionRate = this.calculateCompletionRate(habit);
            const todayProgress = this.calculateTodayProgress(habit);

            const habitCard = document.createElement('div');
            habitCard.className = 'bg-card-light dark:bg-card-dark p-6 rounded-lg';
            habitCard.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex items-start flex-1">
                        <div class="bg-${habit.color}-100 dark:bg-${habit.color}-900 p-3 rounded-lg mr-4">
                            <span class="material-icons-outlined text-${habit.color}-600 dark:text-${habit.color}-400">${habit.icon}</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="font-semibold text-lg text-text-light dark:text-text-dark">${habit.name}</h3>
                                <span class="text-xs px-2 py-1 rounded-full bg-${habit.color}-100 dark:bg-${habit.color}-900 text-${habit.color}-600 dark:text-${habit.color}-400 capitalize">${habit.category}</span>
                            </div>
                            ${habit.goal ? `<p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">${habit.goal}</p>` : ''}
                            ${habit.description ? `<p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">${habit.description}</p>` : ''}
                            
                            <!-- Barra de progreso -->
                            <div class="mb-3">
                                <div class="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                                    <span>Progreso de Hoy</span>
                                    <span>${todayProgress.percentage}%</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-${habit.color}-500 h-2 rounded-full transition-all" style="width: ${todayProgress.percentage}%"></div>
                                </div>
                                ${todayProgress.hasProgress ? `<div class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">${todayProgress.current}/${todayProgress.target} ${todayProgress.unit}</div>` : ''}
                            </div>
                            
                            <!-- Estadísticas -->
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center space-x-4">
                                    <span class="text-text-secondary-light dark:text-text-secondary-dark flex items-center">
                                        <span class="material-icons-outlined text-sm mr-1">local_fire_department</span>
                                        ${streak} días
                                    </span>
                                    <span class="text-text-secondary-light dark:text-text-secondary-dark flex items-center">
                                        <span class="material-icons-outlined text-sm mr-1">check_circle</span>
                                        ${completionRate}%
                                    </span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="view-habit-detail text-primary hover:text-green-600 transition-colors" 
                                            data-habit-id="${habit.id}" 
                                            title="Ver detalles y progreso">
                                        <span class="material-icons-outlined">visibility</span>
                                    </button>
                                    <button class="habit-toggle text-${isCompletedToday ? 'green' : 'gray'}-500 hover:text-${isCompletedToday ? 'green' : 'gray'}-700 transition-colors" 
                                            data-habit-id="${habit.id}" 
                                            title="${isCompletedToday ? 'Marcar como no completado' : 'Marcar como completado'}">
                                        <span class="material-icons-outlined">${isCompletedToday ? 'check_circle' : 'radio_button_unchecked'}</span>
                                    </button>
                                    <button class="edit-habit text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors" 
                                            data-habit-id="${habit.id}" 
                                            title="Editar hábito">
                                        <span class="material-icons-outlined">edit</span>
                                    </button>
                                    <button class="delete-habit text-red-500 hover:text-red-700 transition-colors" 
                                            data-habit-id="${habit.id}" 
                                            title="Eliminar hábito">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(habitCard);
        });

        // Event listeners para los botones
        container.querySelectorAll('.edit-habit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.showModal(habitId);
            });
        });

        container.querySelectorAll('.delete-habit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.deleteHabit(habitId);
            });
        });

        container.querySelectorAll('.habit-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.toggleHabitCompletion(habitId);
            });
        });

        container.querySelectorAll('.view-habit-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.showHabitDetail(habitId);
            });
        });
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.habits.filter(habit =>
            habit.completions && habit.completions[today]
        ).length;

        const totalHabits = this.habits.length;
        const completionRate = totalHabits > 0
            ? Math.round((completedToday / totalHabits) * 100)
            : 0;

        const currentStreak = this.calculateCurrentStreak();

        document.getElementById('total-habits').textContent = totalHabits;
        document.getElementById('completed-today').textContent = completedToday;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        document.getElementById('current-streak').textContent = `${currentStreak} días`;
    }

    calculateStreak(habit) {
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

    calculateCurrentStreak() {
        if (this.habits.length === 0) return 0;

        let maxStreak = 0;
        this.habits.forEach(habit => {
            const streak = this.calculateStreak(habit);
            maxStreak = Math.max(maxStreak, streak);
        });

        return maxStreak;
    }

    calculateCompletionRate(habit) {
        if (!habit.completions) return 0;

        const totalCompletions = Object.keys(habit.completions).length;
        if (totalCompletions === 0) return 0;

        // Calcular desde la fecha de creación
        const createdAt = new Date(habit.createdAt);
        const today = new Date();
        const daysSinceCreation = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));

        return daysSinceCreation > 0
            ? Math.round((totalCompletions / daysSinceCreation) * 100)
            : 0;
    }

    calculateTodayProgress(habit) {
        const today = new Date().toISOString().split('T')[0];
        
        // Si no hay targetValue, extraerlo de la meta
        if (!habit.targetValue) {
            const match = habit.goal ? habit.goal.match(/\d+/) : null;
            habit.targetValue = match ? parseInt(match[0]) : 1;
        }

        const targetValue = habit.targetValue || 1;
        const currentProgress = (habit.dailyProgress && habit.dailyProgress[today]) || 0;
        const percentage = Math.min(100, Math.round((currentProgress / targetValue) * 100));
        const unit = this.extractUnit(habit.goal) || 'unidades';

        return {
            current: currentProgress,
            target: targetValue,
            percentage: percentage,
            unit: unit,
            hasProgress: currentProgress > 0 || targetValue > 1
        };
    }

    getCategoryIcon(category) {
        const icons = {
            salud: 'favorite',
            ejercicio: 'fitness_center',
            alimentacion: 'restaurant',
            mental: 'psychology',
            productividad: 'work'
        };
        return icons[category] || 'check_circle';
    }

    getCategoryColor(category) {
        const colors = {
            salud: 'red',
            ejercicio: 'green',
            alimentacion: 'orange',
            mental: 'purple',
            productividad: 'blue'
        };
        return colors[category] || 'gray';
    }

    showHabitDetail(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        
        // Inicializar estructuras si no existen
        if (!habit.dailyProgress) {
            habit.dailyProgress = {};
        }
        if (!habit.targetValue) {
            // Extraer número de la meta si existe (ej: "30 minutos" -> 30)
            const match = habit.goal ? habit.goal.match(/\d+/) : null;
            habit.targetValue = match ? parseInt(match[0]) : 1;
        }

        const currentProgress = habit.dailyProgress[today] || 0;
        const targetValue = habit.targetValue || 1;
        const percentage = Math.min(100, Math.round((currentProgress / targetValue) * 100));

        // Actualizar UI
        document.getElementById('detail-habit-name').textContent = habit.name;
        document.getElementById('detail-habit-description').textContent = habit.goal || habit.description || 'Sin descripción';
        
        // Icono
        const iconContainer = document.getElementById('detail-habit-icon');
        iconContainer.className = `w-12 h-12 rounded-lg mr-3 flex items-center justify-center bg-${habit.color}-500`;
        iconContainer.querySelector('span').textContent = habit.icon;

        // Progreso
        document.getElementById('detail-progress-value').textContent = `${currentProgress}/${targetValue}`;
        document.getElementById('detail-progress-percentage').textContent = `${percentage}%`;
        document.getElementById('detail-progress-bar').style.width = `${percentage}%`;
        
        // Unidad (extraer de la meta o usar "unidades")
        const unit = this.extractUnit(habit.goal) || 'unidades';
        document.getElementById('detail-progress-unit').textContent = unit;

        // Guardar habitId en el modal
        document.getElementById('habit-detail-modal').dataset.habitId = habitId;

        // Mostrar modal
        document.getElementById('habit-detail-modal').classList.remove('hidden');
    }

    hideHabitDetail() {
        document.getElementById('habit-detail-modal').classList.add('hidden');
    }

    updateHabitProgress(add = true) {
        const modal = document.getElementById('habit-detail-modal');
        const habitId = modal.dataset.habitId;
        if (!habitId) return;

        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const value = parseInt(document.getElementById('progress-value-input').value) || 1;
        
        // Inicializar targetValue si no existe
        if (!habit.targetValue) {
            const match = habit.goal ? habit.goal.match(/\d+/) : null;
            habit.targetValue = match ? parseInt(match[0]) : 1;
        }
        
        const targetValue = habit.targetValue || 1;

        if (!habit.dailyProgress) {
            habit.dailyProgress = {};
        }

        const currentProgress = habit.dailyProgress[today] || 0;
        const newProgress = add 
            ? Math.max(0, currentProgress + value)
            : Math.max(0, currentProgress - value);
        habit.dailyProgress[today] = newProgress;

        // Si alcanza o supera la meta, marcar como completado
        if (newProgress >= targetValue) {
            if (!habit.completions) {
                habit.completions = {};
            }
            habit.completions[today] = true;
        } else if (newProgress < targetValue && habit.completions) {
            // Si baja de la meta, desmarcar como completado
            delete habit.completions[today];
        }

        this.saveHabits();
        this.showHabitDetail(habitId); // Refrescar vista
        this.renderHabits();
        this.updateStats();
    }

    markHabitCompleted() {
        const modal = document.getElementById('habit-detail-modal');
        const habitId = modal.dataset.habitId;
        if (!habitId) return;

        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const targetValue = habit.targetValue || 1;

        if (!habit.completions) {
            habit.completions = {};
        }
        if (!habit.dailyProgress) {
            habit.dailyProgress = {};
        }

        // Marcar como completado y establecer progreso al máximo
        habit.completions[today] = true;
        habit.dailyProgress[today] = targetValue;

        this.saveHabits();
        this.showHabitDetail(habitId); // Refrescar vista
        this.renderHabits();
        this.updateStats();
    }

    resetHabitProgress() {
        const modal = document.getElementById('habit-detail-modal');
        const habitId = modal.dataset.habitId;
        if (!habitId) return;

        if (!confirm('¿Estás seguro de que quieres reiniciar el progreso de hoy?')) {
            return;
        }

        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];

        if (habit.dailyProgress) {
            delete habit.dailyProgress[today];
        }
        if (habit.completions) {
            delete habit.completions[today];
        }

        this.saveHabits();
        this.showHabitDetail(habitId); // Refrescar vista
        this.renderHabits();
        this.updateStats();
    }

    extractUnit(goal) {
        if (!goal) return null;
        const units = ['minutos', 'minuto', 'horas', 'hora', 'veces', 'vez', 'unidades', 'unidad', 'km', 'kilómetros', 'kg', 'kilogramos', 'litros', 'litro'];
        const lowerGoal = goal.toLowerCase();
        for (const unit of units) {
            if (lowerGoal.includes(unit)) {
                return unit;
            }
        }
        return null;
    }

    // Métodos para obtener datos para estadísticas
    getHabits() {
        return this.habits;
    }
}

