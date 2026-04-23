/** Green Slot Predictor v4.0 — Real-time AI traffic predictions */
const GreenSlot = {
    currentTime: '',
    clockInterval: null,
    selectedArea: null,

    init() {
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
        this.renderAreas();
    },

    updateClock() {
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        this.currentTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const timeStr = `${h12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
        const el = document.getElementById('gs-live-clock');
        if (el) el.textContent = timeStr;
        const dateEl = document.getElementById('gs-live-date');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    getTypeIcon(type) {
        return { college: 'graduation-cap', school: 'school', corporate: 'building-2', market: 'store', transport: 'train-front', mixed: 'map-pin' }[type] || 'map-pin';
    },
    getTypeLabel(type) {
        return { college: 'College Zone', school: 'School Zone', corporate: 'Corporate Area', market: 'Market Area', transport: 'Transport Hub', mixed: 'Mixed Zone' }[type] || 'Area';
    },
    getTypeColor(type) {
        return { college: '#8b5cf6', school: '#3b82f6', corporate: '#0ea5e9', market: '#f97316', transport: '#10b981', mixed: '#64748b' }[type] || '#64748b';
    },

    renderAreas() {
        const container = document.getElementById('green-slot-container');
        if (!container) return;
        const areas = TrafficData.areas;
        const time = this.currentTime;

        // Separate busy and clear areas
        const areaData = areas.map(area => {
            const traffic = TrafficData.getAreaTraffic(area, time);
            return { area, traffic };
        });
        areaData.sort((a, b) => b.traffic.load - a.traffic.load);

        container.innerHTML = areaData.map((item, i) => {
            const { area, traffic } = item;
            const color = traffic.status === 'heavy' ? '#ef4444' : traffic.status === 'moderate' ? '#f59e0b' : '#10b981';
            const statusLabel = traffic.status === 'heavy' ? '🔴 Heavy Traffic' : traffic.status === 'moderate' ? '🟡 Moderate' : '🟢 Clear';
            const typeColor = this.getTypeColor(area.type);
            const hasUpcoming = area.upcomingEvent;
            const barWidth = Math.min(traffic.load, 100);

            return `
            <div class="gs-area-card" onclick="GreenSlot.showAreaDetail('${area.id}')" style="animation:fadeInUp .4s ease ${i * 0.05}s forwards;opacity:0;cursor:pointer">
                <div class="flex items-center gap-2.5 mb-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${typeColor}15;border:1px solid ${typeColor}25">
                        <i data-lucide="${this.getTypeIcon(area.type)}" class="w-4 h-4" style="color:${typeColor}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-heading font-semibold text-slate-200 text-[13px] truncate">${area.name}</h4>
                        <span class="text-[9px] font-bold uppercase tracking-wider" style="color:${typeColor}">${this.getTypeLabel(area.type)}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[18px] font-heading font-bold" style="color:${color}">${traffic.load}%</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-[11px] font-semibold" style="color:${color}">${statusLabel}</span>
                </div>
                <div class="progress-track h-1.5 mb-2" style="background:rgba(255,255,255,0.08)">
                    <div class="progress-fill h-full" style="width:${barWidth}%;background:${color};transition:width 1s ease"></div>
                </div>
                <p class="text-[10px] text-slate-400 leading-snug line-clamp-2">${traffic.reason}</p>
                ${hasUpcoming ? `<div class="mt-2 flex items-center gap-1.5 text-[9px] text-amber-400 font-semibold"><i data-lucide="alert-triangle" class="w-3 h-3"></i>Upcoming: ${hasUpcoming.label}</div>` : ''}
                <div class="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <i data-lucide="sparkles" class="w-3 h-3"></i> Tap for AI prediction
                </div>
            </div>`;
        }).join('');
        lucide.createIcons();
    },

    showAreaDetail(areaId) {
        const area = TrafficData.areas.find(a => a.id === areaId);
        if (!area) return;
        this.selectedArea = area;
        const traffic = TrafficData.getAreaTraffic(area, this.currentTime);
        const prediction = TrafficData.getAIBestDeparture(area, this.currentTime);
        const typeColor = this.getTypeColor(area.type);
        const color = traffic.status === 'heavy' ? '#ef4444' : traffic.status === 'moderate' ? '#f59e0b' : '#10b981';

        const isGoodToGo = prediction.recommendation === 'go_now';
        const recColor = isGoodToGo ? '#10b981' : '#ef4444';
        const recIcon = isGoodToGo ? 'check-circle-2' : 'clock';
        const recLabel = isGoodToGo ? 'Best Time to Go: NOW' : 'Wait for Better Window';

        let scheduleHTML = area.schedules.map(s => {
            const [sH] = s.start.split(':').map(Number);
            const ampm = sH >= 12 ? 'PM' : 'AM';
            const h12 = sH % 12 || 12;
            const [eH] = s.end.split(':').map(Number);
            const eampm = eH >= 12 ? 'PM' : 'AM';
            const eh12 = eH % 12 || 12;
            const sColor = s.load > 70 ? '#ef4444' : s.load > 40 ? '#f59e0b' : '#10b981';
            return `<div class="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
                <div class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style="background:${sColor}"></div>
                <div class="flex-1">
                    <span class="text-[11px] font-semibold text-slate-200">${s.start} – ${s.end}</span>
                    <span class="text-[10px] ml-1.5 font-bold" style="color:${sColor}">${s.load}%</span>
                    <p class="text-[10px] text-slate-400 mt-0.5 leading-snug">${s.reason}</p>
                </div>
            </div>`;
        }).join('');

        const modal = document.getElementById('gs-detail-modal');
        document.getElementById('gs-detail-body').innerHTML = `
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:${typeColor}20;border:1px solid ${typeColor}30">
                    <i data-lucide="${this.getTypeIcon(area.type)}" class="w-5 h-5" style="color:${typeColor}"></i>
                </div>
                <div class="flex-1">
                    <h3 class="font-heading font-bold text-white text-[16px]">${area.name}</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider" style="color:${typeColor}">${this.getTypeLabel(area.type)}</span>
                </div>
                <div class="text-center">
                    <div class="text-[24px] font-heading font-bold" style="color:${color}">${traffic.load}%</div>
                    <div class="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Load</div>
                </div>
            </div>
            <div class="rounded-2xl p-4 mb-4" style="background:${recColor}12;border:1px solid ${recColor}25">
                <div class="flex items-center gap-2 mb-2">
                    <i data-lucide="${recIcon}" class="w-5 h-5" style="color:${recColor}"></i>
                    <span class="font-heading font-bold text-[14px]" style="color:${recColor}">${recLabel}</span>
                </div>
                <p class="text-[12px] text-slate-300 leading-relaxed">${prediction.message}</p>
                ${prediction.alternateRoute ? `<div class="mt-3 flex items-start gap-2 p-2.5 rounded-xl" style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2)">
                    <i data-lucide="route" class="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0"></i>
                    <div><span class="text-[9px] font-bold text-brand-400 uppercase tracking-wider">AI Shortcut</span>
                    <p class="text-[11px] text-slate-300 mt-0.5">${prediction.alternateRoute}</p></div>
                </div>` : ''}
            </div>
            <div class="mb-3">
                <div class="flex items-center gap-2 mb-2">
                    <i data-lucide="calendar-clock" class="w-4 h-4 text-slate-400"></i>
                    <span class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Why Traffic Builds Here</span>
                </div>
                <div class="rounded-xl p-3" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)">
                    ${scheduleHTML}
                </div>
            </div>
            <p class="text-[10px] text-slate-500 text-center mt-3">🤖 AI predictions based on historical patterns & real-time data</p>
        `;
        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    closeDetail() {
        document.getElementById('gs-detail-modal').classList.add('hidden');
    }
};
