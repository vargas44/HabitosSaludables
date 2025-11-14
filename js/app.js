// HabitFlow - Aplicación de seguimiento de hábitos saludables
class HabitFlow {
    constructor() {
        this.habits = this.loadHabits();
        this.currentPage = 'dashboard';
        this.darkMode = this.loadTheme();
        this.quotes = [
            { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
            { text: "Los hábitos son la base de la excelencia.", author: "Aristóteles" },
            { text: "La constancia es la madre del éxito.", author: "Proverbio" },
            { text: "Pequeños cambios, grandes resultados.", author: "Anónimo" },
            { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDate();
        this.applyTheme();
        this.renderDashboard();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // New habit button
        document.getElementById('new-habit-btn').addEventListener('click', () => {
            this.showNewHabitModal();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideNewHabitModal();
        });

        document.getElementById('cancel-habit').addEventListener('click', () => {
            this.hideNewHabitModal();
        });

        // New habit form
        document.getElementById('new-habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createHabit();
        });

        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        document.getElementById('mobile-menu-overlay').addEventListener('click', () => {
            this.hideMobileMenu();
        });
    }

    setupMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-menu-overlay');
        
        // Close mobile menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.hideMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-menu-overlay');
        
        sidebar.classList.toggle('hidden');
        overlay.classList.toggle('hidden');
    }

    hideMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-menu-overlay');
        
        sidebar.classList.add('hidden');
        overlay.classList.add('hidden');
    }

