// Gestión de estadísticas para HabitFlow
class Statistics {
    constructor(habitsManager) {
        this.habitsManager = habitsManager;
        this.currentPeriod = 'day';
        this.charts = {};
    }

    async init() {
        // Esperar a que los hábitos se carguen
        if (this.habitsManager && typeof this.habitsManager.loadHabits === 'function') {
            await this.habitsManager.loadHabits();
        }
        
        this.setupEventListeners();
        await this.loadDayStats();
    }

    setupEventListeners() {
        // Botones de período
        document.getElementById('period-day').addEventListener('click', async () => {
            await this.switchPeriod('day');
        });

        document.getElementById('period-week').addEventListener('click', async () => {
            await this.switchPeriod('week');
        });

        document.getElementById('period-month').addEventListener('click', async () => {
            await this.switchPeriod('month');
        });
    }

    async switchPeriod(period) {
        this.currentPeriod = period;

        // Asegurar que los hábitos estén cargados
        if (this.habitsManager && typeof this.habitsManager.loadHabits === 'function') {
            await this.habitsManager.loadHabits();
        }

        // Actualizar botones
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
        });

        // Ocultar todas las secciones
        document.querySelectorAll('.stats-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar sección correspondiente
        if (period === 'day') {
            document.getElementById('period-day').classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
            document.getElementById('period-day').classList.add('bg-primary', 'text-white');
            document.getElementById('day-stats').classList.remove('hidden');
            await this.loadDayStats();
        } else if (period === 'week') {
            document.getElementById('period-week').classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
            document.getElementById('period-week').classList.add('bg-primary', 'text-white');
            document.getElementById('week-stats').classList.remove('hidden');
            await this.loadWeekStats();
        } else if (period === 'month') {
            document.getElementById('period-month').classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
            document.getElementById('period-month').classList.add('bg-primary', 'text-white');
            document.getElementById('month-stats').classList.remove('hidden');
            await this.loadMonthStats();
        }
    }

    async loadDayStats() {
        // Asegurar que los hábitos estén cargados
        if (this.habitsManager && typeof this.habitsManager.loadHabits === 'function') {
            await this.habitsManager.loadHabits();
        }
        
        const habits = this.habitsManager.getHabits();
        console.log('Estadísticas - Hábitos cargados:', habits.length);
        console.log('Estadísticas - Primer hábito:', habits[0] ? {
            id: habits[0].id,
            name: habits[0].name,
            completions: habits[0].completions,
            completionsKeys: habits[0].completions ? Object.keys(habits[0].completions) : []
        } : 'No hay hábitos');
        
        const today = new Date().toISOString().split('T')[0];
        console.log('Estadísticas - Fecha de hoy:', today);
        const todayDate = new Date();
        
        // Actualizar fecha
        document.getElementById('day-date').textContent = todayDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calcular estadísticas del día
        console.log('Estadísticas - Verificando completaciones para hoy:', today);
        const completedToday = habits.filter(habit => {
            const hasCompletions = habit.completions && typeof habit.completions === 'object';
            const isCompleted = hasCompletions && habit.completions[today];
            console.log(`Hábito ${habit.name}: completions existe=${hasCompletions}, completado hoy=${isCompleted}`, habit.completions);
            return isCompleted;
        }).length;
        console.log('Estadísticas - Hábitos completados hoy:', completedToday);

        const totalHabits = habits.length;
        const completionRate = totalHabits > 0
            ? Math.round((completedToday / totalHabits) * 100)
            : 0;

        // Categorías activas
        const activeCategories = new Set();
        habits.forEach(habit => {
            if (habit.completions && habit.completions[today]) {
                activeCategories.add(habit.category);
            }
        });

        // Actualizar UI
        document.getElementById('day-completed').textContent = completedToday;
        document.getElementById('day-rate').textContent = `${completionRate}%`;
        document.getElementById('day-categories').textContent = activeCategories.size;

        // Lista de hábitos completados
        const completedHabits = habits.filter(habit =>
            habit.completions && habit.completions[today]
        );

        const listContainer = document.getElementById('day-habits-list');
        if (completedHabits.length === 0) {
            listContainer.innerHTML = `
                <p class="text-text-secondary-light dark:text-text-secondary-dark text-center py-4">
                    No has completado ningún hábito hoy
                </p>
            `;
        } else {
            listContainer.innerHTML = completedHabits.map(habit => `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-${habit.color}-100 dark:bg-${habit.color}-900 p-2 rounded-lg mr-3">
                            <span class="material-icons-outlined text-${habit.color}-600 dark:text-${habit.color}-400 text-sm">${habit.icon}</span>
                        </div>
                        <div>
                            <p class="font-medium text-text-light dark:text-text-dark">${habit.name}</p>
                            ${habit.goal ? `<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">${habit.goal}</p>` : ''}
                        </div>
                    </div>
                    <span class="text-green-500">
                        <span class="material-icons-outlined">check_circle</span>
                    </span>
                </div>
            `).join('');
        }
    }

    async loadWeekStats() {
        // Asegurar que los hábitos estén cargados
        if (this.habitsManager && typeof this.habitsManager.loadHabits === 'function') {
            await this.habitsManager.loadHabits();
        }
        
        const habits = this.habitsManager.getHabits();
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes

        // Calcular estadísticas de la semana
        let completedDays = 0;
        let totalCompletions = 0;
        const weekData = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dayCompletions = habits.filter(habit =>
                habit.completions && habit.completions[dateStr]
            ).length;

            totalCompletions += dayCompletions;
            if (dayCompletions > 0) completedDays++;

            weekData.push({
                date: dateStr,
                day: date.getDate(),
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                completions: dayCompletions,
                total: habits.length
            });
        }

        const completionRate = habits.length > 0
            ? Math.round((totalCompletions / (habits.length * 7)) * 100)
            : 0;

        const averageDaily = Math.round(totalCompletions / 7);

        // Actualizar UI
        document.getElementById('week-days').textContent = `${completedDays}/7`;
        document.getElementById('week-rate').textContent = `${completionRate}%`;
        document.getElementById('week-total').textContent = totalCompletions;
        document.getElementById('week-average').textContent = averageDaily;

        // Gráfico semanal
        this.renderWeekChart(weekData);

        // Calendario semanal
        this.renderWeekCalendar(weekData);
    }

    async loadMonthStats() {
        // Asegurar que los hábitos estén cargados
        if (this.habitsManager && typeof this.habitsManager.loadHabits === 'function') {
            await this.habitsManager.loadHabits();
        }
        
        const habits = this.habitsManager.getHabits();
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Calcular estadísticas del mes
        let activeDays = 0;
        let totalCompletions = 0;
        let bestDay = { date: null, completions: 0 };
        const monthData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];

            const dayCompletions = habits.filter(habit =>
                habit.completions && habit.completions[dateStr]
            ).length;

            totalCompletions += dayCompletions;
            if (dayCompletions > 0) activeDays++;

            if (dayCompletions > bestDay.completions) {
                bestDay = { date: dateStr, completions: dayCompletions };
            }

            monthData.push({
                date: dateStr,
                day: day,
                completions: dayCompletions,
                total: habits.length
            });
        }

        const completionRate = habits.length > 0
            ? Math.round((totalCompletions / (habits.length * daysInMonth)) * 100)
            : 0;

        // Actualizar UI
        document.getElementById('month-days').textContent = activeDays;
        document.getElementById('month-rate').textContent = `${completionRate}%`;
        document.getElementById('month-total').textContent = totalCompletions;
        document.getElementById('month-best').textContent = bestDay.completions;
        
        if (bestDay.date) {
            const bestDate = new Date(bestDay.date);
            document.getElementById('month-best-date').textContent = bestDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long'
            });
        } else {
            document.getElementById('month-best-date').textContent = 'N/A';
        }

        // Gráfico mensual
        this.renderMonthChart(monthData);

        // Calendario mensual
        this.renderMonthCalendar(monthData, year, month);
    }

    renderWeekChart(data) {
        const ctx = document.getElementById('week-chart');
        if (!ctx) return;

        // Destruir gráfico anterior si existe
        if (this.charts.week) {
            this.charts.week.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#9CA3AF' : '#6B7280';
        const gridColor = isDark ? '#374151' : '#E5E7EB';

        this.charts.week = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.dayName),
                datasets: [{
                    label: 'Hábitos Completados',
                    data: data.map(d => d.completions),
                    backgroundColor: '#10B981',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            stepSize: 1
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    renderWeekCalendar(data) {
        const container = document.getElementById('week-calendar');
        container.innerHTML = '';

        // Headers
        const headers = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        headers.forEach(header => {
            const headerEl = document.createElement('div');
            headerEl.className = 'text-center text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark py-2';
            headerEl.textContent = header;
            container.appendChild(headerEl);
        });

        // Días
        data.forEach(day => {
            const dayEl = document.createElement('div');
            const percentage = day.total > 0 ? (day.completions / day.total) * 100 : 0;
            const isToday = day.date === new Date().toISOString().split('T')[0];

            dayEl.className = `h-16 flex flex-col items-center justify-center rounded-lg text-sm ${
                isToday ? 'bg-primary text-white' :
                percentage === 100 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                percentage > 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark'
            }`;
            dayEl.innerHTML = `
                <span class="font-medium">${day.day}</span>
                <span class="text-xs">${day.completions}/${day.total}</span>
            `;
            container.appendChild(dayEl);
        });
    }

    renderMonthChart(data) {
        const ctx = document.getElementById('month-chart');
        if (!ctx) return;

        // Destruir gráfico anterior si existe
        if (this.charts.month) {
            this.charts.month.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#9CA3AF' : '#6B7280';
        const gridColor = isDark ? '#374151' : '#E5E7EB';

        // Agrupar por semanas para mejor visualización
        const weeks = [];
        for (let i = 0; i < data.length; i += 7) {
            const weekData = data.slice(i, i + 7);
            const weekCompletions = weekData.reduce((sum, day) => sum + day.completions, 0);
            weeks.push({
                week: Math.floor(i / 7) + 1,
                completions: weekCompletions
            });
        }

        this.charts.month = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeks.map(w => `Semana ${w.week}`),
                datasets: [{
                    label: 'Hábitos Completados',
                    data: weeks.map(w => w.completions),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            stepSize: 1
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    renderMonthCalendar(data, year, month) {
        const container = document.getElementById('month-calendar');
        container.innerHTML = '';

        // Headers
        const headers = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        headers.forEach(header => {
            const headerEl = document.createElement('div');
            headerEl.className = 'text-center text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark py-2';
            headerEl.textContent = header;
            container.appendChild(headerEl);
        });

        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        const startingDayOfWeek = firstDay.getDay();

        // Días vacíos antes del primer día
        for (let i = 0; i < startingDayOfWeek; i++) {
            const empty = document.createElement('div');
            empty.className = 'h-8';
            container.appendChild(empty);
        }

        // Días del mes
        data.forEach(day => {
            const dayEl = document.createElement('div');
            const percentage = day.total > 0 ? (day.completions / day.total) * 100 : 0;
            const date = new Date(day.date);
            const isToday = date.toDateString() === new Date().toDateString();

            dayEl.className = `h-8 flex items-center justify-center text-sm rounded cursor-pointer transition-colors ${
                isToday ? 'bg-primary text-white font-bold' :
                percentage === 100 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' :
                percentage > 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800' :
                'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'
            }`;
            dayEl.textContent = day.day;
            dayEl.title = `${day.date}: ${day.completions}/${day.total} hábitos completados`;
            container.appendChild(dayEl);
        });
    }
}