    navigateTo(page) {
        this.currentPage = page;
        this.updateNavigation();
        
        switch(page) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'habits':
                this.renderHabitsPage();
                break;
            case 'calendar':
                this.renderCalendarPage();
                break;
            case 'progress':
                this.renderProgressPage();
                break;
            case 'reports':
                this.renderReportsPage();
                break;
            case 'profile':
                this.renderProfilePage();
                break;
            case 'settings':
                this.renderSettingsPage();
                break;
        }
    }

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-gray-900', 'text-white', 'dark:bg-gray-700');
            link.classList.add('text-text-secondary-light', 'dark:text-text-secondary-dark', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
        });

        const activeLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-text-secondary-light', 'dark:text-text-secondary-dark', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
            activeLink.classList.add('bg-gray-900', 'text-white', 'dark:bg-gray-700');
        }
    }

    renderDashboard() {
        this.updateStats();
        this.renderTodayProgress();
        this.renderWeeklyCalendar();
        this.renderDashboardCalendar();
        this.updateGeneralProgress();
        this.updateMotivationalQuote();
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.habits.filter(habit => 
            habit.completions && habit.completions[today]
        ).length;
        
        const totalHabits = this.habits.length;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        
        // Calculate streak average
        const streakAverage = this.calculateStreakAverage();
        
        // Calculate active days this month
        const activeDays = this.calculateActiveDays();
        
        document.getElementById('completed-habits').textContent = `${completedToday}/${totalHabits}`;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        document.getElementById('streak-average').textContent = streakAverage;
        document.getElementById('active-days').textContent = activeDays;
    }

    renderTodayProgress() {
        const container = document.getElementById('today-progress');
        container.innerHTML = '';
        
        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark">
                    <span class="material-icons-outlined text-4xl mb-2">add_circle_outline</span>
                    <p>No tienes hábitos creados aún</p>
                    <button class="mt-2 text-primary hover:underline" onclick="app.showNewHabitModal()">
                        Crear mi primer hábito
                    </button>
                </div>
            `;
            return;
        }

        this.habits.forEach(habit => {
            const today = new Date().toISOString().split('T')[0];
            const isCompleted = habit.completions && habit.completions[today];
            const progress = this.calculateHabitProgress(habit);
            
            const habitElement = document.createElement('div');
            habitElement.className = 'flex items-center';
            habitElement.innerHTML = `
                <div class="bg-${habit.color}-100 dark:bg-${habit.color}-900 p-3 rounded-lg mr-4">
                    <span class="material-icons-outlined text-${habit.color}-600 dark:text-${habit.color}-400">${habit.icon}</span>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-text-light dark:text-text-dark">${habit.name}</p>
                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">${habit.goal}</p>
                </div>
                <div class="text-sm font-medium text-text-light dark:text-text-dark mr-4">${progress}%</div>
                <button class="habit-toggle text-text-secondary-light dark:text-text-secondary-dark ${isCompleted ? 'text-green-500' : ''}" data-habit-id="${habit.id}">
                    <span class="material-icons-outlined">${isCompleted ? 'check_circle' : 'radio_button_unchecked'}</span>
                </button>
            `;
            
            container.appendChild(habitElement);
        });

        // Add event listeners for habit toggles
        container.querySelectorAll('.habit-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.toggleHabitCompletion(habitId);
            });
        });
    }

    renderWeeklyCalendar() {
        const container = document.getElementById('weekly-calendar');
        const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        
        container.innerHTML = '';
        
        let completedDays = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const isCompleted = this.habits.length > 0 && this.habits.every(habit => 
                habit.completions && habit.completions[dateStr]
            );
            
            if (isCompleted) completedDays++;
            
            const dayElement = document.createElement('div');
            dayElement.className = `w-9 h-9 flex items-center justify-center rounded-lg text-text-light dark:text-text-dark ${
                isCompleted ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-gray-200 dark:bg-gray-600'
            }`;
            dayElement.textContent = days[i];
            container.appendChild(dayElement);
        }
        
        document.getElementById('weekly-progress').textContent = `${completedDays}/7 días completados`;
    }

    renderDashboardCalendar() {
        const container = document.getElementById('dashboard-calendar-grid');
        if (!container) return;
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        container.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'text-center text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark py-2';
            header.textContent = day;
            container.appendChild(header);
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const empty = document.createElement('div');
            empty.className = 'h-8';
            container.appendChild(empty);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            
            // Check if all habits were completed on this day
            const allCompleted = this.habits.length > 0 && this.habits.every(habit => 
                habit.completions && habit.completions[dateStr]
            );
            
            // Check if some habits were completed
            const someCompleted = this.habits.length > 0 && this.habits.some(habit => 
                habit.completions && habit.completions[dateStr]
            );
            
            const dayElement = document.createElement('div');
            dayElement.className = `h-8 flex items-center justify-center text-sm rounded cursor-pointer transition-colors ${
                isToday ? 'bg-primary text-white font-bold' : 
                allCompleted ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' :
                someCompleted ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800' :
                'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'
            }`;
            dayElement.textContent = day;
            dayElement.title = `${day}/${month + 1}/${year} - ${allCompleted ? 'Todos los hábitos completados' : someCompleted ? 'Algunos hábitos completados' : 'Sin hábitos completados'}`;
            container.appendChild(dayElement);
        }
    }

    updateGeneralProgress() {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.habits.filter(habit => 
            habit.completions && habit.completions[today]
        ).length;
        
        const totalHabits = this.habits.length;
        const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        
        document.getElementById('general-progress').textContent = `${percentage}%`;
        document.getElementById('habits-summary').textContent = `${completedToday} de ${totalHabits} hábitos`;
        
        // Update progress circle
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 15.9155;
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }

    updateMotivationalQuote() {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.getElementById('motivational-quote').textContent = randomQuote.text;
        document.getElementById('quote-author').textContent = `- ${randomQuote.author}`;
    }

    showNewHabitModal() {
        document.getElementById('new-habit-modal').classList.remove('hidden');
    }

    hideNewHabitModal() {
        document.getElementById('new-habit-modal').classList.add('hidden');
        document.getElementById('new-habit-form').reset();
    }

    createHabit() {
        const name = document.getElementById('habit-name').value;
        const category = document.getElementById('habit-category').value;
        const goal = document.getElementById('habit-goal').value;
        
        const habit = {
            id: Date.now().toString(),
            name: name,
            category: category,
            goal: goal,
            icon: this.getCategoryIcon(category),
            color: this.getCategoryColor(category),
            completions: {},
            createdAt: new Date().toISOString()
        };
        
        this.habits.push(habit);
        this.saveHabits();
        this.hideNewHabitModal();
        this.renderDashboard();
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
        this.renderDashboard();
    }

    calculateHabitProgress(habit) {
        const today = new Date().toISOString().split('T')[0];
        return habit.completions && habit.completions[today] ? 100 : 0;
    }

    calculateStreakAverage() {
        if (this.habits.length === 0) return 0;
        
        let totalStreaks = 0;
        this.habits.forEach(habit => {
            totalStreaks += this.calculateHabitStreak(habit);
        });
        
        return Math.round(totalStreaks / this.habits.length);
    }

    calculateHabitStreak(habit) {
        if (!habit.completions) return 0;
        
        const dates = Object.keys(habit.completions).sort().reverse();
        let streak = 0;
        let currentDate = new Date();
        
        for (let i = 0; i < dates.length; i++) {
            const date = new Date(dates[i]);
            const diffTime = currentDate - date;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak + 1) {
                streak++;
                currentDate = date;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateActiveDays() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        let activeDays = new Set();
        
        this.habits.forEach(habit => {
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

    renderHabitsPage() {
        const container = document.getElementById('other-pages');
        container.innerHTML = `
            <div class="page p-8">
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">Mis Hábitos</h1>
                        <p class="text-text-secondary-light dark:text-text-secondary-dark">Gestiona tus hábitos diarios</p>
                    </div>
                    <button id="new-habit-btn-2" class="bg-gray-800 text-white dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span class="material-icons-outlined text-base">add</span>
                        <span>Nuevo Hábito</span>
                    </button>
                </header>
                
                <!-- Stats Overview -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg text-center">
                        <div class="text-2xl font-bold text-text-light dark:text-text-dark" id="total-habits">${this.habits.length}</div>
                        <div class="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total de Hábitos</div>
                    </div>
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg text-center">
                        <div class="text-2xl font-bold text-text-light dark:text-text-dark" id="active-habits">${this.habits.length}</div>
                        <div class="text-sm text-text-secondary-light dark:text-text-secondary-dark">Hábitos Activos</div>
                    </div>
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg text-center">
                        <div class="text-2xl font-bold text-text-light dark:text-text-dark" id="avg-streak">${this.calculateStreakAverage()}</div>
                        <div class="text-sm text-text-secondary-light dark:text-text-secondary-dark">Racha Promedio</div>
                    </div>
                </div>
                
                <!-- Filter and Search -->
                <div class="bg-card-light dark:bg-card-dark p-4 rounded-lg mb-6">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <input type="text" id="habit-search" placeholder="Buscar hábitos..." class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                        </div>
                        <div class="flex gap-2">
                            <select id="category-filter" class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                <option value="">Todas las categorías</option>
                                <option value="salud">Salud</option>
                                <option value="ejercicio">Ejercicio</option>
                                <option value="alimentacion">Alimentación</option>
                                <option value="mental">Mental</option>
                                <option value="productividad">Productividad</option>
                            </select>
                            <select id="sort-habits" class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                <option value="name">Ordenar por nombre</option>
                                <option value="streak">Ordenar por racha</option>
                                <option value="completion">Ordenar por cumplimiento</option>
                                <option value="created">Ordenar por fecha</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div id="habits-list" class="space-y-4">
                    <!-- Habits will be loaded here -->
                </div>
            </div>
        `;
        
        this.renderHabitsList();
        this.setupHabitsFilters();
        
        // Add event listener for new habit button
        document.getElementById('new-habit-btn-2').addEventListener('click', () => {
            this.showNewHabitModal();
        });
    }

    renderHabitsList() {
        const container = document.getElementById('habits-list');
        container.innerHTML = '';
        
        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-text-secondary-light dark:text-text-secondary-dark">
                    <span class="material-icons-outlined text-6xl mb-4">checklist</span>
                    <h3 class="text-xl font-semibold mb-2">No tienes hábitos creados</h3>
                    <p class="mb-4">Comienza creando tu primer hábito saludable</p>
                    <button class="bg-primary text-white px-6 py-3 rounded-lg" onclick="app.showNewHabitModal()">
                        Crear Hábito
                    </button>
                </div>
            `;
            return;
        }
        
        // Get filtered and sorted habits
        const filteredHabits = this.getFilteredHabits();
        
        filteredHabits.forEach(habit => {
            const streak = this.calculateHabitStreak(habit);
            const completionRate = this.calculateHabitCompletionRate(habit);
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.completions && habit.completions[today];
            
            const habitElement = document.createElement('div');
            habitElement.className = 'bg-card-light dark:bg-card-dark p-6 rounded-lg';
            habitElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1">
                        <div class="bg-${habit.color}-100 dark:bg-${habit.color}-900 p-3 rounded-lg mr-4">
                            <span class="material-icons-outlined text-${habit.color}-600 dark:text-${habit.color}-400">${habit.icon}</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="font-semibold text-text-light dark:text-text-dark">${habit.name}</h3>
                                <span class="text-xs px-2 py-1 rounded-full bg-${habit.color}-100 dark:bg-${habit.color}-900 text-${habit.color}-600 dark:text-${habit.color}-400 capitalize">${habit.category}</span>
                            </div>
                            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">${habit.goal}</p>
                            
                            <!-- Progress Bar -->
                            <div class="mb-3">
                                <div class="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                                    <span>Progreso</span>
                                    <span>${completionRate}%</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-${habit.color}-500 h-2 rounded-full" style="width: ${completionRate}%"></div>
                                </div>
                            </div>
                            
                            <!-- Stats -->
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center space-x-4">
                                    <span class="text-text-secondary-light dark:text-text-secondary-dark">
                                        <span class="material-icons-outlined text-sm mr-1">local_fire_department</span>
                                        ${streak} días
                                    </span>
                                    <span class="text-text-secondary-light dark:text-text-secondary-dark">
                                        <span class="material-icons-outlined text-sm mr-1">check_circle</span>
                                        ${completionRate}%
                                    </span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="habit-toggle-today text-${isCompletedToday ? 'green' : 'gray'}-500 hover:text-${isCompletedToday ? 'green' : 'gray'}-700" data-habit-id="${habit.id}" title="${isCompletedToday ? 'Marcar como no completado' : 'Marcar como completado'}">
                                        <span class="material-icons-outlined">${isCompletedToday ? 'check_circle' : 'radio_button_unchecked'}</span>
                                    </button>
                                    <button class="edit-habit text-text-secondary-light dark:text-text-secondary-dark hover:text-primary" data-habit-id="${habit.id}" title="Editar hábito">
                                        <span class="material-icons-outlined">edit</span>
                                    </button>
                                    <button class="delete-habit text-red-500 hover:text-red-700" data-habit-id="${habit.id}" title="Eliminar hábito">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(habitElement);
        });
        
        // Add event listeners
        container.querySelectorAll('.edit-habit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.editHabit(habitId);
            });
        });
        
        container.querySelectorAll('.delete-habit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.deleteHabit(habitId);
            });
        });
        
        container.querySelectorAll('.habit-toggle-today').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.habitId;
                this.toggleHabitCompletion(habitId);
            });
        });
    }

    calculateHabitCompletionRate(habit) {
        if (!habit.completions) return 0;
        
        const totalDays = Object.keys(habit.completions).length;
        const completedDays = Object.values(habit.completions).filter(Boolean).length;
        
        return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    }

    setupHabitsFilters() {
        const searchInput = document.getElementById('habit-search');
        const categoryFilter = document.getElementById('category-filter');
        const sortSelect = document.getElementById('sort-habits');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderHabitsList();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.renderHabitsList();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.renderHabitsList();
            });
        }
    }

    getFilteredHabits() {
        let filteredHabits = [...this.habits];
        
        // Search filter
        const searchTerm = document.getElementById('habit-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filteredHabits = filteredHabits.filter(habit => 
                habit.name.toLowerCase().includes(searchTerm) ||
                habit.goal.toLowerCase().includes(searchTerm) ||
                habit.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        if (categoryFilter) {
            filteredHabits = filteredHabits.filter(habit => habit.category === categoryFilter);
        }
        
        // Sort
        const sortBy = document.getElementById('sort-habits')?.value || 'name';
        filteredHabits.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'streak':
                    return this.calculateHabitStreak(b) - this.calculateHabitStreak(a);
                case 'completion':
                    return this.calculateHabitCompletionRate(b) - this.calculateHabitCompletionRate(a);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
        
        return filteredHabits;
    }

    deleteHabit(habitId) {
        if (confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.renderHabitsList();
            // Update dashboard if we're on habits page
            if (this.currentPage === 'habits') {
                this.renderDashboard();
            }
        }
    }

    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-card-light dark:bg-card-dark rounded-lg p-6 w-full max-w-md">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-text-light dark:text-text-dark">Editar Hábito</h3>
                    <button id="close-edit-modal" class="text-text-secondary-light dark:text-text-secondary-dark">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <form id="edit-habit-form">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Nombre del hábito</label>
                        <input type="text" id="edit-habit-name" value="${habit.name}" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Categoría</label>
                        <select id="edit-habit-category" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                            <option value="salud" ${habit.category === 'salud' ? 'selected' : ''}>Salud</option>
                            <option value="ejercicio" ${habit.category === 'ejercicio' ? 'selected' : ''}>Ejercicio</option>
                            <option value="alimentacion" ${habit.category === 'alimentacion' ? 'selected' : ''}>Alimentación</option>
                            <option value="mental" ${habit.category === 'mental' ? 'selected' : ''}>Mental</option>
                            <option value="productividad" ${habit.category === 'productividad' ? 'selected' : ''}>Productividad</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Meta diaria</label>
                        <input type="text" id="edit-habit-goal" value="${habit.goal}" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" id="cancel-edit-habit" class="px-4 py-2 text-text-secondary-light dark:text-text-secondary-dark">Cancelar</button>
                        <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancel-edit-habit').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('edit-habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('edit-habit-name').value.trim();
            const category = document.getElementById('edit-habit-category').value;
            const goal = document.getElementById('edit-habit-goal').value.trim();
            
            if (name) {
                habit.name = name;
                habit.category = category;
                habit.goal = goal;
                habit.icon = this.getCategoryIcon(category);
                habit.color = this.getCategoryColor(category);
                
                this.saveHabits();
                this.renderHabitsList();
                this.renderDashboard();
                document.body.removeChild(modal);
            }
        });
    }

    renderCalendarPage() {
        const container = document.getElementById('other-pages');
        container.innerHTML = `
            <div class="page p-8">
                <header class="mb-8">
                    <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">Calendario</h1>
                    <p class="text-text-secondary-light dark:text-text-secondary-dark">Visualiza tu progreso mensual</p>
                </header>
                
                <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2">
                        <!-- Calendar will be generated here -->
                    </div>
                </div>
            </div>
        `;
        
        this.renderCalendar();
    }

    renderCalendar() {
        const container = document.getElementById('calendar-grid');
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        container.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'text-center text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark py-2';
            header.textContent = day;
            container.appendChild(header);
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const empty = document.createElement('div');
            empty.className = 'h-8';
            container.appendChild(empty);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            
            // Check if all habits were completed on this day
            const allCompleted = this.habits.length > 0 && this.habits.every(habit => 
                habit.completions && habit.completions[dateStr]
            );
            
            const dayElement = document.createElement('div');
            dayElement.className = `h-8 flex items-center justify-center text-sm rounded ${
                isToday ? 'bg-primary text-white font-bold' : 
                allCompleted ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'
            }`;
            dayElement.textContent = day;
            container.appendChild(dayElement);
        }
    }

    renderProgressPage() {
        const container = document.getElementById('other-pages');
        container.innerHTML = `
            <div class="page p-8">
                <header class="mb-8">
                    <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">Progreso</h1>
                    <p class="text-text-secondary-light dark:text-text-secondary-dark">Analiza tu evolución</p>
                </header>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Estadísticas Generales</h2>
                        <div id="progress-stats">
                            <!-- Stats will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Hábitos por Categoría</h2>
                        <div id="category-stats">
                            <!-- Category stats will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderProgressStats();
    }

    renderProgressStats() {
        const statsContainer = document.getElementById('progress-stats');
        const categoryContainer = document.getElementById('category-stats');
        
        // General stats
        const totalHabits = this.habits.length;
        const totalCompletions = this.habits.reduce((sum, habit) => {
            return sum + (habit.completions ? Object.keys(habit.completions).length : 0);
        }, 0);
        
        const averageStreak = this.calculateStreakAverage();
        const bestStreak = Math.max(...this.habits.map(h => this.calculateHabitStreak(h)));
        
        statsContainer.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between">
                    <span class="text-text-secondary-light dark:text-text-secondary-dark">Total de hábitos:</span>
                    <span class="font-semibold text-text-light dark:text-text-dark">${totalHabits}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-text-secondary-light dark:text-text-secondary-dark">Completaciones totales:</span>
                    <span class="font-semibold text-text-light dark:text-text-dark">${totalCompletions}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-text-secondary-light dark:text-text-secondary-dark">Racha promedio:</span>
                    <span class="font-semibold text-text-light dark:text-text-dark">${averageStreak} días</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-text-secondary-light dark:text-text-secondary-dark">Mejor racha:</span>
                    <span class="font-semibold text-text-light dark:text-text-dark">${bestStreak} días</span>
                </div>
            </div>
        `;
        
        // Category stats
        const categories = {};
        this.habits.forEach(habit => {
            if (!categories[habit.category]) {
                categories[habit.category] = { count: 0, completions: 0 };
            }
            categories[habit.category].count++;
            if (habit.completions) {
                categories[habit.category].completions += Object.keys(habit.completions).length;
            }
        });
        
        categoryContainer.innerHTML = Object.keys(categories).map(category => {
            const stats = categories[category];
            const completionRate = stats.count > 0 ? Math.round((stats.completions / stats.count) * 100) : 0;
            
            return `
                <div class="flex justify-between items-center mb-3">
                    <span class="text-text-light dark:text-text-dark capitalize">${category}</span>
                    <div class="text-right">
                        <div class="font-semibold text-text-light dark:text-text-dark">${stats.count} hábitos</div>
                        <div class="text-sm text-text-secondary-light dark:text-text-secondary-dark">${completionRate}% cumplimiento</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderReportsPage() {
        const container = document.getElementById('other-pages');
        container.innerHTML = `
            <div class="page p-8">
                <header class="mb-8">
                    <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">Reportes</h1>
                    <p class="text-text-secondary-light dark:text-text-secondary-dark">Análisis detallado de tu progreso</p>
                </header>
                
                <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                    <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Resumen de Actividad</h2>
                    <div id="activity-summary">
                        <!-- Activity summary will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        this.renderActivitySummary();
    }

    renderActivitySummary() {
        const container = document.getElementById('activity-summary');
        
        // Calculate activity for the last 30 days
        const last30Days = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const completedHabits = this.habits.filter(habit => 
                habit.completions && habit.completions[dateStr]
            ).length;
            
            last30Days.push({
                date: dateStr,
                completed: completedHabits,
                total: this.habits.length
            });
        }
        
        container.innerHTML = `
            <div class="space-y-4">
                <div class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                    Actividad de los últimos 30 días
                </div>
                <div class="grid grid-cols-10 gap-1">
                    ${last30Days.map(day => {
                        const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                        const intensity = Math.round(percentage / 20);
                        return `
                            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" 
                                 style="background-color: ${intensity > 0 ? `hsl(120, ${intensity * 20}%, 50%)` : ''}"
                                 title="${day.date}: ${day.completed}/${day.total} hábitos">
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    <span>Menos activo</span>
                    <span>Más activo</span>
                </div>
            </div>
        `;
    }

    renderProfilePage() {
        const container = document.getElementById('other-pages');
        
        // Load profile data
        const profileData = this.loadProfileData();
        const currentTime = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: profileData.timezone || 'America/Mexico_City'
        });
        
        container.innerHTML = `
            <div class="page p-8">
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">Mi Perfil</h1>
                        <p class="text-text-secondary-light dark:text-text-secondary-dark">Gestiona tu información personal</p>
                    </div>
                    <button id="edit-profile-btn" class="bg-gray-800 text-white dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span class="material-icons-outlined text-base">edit</span>
                        <span>Editar</span>
                    </button>
                </header>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Información Personal -->
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <div class="flex items-start space-x-4 mb-6">
                            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span class="material-icons-outlined text-2xl text-text-secondary-light dark:text-text-secondary-dark">person</span>
                            </div>
                            <div class="flex-1">
                                <h2 class="text-xl font-semibold text-text-light dark:text-text-dark mb-2">${profileData.fullName || 'Usuario Test'}</h2>
                                <p class="text-text-secondary-light dark:text-text-secondary-dark mb-4">${profileData.biography || 'Usuario de prueba para testing de la aplicación HabitFlow'}</p>
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span class="text-text-secondary-light dark:text-text-secondary-dark">Correo electrónico:</span>
                                        <p class="font-medium text-text-light dark:text-text-dark">${profileData.email || 'test@habitflow.com'}</p>
                                    </div>
                                    <div>
                                        <span class="text-text-secondary-light dark:text-text-secondary-dark">Miembro desde:</span>
                                        <p class="font-medium text-text-light dark:text-text-dark">4 de octubre de 2025</p>
                                    </div>
                                    <div>
                                        <span class="text-text-secondary-light dark:text-text-secondary-dark">Zona horaria:</span>
                                        <p class="font-medium text-text-light dark:text-text-dark">${this.getTimezoneDisplay(profileData.timezone)}</p>
                                    </div>
                                    <div>
                                        <span class="text-text-secondary-light dark:text-text-secondary-dark">Hora local:</span>
                                        <p class="font-medium text-text-light dark:text-text-dark">${currentTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="text-sm font-medium text-text-light dark:text-text-dark mb-3">Objetivos personales</h3>
                            <div class="flex flex-wrap gap-2">
                                ${this.renderGoals(profileData.goals)}
                            </div>
                        </div>
                    </div>

                    <!-- Estadísticas -->
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark flex items-center">
                            <span class="material-icons-outlined mr-2">bar_chart</span>
                            Estadísticas
                        </h2>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">checklist</span>
                                    <span class="text-text-light dark:text-text-dark">Hábitos totales</span>
                                </div>
                                <span class="font-semibold text-text-light dark:text-text-dark">${this.habits.length}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">calendar_today</span>
                                    <span class="text-text-light dark:text-text-dark">Completados hoy</span>
                                </div>
                                <span class="font-semibold text-text-light dark:text-text-dark">${this.getCompletedToday()}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">local_fire_department</span>
                                    <span class="text-text-light dark:text-text-dark">Racha actual</span>
                                </div>
                                <span class="font-semibold text-text-light dark:text-text-dark">${this.getCurrentStreak()} días</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">trending_up</span>
                                    <span class="text-text-light dark:text-text-dark">Mejor racha</span>
                                </div>
                                <span class="font-semibold text-text-light dark:text-text-dark">${this.getBestStreak()} días</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">person</span>
                                    <span class="text-text-light dark:text-text-dark">Días activos</span>
                                </div>
                                <span class="font-semibold text-text-light dark:text-text-dark">${this.getActiveDays()}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Logros -->
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Logros</h2>
                        <div class="space-y-3">
                            <div class="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <span class="material-icons-outlined text-green-500 mr-3">check_circle</span>
                                <div>
                                    <h3 class="font-medium text-text-light dark:text-text-dark">Primer Hábito</h3>
                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">Completaste tu primer hábito</p>
                                </div>
                            </div>
                            <div class="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">radio_button_unchecked</span>
                                <div>
                                    <h3 class="font-medium text-text-light dark:text-text-dark">Semana Perfecta</h3>
                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">7 días consecutivos</p>
                                </div>
                            </div>
                            <div class="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">radio_button_unchecked</span>
                                <div>
                                    <h3 class="font-medium text-text-light dark:text-text-dark">Mes Consistente</h3>
                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">30 días de actividad</p>
                                </div>
                            </div>
                            <div class="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <span class="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mr-3">radio_button_unchecked</span>
                                <div>
                                    <h3 class="font-medium text-text-light dark:text-text-dark">Maestro de Hábitos</h3>
                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">10 hábitos activos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Resumen del Mes -->
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Resumen del Mes</h2>
                        <div class="text-center mb-4">
                            <div class="text-4xl font-bold text-text-light dark:text-text-dark mb-2">${this.getMonthlyCompletionRate()}%</div>
                            <p class="text-text-secondary-light dark:text-text-secondary-dark">Tasa de cumplimiento</p>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-text-secondary-light dark:text-text-secondary-dark">Días perfectos:</span>
                                <span class="font-medium text-text-light dark:text-text-dark">${this.getPerfectDays()}/31</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-text-secondary-light dark:text-text-secondary-dark">Hábitos completados:</span>
                                <span class="font-medium text-text-light dark:text-text-dark">${this.getTotalCompletions()}/${this.getTotalPossibleCompletions()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-text-secondary-light dark:text-text-secondary-dark">Mejor día:</span>
                                <span class="font-medium text-text-light dark:text-text-dark">${this.getBestDay()}% (hoy)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg lg:col-span-2">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Acciones</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button id="export-profile-data" class="flex items-center justify-center p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span class="material-icons-outlined mr-2 text-text-secondary-light dark:text-text-secondary-dark">download</span>
                                <span class="text-text-light dark:text-text-dark">Exportar Datos</span>
                            </button>
                            <button id="logout-profile" class="flex items-center justify-center p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span class="material-icons-outlined mr-2 text-text-secondary-light dark:text-text-secondary-dark">logout</span>
                                <span class="text-text-light dark:text-text-dark">Cerrar Sesión</span>
                            </button>
                            <button id="delete-account" class="flex items-center justify-center p-4 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                <span class="material-icons-outlined mr-2">delete</span>
                                <span>Eliminar Cuenta</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showEditProfileModal();
        });
        
        document.getElementById('export-profile-data').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('logout-profile').addEventListener('click', () => {
            this.logout();
        });
        
        document.getElementById('delete-account').addEventListener('click', () => {
            this.deleteAccount();
        });
    }

    renderSettingsPage() {
        const container = document.getElementById('other-pages');
        container.innerHTML = `
            <div class="page p-8">
                <header class="mb-8">
                    <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">Configuración</h1>
                    <p class="text-text-secondary-light dark:text-text-secondary-dark">Personaliza tu experiencia</p>
                </header>
                
                <div class="space-y-6">
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Apariencia</h2>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-text-light dark:text-text-dark">Modo Oscuro</h3>
                                <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">Cambia entre tema claro y oscuro</p>
                            </div>
                            <button id="theme-toggle-settings" class="bg-primary text-white px-4 py-2 rounded-lg">
                                ${this.darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-card-light dark:bg-card-dark p-6 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Datos</h2>
                        <div class="space-y-4">
                            <button id="export-data" class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg">
                                Exportar Datos
                            </button>
                            <button id="import-data" class="w-full bg-green-500 text-white px-4 py-2 rounded-lg">
                                Importar Datos
                            </button>
                            <button id="clear-data" class="w-full bg-red-500 text-white px-4 py-2 rounded-lg">
                                Limpiar Todos los Datos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for settings
        document.getElementById('theme-toggle-settings').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });
        
        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearData();
        });
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateStr = now.toLocaleDateString('es-ES', options);
        document.getElementById('current-date').textContent = dateStr;
    }

    loadHabits() {
        const stored = localStorage.getItem('habitflow-habits');
        return stored ? JSON.parse(stored) : [];
    }

    saveHabits() {
        localStorage.setItem('habitflow-habits', JSON.stringify(this.habits));
    }

    loadTheme() {
        const stored = localStorage.getItem('habitflow-theme');
        return stored === 'dark';
    }

    saveTheme() {
        localStorage.setItem('habitflow-theme', this.darkMode ? 'dark' : 'light');
    }

    exportData() {
        const data = {
            habits: this.habits,
            exportDate: new Date().toISOString(),
            version: '1.3'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habitflow-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.habits && Array.isArray(data.habits)) {
                            this.habits = data.habits;
                            this.saveHabits();
                            this.renderDashboard();
                            alert('Datos importados correctamente');
                        } else {
                            alert('Archivo de datos inválido');
                        }
                    } catch (error) {
                        alert('Error al importar datos');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('habitflow-habits');
            this.habits = [];
            this.renderDashboard();
            alert('Todos los datos han sido eliminados');
        }
    }

    // Profile page helper functions
    getCompletedToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.habits.filter(habit => 
            habit.completions && habit.completions[today]
        ).length;
    }

    getCurrentStreak() {
        if (this.habits.length === 0) return 0;
        
        let maxStreak = 0;
        this.habits.forEach(habit => {
            const streak = this.calculateHabitStreak(habit);
            maxStreak = Math.max(maxStreak, streak);
        });
        
        return maxStreak;
    }

    getBestStreak() {
        if (this.habits.length === 0) return 0;
        
        let bestStreak = 0;
        this.habits.forEach(habit => {
            const streak = this.calculateHabitStreak(habit);
            bestStreak = Math.max(bestStreak, streak);
        });
        
        return bestStreak;
    }

    getActiveDays() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        let activeDays = new Set();
        
        this.habits.forEach(habit => {
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

    getMonthlyCompletionRate() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
        
        let totalPossible = this.habits.length * daysInMonth;
        let totalCompleted = 0;
        
        this.habits.forEach(habit => {
            if (habit.completions) {
                Object.keys(habit.completions).forEach(dateStr => {
                    const date = new Date(dateStr);
                    if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
                        totalCompleted++;
                    }
                });
            }
        });
        
        return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    }

    getPerfectDays() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
        
        let perfectDays = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(thisYear, thisMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            
            const allCompleted = this.habits.length > 0 && this.habits.every(habit => 
                habit.completions && habit.completions[dateStr]
            );
            
            if (allCompleted) perfectDays++;
        }
        
        return perfectDays;
    }

    getTotalCompletions() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        let totalCompleted = 0;
        
        this.habits.forEach(habit => {
            if (habit.completions) {
                Object.keys(habit.completions).forEach(dateStr => {
                    const date = new Date(dateStr);
                    if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
                        totalCompleted++;
                    }
                });
            }
        });
        
        return totalCompleted;
    }

    getTotalPossibleCompletions() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
        
        return this.habits.length * daysInMonth;
    }

    getBestDay() {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.getCompletedToday();
        const totalHabits = this.habits.length;
        
        return totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    }

    showEditProfileModal() {
        // Create comprehensive edit modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-card-light dark:bg-card-dark rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-text-light dark:text-text-dark">Editar Perfil</h3>
                    <button id="close-edit-profile-modal" class="text-text-secondary-light dark:text-text-secondary-dark">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                
                <form id="edit-profile-form" class="space-y-6">
                    <!-- Información Básica -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Nombre completo</label>
                            <input type="text" id="edit-full-name" value="Usuario Test" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Correo electrónico</label>
                            <input type="email" id="edit-email" value="test@habitflow.com" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Biografía</label>
                        <textarea id="edit-biography" rows="3" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark" placeholder="Cuéntanos sobre ti...">Usuario de prueba para testing de la aplicación HabitFlow</textarea>
                    </div>
                    
                    <!-- Zona Horaria -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Zona horaria</label>
                            <select id="edit-timezone" class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                <option value="America/New_York">Nueva York (GMT-5)</option>
                                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                <option value="Europe/London">Londres (GMT+0)</option>
                                <option value="Asia/Tokyo">Tokio (GMT+9)</option>
                                <option value="Australia/Sydney">Sídney (GMT+10)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Hora actual</label>
                            <div class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark" id="current-time-display">
                                ${new Date().toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    timeZone: 'America/Mexico_City'
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Objetivos Personales -->
                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-3">Objetivos personales</label>
                        <div id="goals-container" class="space-y-3">
                            <div class="flex items-center space-x-2">
                                <input type="text" value="Mejor salud" class="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                <select class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                    <option value="blue">Azul</option>
                                    <option value="green">Verde</option>
                                    <option value="purple">Púrpura</option>
                                    <option value="red">Rojo</option>
                                    <option value="yellow">Amarillo</option>
                                </select>
                                <button type="button" class="remove-goal text-red-500 hover:text-red-700">
                                    <span class="material-icons-outlined">delete</span>
                                </button>
                            </div>
                            <div class="flex items-center space-x-2">
                                <input type="text" value="Más productividad" class="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                <select class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                    <option value="green" selected>Verde</option>
                                    <option value="blue">Azul</option>
                                    <option value="purple">Púrpura</option>
                                    <option value="red">Rojo</option>
                                    <option value="yellow">Amarillo</option>
                                </select>
                                <button type="button" class="remove-goal text-red-500 hover:text-red-700">
                                    <span class="material-icons-outlined">delete</span>
                                </button>
                            </div>
                            <div class="flex items-center space-x-2">
                                <input type="text" value="Bienestar mental" class="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                <select class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                                    <option value="purple" selected>Púrpura</option>
                                    <option value="blue">Azul</option>
                                    <option value="green">Verde</option>
                                    <option value="red">Rojo</option>
                                    <option value="yellow">Amarillo</option>
                                </select>
                                <button type="button" class="remove-goal text-red-500 hover:text-red-700">
                                    <span class="material-icons-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                        <button type="button" id="add-goal" class="mt-2 text-primary hover:underline flex items-center">
                            <span class="material-icons-outlined text-sm mr-1">add</span>
                            Agregar objetivo
                        </button>
                    </div>
                    
                    <!-- Botones de Acción -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-border-light dark:border-border-dark">
                        <button type="button" id="cancel-edit-profile" class="px-4 py-2 text-text-secondary-light dark:text-text-secondary-dark">Cancelar</button>
                        <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-edit-profile-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancel-edit-profile').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Add goal functionality
        document.getElementById('add-goal').addEventListener('click', () => {
            this.addGoalRow(modal);
        });
        
        // Remove goal functionality
        modal.querySelectorAll('.remove-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.currentTarget.parentElement.remove();
            });
        });
        
        // Timezone change handler
        document.getElementById('edit-timezone').addEventListener('change', (e) => {
            const timezone = e.target.value;
            const currentTime = new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: timezone
            });
            document.getElementById('current-time-display').textContent = currentTime;
        });
        
        // Form submission
        document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfileChanges(modal);
        });
    }

    addGoalRow(modal) {
        const container = modal.querySelector('#goals-container');
        const goalRow = document.createElement('div');
        goalRow.className = 'flex items-center space-x-2';
        goalRow.innerHTML = `
            <input type="text" placeholder="Nuevo objetivo" class="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
            <select class="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="purple">Púrpura</option>
                <option value="red">Rojo</option>
                <option value="yellow">Amarillo</option>
            </select>
            <button type="button" class="remove-goal text-red-500 hover:text-red-700">
                <span class="material-icons-outlined">delete</span>
            </button>
        `;
        
        container.appendChild(goalRow);
        
        // Add remove functionality to new row
        goalRow.querySelector('.remove-goal').addEventListener('click', (e) => {
            e.currentTarget.parentElement.remove();
        });
    }

    saveProfileChanges(modal) {
        const formData = {
            fullName: document.getElementById('edit-full-name').value,
            email: document.getElementById('edit-email').value,
            biography: document.getElementById('edit-biography').value,
            timezone: document.getElementById('edit-timezone').value,
            goals: []
        };
        
        // Collect goals
        modal.querySelectorAll('#goals-container > div').forEach(goalRow => {
            const text = goalRow.querySelector('input[type="text"]').value;
            const color = goalRow.querySelector('select').value;
            if (text.trim()) {
                formData.goals.push({ text: text.trim(), color: color });
            }
        });
        
        // Save to localStorage
        localStorage.setItem('habitflow-profile', JSON.stringify(formData));
        
        // Show success message
        alert('Perfil actualizado correctamente');
        
        // Close modal and refresh profile page
        document.body.removeChild(modal);
        this.renderProfilePage();
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // In a real app, this would clear session data
            alert('Sesión cerrada');
        }
    }

    deleteAccount() {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            if (confirm('Esta acción eliminará TODOS tus datos permanentemente. ¿Continuar?')) {
                localStorage.clear();
                this.habits = [];
                alert('Cuenta eliminada');
                location.reload();
            }
        }
    }

    // Profile data management
    loadProfileData() {
        const stored = localStorage.getItem('habitflow-profile');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Default profile data
        return {
            fullName: 'Usuario Test',
            email: 'test@habitflow.com',
            biography: 'Usuario de prueba para testing de la aplicación HabitFlow',
            timezone: 'America/Mexico_City',
            goals: [
                { text: 'Mejor salud', color: 'blue' },
                { text: 'Más productividad', color: 'green' },
                { text: 'Bienestar mental', color: 'purple' }
            ]
        };
    }

    getTimezoneDisplay(timezone) {
        const timezoneMap = {
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

    renderGoals(goals) {
        if (!goals || goals.length === 0) {
            return `
                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Mejor salud</span>
                <span class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">Más productividad</span>
                <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">Bienestar mental</span>
            `;
        }
        
        return goals.map(goal => {
            const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
                purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
                red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
                yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            };
            
            return `<span class="px-3 py-1 ${colorClasses[goal.color] || colorClasses.blue} rounded-full text-sm">${goal.text}</span>`;
        }).join('');
    }
}

// Initialize the app
const app = new HabitFlow();
