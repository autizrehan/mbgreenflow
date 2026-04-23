/**
 * MB-Flow Application Logic v3.0
 * Navigation, Map, Charts, Rickshaw Intelligence, Reporting, AI Analysis, City Summary, Projects
 */

// ===== UTILITIES =====
const Utils = {
    animateCounter: (el, target, duration = 800) => {
        const start = parseInt(el.textContent) || 0;
        const startTime = performance.now();
        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.round(start + (target - start) * ease);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    getTimeAgo: (seconds) => {
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    }
};

// ===== 1. NAVIGATION =====
const Navigation = {
    currentTab: 'dashboard',
    mobileMenuOpen: false,

    toggleMobileMenu: () => {
        Navigation.mobileMenuOpen = !Navigation.mobileMenuOpen;
        const nav = document.getElementById('main-nav');
        const overlay = document.getElementById('mobile-nav-overlay');
        
        if (Navigation.mobileMenuOpen) {
            nav.classList.remove('-translate-x-full');
            nav.classList.add('translate-x-0');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            Navigation.closeMobileMenu();
        }
    },

    closeMobileMenu: () => {
        Navigation.mobileMenuOpen = false;
        const nav = document.getElementById('main-nav');
        const overlay = document.getElementById('mobile-nav-overlay');
        if (nav) nav.classList.remove('translate-x-0');
        if (nav) nav.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
        document.body.style.overflow = '';
    },

    switchTab: (tabId) => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Deactivate all
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#main-nav .nav-pill').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activate target
        document.getElementById(`view-${tabId}`).classList.add('active');
        document.getElementById(`nav-${tabId}`).classList.add('active');

        Navigation.currentTab = tabId;

        // Map fix
        if (tabId === 'map') {
            setTimeout(() => {
                if (MapLogic.map) MapLogic.map.invalidateSize();
                MapEnhanced.renderSaturation();
                MapEnhanced.addTrafficZones(MapLogic.map);
            }, 120);
        }

        // Init mobility tab
        if (tabId === 'rickshaw') {
            setTimeout(() => { RickshawLogic.populateFareDropdowns(); }, 100);
        }

        // Init reports tab content
        if (tabId === 'reports') {
            setTimeout(() => { ReportLogic.initReportsTab(); }, 100);
        }
    },

    openReportModal: () => {
        document.getElementById('report-modal').classList.remove('hidden');
        ReportLogic.renderModalIssueTypes();
        setTimeout(() => lucide.createIcons(), 50);
    },
    closeReportModal: () => {
        document.getElementById('report-modal').classList.add('hidden');
        // Reset form
        ReportLogic.selectedType = null;
        ReportLogic.uploadedImageData = null;
        const zoneInput = document.getElementById('report-zone');
        if (zoneInput) zoneInput.value = '';
        const buildingInput = document.getElementById('report-building');
        if (buildingInput) buildingInput.value = '';
        const descInput = document.getElementById('report-description');
        if (descInput) descInput.value = '';
        // Reset image preview
        const previewWrapper = document.getElementById('image-preview-wrapper');
        if (previewWrapper) previewWrapper.classList.add('hidden');
        const uploadZone = document.getElementById('upload-zone');
        if (uploadZone) uploadZone.classList.remove('hidden');
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    },

    openAIModal: (reportType, location) => {
        document.getElementById('ai-modal').classList.remove('hidden');
        ReportLogic.showAIAnalysis(reportType, location);
        setTimeout(() => lucide.createIcons(), 100);
    },
    closeAIModal: () => { document.getElementById('ai-modal').classList.add('hidden'); },

    toggleHIW: () => {
        const content = document.getElementById('hiw-content');
        const chevron = document.getElementById('hiw-chevron');
        content.classList.toggle('open');
        chevron.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : '';
    }
};

// ===== 2. MAP LOGIC =====
const MapLogic = {
    map: null,
    layers: { traffic: true, reports: true, rickshaw: false },
    areaLabels: [],
    trafficMarkers: [],
    reportMarkers: [],
    rickshawCircles: [],

    init: () => {
        if (MapLogic.map) return;
        const center = [19.2813, 72.8557];
        MapLogic.map = L.map('map', { zoomControl: false }).setView(center, 14);

        // Add zoom control to bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(MapLogic.map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(MapLogic.map);

        MapLogic.addTrafficMarkers();
        MapLogic.addReportMarkers();
        MapLogic.addAreaLabels();
        MapLogic.startTimestamp();
    },

    createPopupHTML: (title, statusHTML, detailHTML) => `
        <div style="font-family: 'Inter', sans-serif; min-width: 180px; padding: 4px 0;">
            <h3 style="font-family: 'Space Grotesk'; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; font-size: 15px; letter-spacing: -0.01em;">${title}</h3>
            ${statusHTML}
            ${detailHTML}
        </div>
    `,

    addTrafficMarkers: () => {
        MapEnhanced.addTrafficZones(MapLogic.map);
    },

    addAreaLabels: () => {
        MapLogic.areaLabels.forEach(l => MapLogic.map.removeLayer(l));
        MapLogic.areaLabels = [];
        const time = GreenSlot.currentTime || '12:00';
        TrafficData.areas.forEach(area => {
            const traffic = TrafficData.getAreaTraffic(area, time);
            const color = traffic.status === 'heavy' ? '#ef4444' : traffic.status === 'moderate' ? '#f59e0b' : '#10b981';
            const bg = traffic.status === 'heavy' ? 'rgba(239,68,68,0.12)' : traffic.status === 'moderate' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
            const border = traffic.status === 'heavy' ? 'rgba(239,68,68,0.3)' : traffic.status === 'moderate' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)';
            const shortName = area.name.length > 18 ? area.name.slice(0, 16) + '…' : area.name;
            const labelIcon = L.divIcon({
                className: 'area-label-icon',
                html: `<div style="white-space:nowrap;font-family:'Inter',sans-serif;font-size:9px;font-weight:700;color:${color};background:${bg};border:1px solid ${border};padding:2px 6px;border-radius:6px;text-align:center;pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,0.08);letter-spacing:0.3px">${shortName} <span style='font-size:8px;opacity:0.8'>${traffic.load}%</span></div>`,
                iconSize: [0, 0],
                iconAnchor: [0, -18]
            });
            const label = L.marker([area.lat, area.lng], { icon: labelIcon, interactive: false }).addTo(MapLogic.map);
            MapLogic.areaLabels.push(label);
        });
    },

    addReportMarkers: () => {
        if (MapLogic.reportMarkers.length > 0) return;
        const offsets = [[0.002, 0.001], [-0.001, 0.002], [0.003, -0.001], [0.001, -0.002], [-0.002, 0.001]];
        TrafficData.reports.forEach((report, i) => {
            const baseLoc = TrafficData.areas[i % TrafficData.areas.length];
            const off = offsets[i % offsets.length];

            // Status-based colors
            const isResolved = report.status === 'Resolved';
            const isInProgress = report.status === 'In Progress';
            const dotColor = isResolved ? '#059669' : isInProgress ? '#d97706' : '#dc2626';
            const dotGlow = isResolved ? 'rgba(5,150,105,0.4)' : isInProgress ? 'rgba(217,119,6,0.4)' : 'rgba(220,38,38,0.5)';
            const dotSize = isResolved ? 12 : 14;
            const statusLabel = isResolved ? '✅ Resolved' : isInProgress ? '🔧 In Progress' : '🔴 Reported';
            const statusColor = isResolved ? '#059669' : isInProgress ? '#d97706' : '#dc2626';
            const statusBg = isResolved ? '#ecfdf5' : isInProgress ? '#fffbeb' : '#fef2f2';
            const ai = TrafficData.aiSeverityRules[report.type] || TrafficData.aiSeverityRules['Others'];
            const severityColor = ai.severity === 'Critical' ? '#dc2626' : ai.severity === 'High' ? '#f97316' : ai.severity === 'Medium' ? '#eab308' : '#22c55e';

            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background:${dotColor}; width:${dotSize}px; height:${dotSize}px; border-radius:50%; border:2.5px solid white; box-shadow:0 0 10px ${dotGlow}; ${!isResolved ? 'animation:pulse 2s infinite;' : ''}"></div>`,
                iconSize: [dotSize, dotSize], iconAnchor: [dotSize / 2, dotSize / 2]
            });
            const marker = L.marker([baseLoc.lat + off[0], baseLoc.lng + off[1]], { icon }).addTo(MapLogic.map);

            const descPreview = report.description ? (report.description.length > 80 ? report.description.slice(0, 80) + '…' : report.description) : 'No description';

            marker.bindPopup(`
                <div style="font-family:'Inter',sans-serif;min-width:220px;padding:4px 0">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                        <span style="font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700;background:${statusBg};color:${statusColor}">${statusLabel}</span>
                        <span style="font-size:9px;padding:2px 6px;border-radius:6px;font-weight:700;background:linear-gradient(135deg,${severityColor}15,${severityColor}08);color:${severityColor};border:1px solid ${severityColor}20">${ai.severity}</span>
                    </div>
                    <h3 style="font-family:'Space Grotesk';font-weight:700;color:#0f172a;margin:0 0 4px;font-size:14px">${report.type}</h3>
                    <p style="font-size:11px;color:#64748b;margin:0 0 6px;display:flex;align-items:center;gap:4px">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${report.location}
                    </p>
                    <div style="background:#f8fafc;border-radius:8px;padding:6px 8px;margin-bottom:8px">
                        <p style="font-size:10px;color:#64748b;margin:0;line-height:1.4">${descPreview}</p>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <span style="font-size:10px;color:#94a3b8;font-weight:500">${report.time}</span>
                        <button onclick="MapLogic.viewReportDetail(${report.id})" style="font-size:10px;font-weight:700;color:#4f46e5;background:#eef2ff;border:1px solid #c7d2fe;padding:4px 10px;border-radius:8px;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s" onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#eef2ff'">View Full Report →</button>
                    </div>
                </div>
            `);
            MapLogic.reportMarkers.push(marker);
        });
    },

    addRickshawZones: () => {
        if (MapLogic.rickshawCircles.length > 0) return;
        TrafficData.rickshawZones.forEach(zone => {
            const color = zone.demand === 'high' ? '#f97316' : (zone.demand === 'medium' ? '#fbbf24' : '#86efac');
            const radius = zone.demand === 'high' ? 400 : (zone.demand === 'medium' ? 300 : 200);
            const circle = L.circle([zone.lat, zone.lng], {
                color, fillColor: color, fillOpacity: 0.15, radius, weight: 2, dashArray: zone.demand === 'low' ? '5,5' : ''
            }).addTo(MapLogic.map);
            circle.bindPopup(MapLogic.createPopupHTML(
                zone.name,
                `<div style="display:flex; gap:12px; margin-top:4px;">
                    <div style="text-align:center;"><div style="font-family:'Space Grotesk'; font-size:18px; font-weight:700; color:#0f172a;">${zone.activeDrivers}</div><div style="font-size:9px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Active</div></div>
                    <div style="text-align:center;"><div style="font-family:'Space Grotesk'; font-size:18px; font-weight:700; color:#0f172a;">${zone.avgWait}</div><div style="font-size:9px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Wait</div></div>
                </div>`,
                ''
            ));
            MapLogic.rickshawCircles.push(circle);
        });
    },

    removeReportMarkers: () => { MapLogic.reportMarkers.forEach(m => MapLogic.map.removeLayer(m)); MapLogic.reportMarkers = []; },
    removeRickshawZones: () => { MapLogic.rickshawCircles.forEach(c => MapLogic.map.removeLayer(c)); MapLogic.rickshawCircles = []; },

    // Navigate from map popup to report detail
    viewReportDetail: (reportId) => {
        // Close map popup
        if (MapLogic.map) MapLogic.map.closePopup();

        // Switch to reports tab
        Navigation.switchTab('reports');

        // Wait for tab to render, then open the specific report
        setTimeout(() => {
            // Close any open details first
            document.querySelectorAll('.report-detail.open').forEach(el => {
                el.classList.remove('open');
                el.previousElementSibling.classList.remove('expanded');
            });

            // Open the target report
            const detail = document.getElementById(`report-detail-${reportId}`);
            const item = document.getElementById(`report-item-${reportId}`);
            if (detail && item) {
                detail.classList.add('open');
                detail.previousElementSibling.classList.add('expanded');

                // Scroll to it with smooth animation
                setTimeout(() => {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Flash highlight effect
                    item.style.transition = 'box-shadow 0.4s ease';
                    item.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.3), 0 4px 20px rgba(99,102,241,0.15)';
                    item.style.borderRadius = '16px';
                    setTimeout(() => { item.style.boxShadow = ''; }, 2500);
                }, 200);
            }
        }, 300);
    },

    toggleLayer: (layer) => {
        MapLogic.layers[layer] = !MapLogic.layers[layer];
        const btn = document.getElementById(`btn-layer-${layer}`);
        if (MapLogic.layers[layer]) {
            btn.style.cssText = 'border-color:rgba(139,92,246,0.6);color:#c4b5fd;background:rgba(139,92,246,0.15);';
        } else {
            btn.style.cssText = '';
        }
        if (layer === 'reports') { MapLogic.layers.reports ? MapLogic.addReportMarkers() : MapLogic.removeReportMarkers(); }
        if (layer === 'rickshaw') { MapLogic.layers.rickshaw ? MapLogic.addRickshawZones() : MapLogic.removeRickshawZones(); }
    },

    startTimestamp: () => {
        const el = document.getElementById('map-timestamp');
        let seconds = 0;
        setInterval(() => {
            seconds += 30;
            el.textContent = 'Updated ' + Utils.getTimeAgo(seconds);
        }, 30000);
    }
};

// ===== 3. DASHBOARD / AI INSIGHTS =====
const ChartLogic = {
    renderGreenSlots: () => { GreenSlot.init(); },
    renderGauges: () => { },
    initTrafficChart: () => { },

    renderAIInsights: () => {
        const container = document.getElementById('ai-insights-container');
        if (!container) return;
        const time = GreenSlot.currentTime || '12:00';
        const areas = TrafficData.areas;

        // Find busiest & clearest areas right now
        const sorted = areas.map(a => ({ a, t: TrafficData.getAreaTraffic(a, time) })).sort((x, y) => y.t.load - x.t.load);
        const busiest = sorted.slice(0, 3);
        const clearest = sorted.slice(-3).reverse();

        // Count by type
        const typeCounts = {};
        sorted.forEach(({ a, t }) => {
            if (!typeCounts[a.type]) typeCounts[a.type] = { busy: 0, clear: 0, total: 0 };
            typeCounts[a.type].total++;
            if (t.status === 'heavy') typeCounts[a.type].busy++;
            else if (t.status === 'clear') typeCounts[a.type].clear++;
        });

        const avgLoad = Math.round(sorted.reduce((s, x) => s + x.t.load, 0) / sorted.length);
        const heavyCount = sorted.filter(x => x.t.status === 'heavy').length;
        const clearCount = sorted.filter(x => x.t.status === 'clear').length;

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="card p-4 text-center" style="border-left:3px solid rgba(139,92,246,0.6)"><p class="stat-num text-[28px]" style="color:#c4b5fd">${avgLoad}%</p><p class="section-label mt-1">Avg City Load</p></div>
                <div class="card p-4 text-center" style="border-left:3px solid rgba(248,113,113,0.6)"><p class="stat-num text-[28px]" style="color:#f87171">${heavyCount}</p><p class="section-label mt-1">Heavy Zones</p></div>
                <div class="card p-4 text-center" style="border-left:3px solid rgba(74,222,128,0.6)"><p class="stat-num text-[28px]" style="color:#4ade80">${clearCount}</p><p class="section-label mt-1">Clear Zones</p></div>
            </div>
            <div class="grid md:grid-cols-2 gap-3">
                <div class="card-flat p-4"><h4 class="section-label mb-3 flex items-center gap-1.5" style="color:#f87171"><i data-lucide="flame" class="w-3.5 h-3.5"></i> Busiest Right Now</h4>
                    ${busiest.map(({ a, t }) => `<div class="flex items-center gap-2 py-2" style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div class="w-2 h-2 rounded-sm" style="background:#f87171;box-shadow:0 0 6px #f87171"></div>
                        <span class="flex-1 text-[12px] font-medium" style="color:#cbd5e1">${a.name}</span>
                        <span class="data-mono text-[12px] font-bold" style="color:#f87171">${t.load}%</span>
                    </div>`).join('')}
                </div>
                <div class="card-flat p-4"><h4 class="section-label mb-3 flex items-center gap-1.5" style="color:#4ade80"><i data-lucide="leaf" class="w-3.5 h-3.5"></i> Best Routes Now</h4>
                    ${clearest.map(({ a, t }) => `<div class="flex items-center gap-2 py-2" style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div class="w-2 h-2 rounded-sm" style="background:#4ade80;box-shadow:0 0 6px #4ade80"></div>
                        <span class="flex-1 text-[12px] font-medium" style="color:#cbd5e1">${a.name}</span>
                        <span class="data-mono text-[12px] font-bold" style="color:#4ade80">${t.load}%</span>
                    </div>`).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

// ===== 4. MOBILITY HUB =====
const RickshawLogic = {

    init: () => {
        RickshawLogic.populateFareDropdowns();
    },

    renderMobilityServices: () => {
        const services = TrafficData.mobilityServices;
        const container = document.getElementById('mobility-services-container');
        if (!container) return;
        container.innerHTML = services.map((svc, i) => `
            <div class="card p-4" style="animation:fadeInUp 0.5s ease ${i*0.1}s forwards;opacity:0;border-top:2.5px solid ${svc.color};background:linear-gradient(135deg,${svc.color}12 0%,rgba(8,10,28,0.8) 50%);">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0" style="background:${svc.color}18;border:2px solid ${svc.color}40;box-shadow:0 0 14px ${svc.color}30">
                        <i data-lucide="${svc.icon}" class="w-4 h-4" style="color:${svc.color}"></i>
                    </div>
                    <div>
                        <p class="font-heading font-black text-[12px] leading-tight" style="color:#f1f5f9">${svc.name}</p>
                        <p class="text-[9px]" style="color:#475569">${svc.provider}</p>
                    </div>
                </div>
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <span class="section-label">Active</span>
                        <span class="data-mono text-[12px] font-bold" style="color:${svc.color}">${svc.active !== null ? svc.active + ' ' + (svc.unit || 'vehicles') : 'Schedule Based'}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="section-label">Wait</span>
                        <span class="data-mono text-[11px] font-bold" style="color:#f1f5f9">${svc.waitTime}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="section-label">Coverage</span>
                        <span class="text-[10px] font-medium" style="color:#64748b">${svc.coverage}</span>
                    </div>
                    ${svc.extraDetail ? `
                    <div class="flex items-center justify-between pt-0.5">
                        <span class="section-label">${svc.extraDetail.label}</span>
                        <span class="text-[10px] font-medium text-right" style="color:#f1f5f9">${svc.extraDetail.value}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="mt-3 pt-2.5" style="border-top:1px solid rgba(255,255,255,0.07)">
                    <p class="text-[10px] leading-relaxed" style="color:#475569">${svc.note}</p>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    renderStats: () => {
        const stats = TrafficData.mobilityStats;
        const items = [
            { label: 'Total Vehicles', value: stats.totalVehicles, icon: 'car', neon: '#fb923c' },
            { label: 'Avg Wait', value: stats.avgWaitAll, icon: 'clock', neon: '#22d3ee' },
            { label: 'Busiest Zone', value: stats.busiestZone, icon: 'trending-up', neon: '#f87171' },
            { label: 'Daily Trips', value: stats.dailyTrips.toLocaleString(), icon: 'users', neon: '#c4b5fd' },
            { label: 'Cheapest Mode', value: stats.cheapestMode, icon: 'piggy-bank', neon: '#4ade80' },
        ];

        const container = document.getElementById('rickshaw-stats-container');
        if (!container) return;
        container.innerHTML = items.map((item, i) => `
            <div class="card p-4" style="animation: fadeInUp 0.5s ease ${i * 0.08}s forwards; opacity: 0; border-left: 3px solid ${item.neon}40;">
                <div class="flex items-center gap-2 mb-2.5">
                    <div class="w-7 h-7 rounded-[6px] flex items-center justify-center" style="background:${item.neon}15;border:1.5px solid ${item.neon}30"><i data-lucide="${item.icon}" class="w-3.5 h-3.5" style="color:${item.neon}"></i></div>
                    <span class="section-label">${item.label}</span>
                </div>
                <p class="data-mono text-[14px] font-bold leading-snug" style="color:#f1f5f9">${item.value}</p>
            </div>
        `).join('');
    },

    renderZones: () => {
        const zones = TrafficData.demandZones || [];
        const modes = [
            { key: 'rickshaw', label: 'Auto', icon: 'bike', color: '#fb923c' },
            { key: 'cab', label: 'Cab', icon: 'car', color: '#22d3ee' },
            { key: 'bike', label: 'Bike', icon: 'zap', color: '#4ade80' },
            { key: 'metro', label: 'Metro', icon: 'tram', color: '#38bdf8' },
        ];
        const chipColors = { high: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.35)' }, medium: { bg: 'rgba(251,146,60,0.12)', color: '#fb923c', border: 'rgba(251,146,60,0.35)' }, low: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.35)' } };

        const container = document.getElementById('rickshaw-zones-container');
        if (!container) return;
        container.innerHTML = zones.map((zone, i) => {
            const modeRows = modes.map(m => {
                const d = zone[m.key];
                if (!d) return '';
                const isMetro = m.key === 'metro';
                const chip = chipColors[d.demand] || chipColors.low;
                return `
                    <div class="flex items-center justify-between py-1.5" style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div class="flex items-center gap-2">
                            <div class="w-5 h-5 rounded-[4px] flex items-center justify-center" style="background:${m.color}18;border:1px solid ${m.color}30">
                                <i data-lucide="${m.icon}" class="w-3 h-3" style="color:${m.color}"></i>
                            </div>
                            <span class="text-[11px] font-bold" style="color:#cbd5e1">${m.label}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${isMetro ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:${chip.bg};color:${chip.color};border:1px solid ${chip.border}">${d.status}</span>` : `
                                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:${chip.bg};color:${chip.color};border:1px solid ${chip.border}">${d.demand}</span>
                                <span class="data-mono text-[10px]" style="color:#64748b">${d.active} · ${d.wait}</span>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
            return `
                <div class="card p-4" style="animation: fadeInUp 0.5s ease ${i * 0.08}s forwards; opacity: 0;">
                    <h4 class="font-heading font-bold text-[13px] mb-3" style="color:#f1f5f9">${zone.name}</h4>
                    <div class="space-y-0">${modeRows}</div>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    },

    populateFareDropdowns: () => {
        // Collect ALL locations from: areas, fare routes, report locations, and direction routes
        // Exclude the old emoji-metro entries
        const areaNames = TrafficData.areas.map(a => a.name);
        const fareLocations = TrafficData.mobilityFares.flatMap(f => [f.from, f.to])
            .filter(l => !l.startsWith('\u2728')); // strip old emoji entries
        const reportLocations = TrafficData.reports.map(r => r.location);
        const dirLocations = TrafficData.directionRoutes.flatMap(r => [r.from, r.to]);
        const extraLocations = ['Shanti Park', 'Bhayandar Station'];
        const allLocations = [...new Set([...areaNames, ...fareLocations, ...reportLocations, ...dirLocations, ...extraLocations])].sort();
        const opt = l => `<option value="${l}">${l}</option>`;
        document.getElementById('fare-from').innerHTML = '<option value="">\u2014 Select Pickup \u2014</option>' + allLocations.map(opt).join('');
        document.getElementById('fare-to').innerHTML = '<option value="">\u2014 Select Drop-off \u2014</option>' + allLocations.map(opt).join('');

        // Populate metro station dropdowns
        RickshawLogic.populateMetroDropdowns();
    },

    populateMetroDropdowns: () => {
        const stations = TrafficData.metroStations;
        const opt = s => `<option value="${s.name}">${s.name}${s.interchanges.length ? ' \uD83D\uDD01 ' + s.interchanges[0] : ''}</option>`;
        const blank = '<option value="">\u2014 Select Station \u2014</option>';
        document.getElementById('metro-from').innerHTML = blank + stations.map(opt).join('');
        document.getElementById('metro-to').innerHTML   = blank + stations.map(opt).join('');
    },

    updateFare: () => {
        const from = document.getElementById('fare-from').value;
        const to = document.getElementById('fare-to').value;
        const el = document.getElementById('fare-result');
        if (!from || !to || from === to) { el.classList.add('hidden'); return; }

        let fare = TrafficData.mobilityFares.find(f =>
            (f.from === from && f.to === to) || (f.from === to && f.to === from)
        );

        if (!fare) {
            // Generate synthetic fare
            const allLocs = [...TrafficData.areas, ...TrafficData.demandZones, ...(TrafficData.rickshawZones||[])];
            const fromLoc = allLocs.find(a => a.name === from);
            const toLoc = allLocs.find(a => a.name === to);
            
            let dist = 4.5;
            if (fromLoc && toLoc) {
                dist = Math.sqrt(Math.pow(fromLoc.lat - toLoc.lat, 2) + Math.pow(fromLoc.lng - toLoc.lng, 2)) * 111 * 1.3; 
            } else {
                dist = ((from.length + to.length) % 6) + 2.5; 
            }
            dist = parseFloat(Math.max(1.0, Math.min(dist, 15.0)).toFixed(1));

            const hasTrain = from.toLowerCase().includes('station') && to.toLowerCase().includes('station');
            
            fare = {
                from,
                to,
                distance: `${dist} km`,
                rickshaw: { fare: `₹${Math.round(23 + 13 * dist)}`, time: `${Math.round(dist * 4.5)} min` },
                cab: { fare: `₹${Math.round(50 + 20 * dist)}–${Math.round(65 + 24 * dist)}`, time: `${Math.round(dist * 3.5)} min` },
                bike: { fare: `₹${Math.round(15 + 10 * dist)}`, time: `${Math.round(dist * 3)} min` },
                train: hasTrain ? { fare: '₹10', time: `${Math.round(dist * 1.5)} min` } : { fare: '—', time: '—' },
                metro: { fare: '—', time: '—' }
            };
        }

        el.classList.remove('hidden');
        if (fare) {
            const modes = [
                { key: 'rickshaw', label: 'Auto Rickshaw', icon: 'bike',       color: '#fb923c' },
                { key: 'cab',      label: 'Cab (Ola/Uber)',icon: 'car',        color: '#22d3ee' },
                { key: 'bike',     label: 'Bike Taxi',     icon: 'zap',        color: '#4ade80' },
                { key: 'train',    label: 'Local Train',   icon: 'train-front', color: '#c4b5fd' },
                { key: 'metro',    label: 'Metro Line 9',  icon: 'tram',       color: '#38bdf8' },
            ];
            el.innerHTML = `
                <div style="animation:fadeInUp 0.35s ease;">
                    <div class="inset-glass px-4 py-3 rounded-[8px] mb-3 flex items-center gap-3">
                        <i data-lucide="map-pin" class="w-4 h-4 flex-shrink-0" style="color:var(--neon-purple)"></i>
                        <span class="text-[12px] font-bold" style="color:#f1f5f9">${from}</span>
                        <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0" style="color:#475569"></i>
                        <i data-lucide="map-pin" class="w-4 h-4 flex-shrink-0" style="color:var(--neon-cyan)"></i>
                        <span class="text-[12px] font-bold" style="color:#f1f5f9">${to}</span>
                        <span class="ml-auto data-mono text-[11px]" style="color:#64748b">${fare.distance}</span>
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        ${modes.map(m => {
                            const d = fare[m.key];
                            const unavail = d.fare === '—';
                            return `
                            <div class="card p-3.5" style="border-top:2.5px solid ${m.color}80;background:linear-gradient(135deg,${m.color}10 0%,rgba(8,10,28,0.85) 55%);${unavail ? 'opacity:0.4' : ''}">
                                <div class="flex items-center gap-2 mb-2.5">
                                    <div class="w-7 h-7 rounded-[6px] flex items-center justify-center" style="background:${m.color}18;border:1.5px solid ${m.color}35">
                                        <i data-lucide="${m.icon}" class="w-3.5 h-3.5" style="color:${m.color}"></i>
                                    </div>
                                    <span class="text-[10px] font-bold" style="color:#94a3b8">${m.label}</span>
                                </div>
                                <p class="data-mono text-[20px] font-black leading-none mb-1" style="color:${unavail ? '#334155' : m.color}">${d.fare}</p>
                                <p class="text-[10px]" style="color:#475569"><i data-lucide="clock" class="w-3 h-3 inline mr-0.5"></i>${d.time}</p>
                                ${unavail ? '<p class="text-[9px] mt-1" style="color:#334155">Not available on this route</p>' : ''}
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
            lucide.createIcons();
        }
    },

    // ── METRO MODE TOGGLE ────────────────────────────────────────────
    toggleMetroMode: () => {
        const cb    = document.getElementById('metro-mode-checkbox');
        const panel = document.getElementById('metro-panel');
        const label = document.getElementById('metro-toggle-label');
        const box   = document.getElementById('metro-outer-box');

        if (cb.checked) {
            // Opening
            panel.style.maxHeight = '900px';
            label.style.borderBottom = '1px solid rgba(56,189,248,0.25)';
            box.style.borderColor = 'rgba(56,189,248,0.7)';
            box.style.boxShadow   = '0 0 18px rgba(56,189,248,0.15)';
            setTimeout(() => lucide.createIcons(), 50);
            RickshawLogic.updateMetroFare();
        } else {
            // Closing
            panel.style.maxHeight = '0';
            label.style.borderBottom = '1px solid transparent';
            box.style.borderColor = 'rgba(56,189,248,0.35)';
            box.style.boxShadow   = 'none';
            document.getElementById('metro-fare-result').innerHTML = '';
        }
    },

    // ── METRO FARE CALCULATOR ────────────────────────────────────────
    updateMetroFare: () => {
        const fromStn = document.getElementById('metro-from').value;
        const toStn   = document.getElementById('metro-to').value;
        const el      = document.getElementById('metro-fare-result');
        el.innerHTML  = '';
        if (!fromStn || !toStn || fromStn === toStn) return;

        const mf = TrafficData.getMetroFare(fromStn, toStn);
        if (!mf) return;

        // Estimate road-mode equivalents for the same corridor
        const dist = parseFloat(mf.distance);
        const road = {
            rickshaw:  { fare: `\u20b9${Math.round(23 + 13 * dist)}`,              time: `${Math.round(dist * 5)} min` },
            cab:       { fare: `\u20b9${Math.round(50 + 20 * dist)}\u2013${Math.round(65 + 24 * dist)}`, time: `${Math.round(dist * 4)} min` },
            bike:      { fare: `\u20b9${Math.round(15 + 10 * dist)}`,              time: `${Math.round(dist * 3.5)} min` },
        };

        const metroTimeNum = parseInt(mf.time);
        const metroFareNum = parseInt(mf.fare.replace('\u20b9', ''));

        function timeSaving(roadTimeStr) {
            return parseInt(roadTimeStr) - metroTimeNum;
        }
        function moneySaving(fareStr) {
            const match = fareStr.match(/\d+/);
            return (match ? parseInt(match[0]) : 0) - metroFareNum;
        }

        // ── SMART COMMUTE PLANNER DATA ──────────────────────────────
        const now      = new Date();
        const hour     = now.getHours();
        const minute   = now.getMinutes();
        const totalMin = hour * 60 + minute;

        // Metro operating hours: 6:00 AM – 10:00 PM
        const isOperating = totalMin >= 360 && totalMin <= 1320;

        // Crowd level model (peak = commute rush, off-peak = quiet)
        let crowdLevel, crowdLabel, crowdColor, crowdBg, crowdBorder;
        if ((totalMin >= 390 && totalMin <= 570) || (totalMin >= 1020 && totalMin <= 1230)) {
            crowdLevel = 'HIGH'; crowdLabel = 'High Crowd \u2014 Peak Hour';
            crowdColor = '#f87171'; crowdBg = 'rgba(248,113,113,0.1)'; crowdBorder = 'rgba(248,113,113,0.3)';
        } else if ((totalMin >= 570 && totalMin <= 840) || (totalMin >= 900 && totalMin <= 1020)) {
            crowdLevel = 'MODERATE'; crowdLabel = 'Moderate Crowd \u2014 Mid-Day';
            crowdColor = '#fb923c'; crowdBg = 'rgba(251,146,60,0.1)'; crowdBorder = 'rgba(251,146,60,0.3)';
        } else {
            crowdLevel = 'LOW'; crowdLabel = 'Low Crowd \u2014 Off-Peak';
            crowdColor = '#4ade80'; crowdBg = 'rgba(74,222,128,0.1)'; crowdBorder = 'rgba(74,222,128,0.3)';
        }

        // Best travel window
        let bestWindow;
        if (totalMin < 390) bestWindow = 'Before 6:30 AM or after 9:30 AM';
        else if (totalMin < 570) bestWindow = 'Best time is 9:30\u201311:30 AM (off-peak)';
        else if (totalMin < 1020) bestWindow = 'Now is a great time \u2014 uncrowded!';
        else if (totalMin < 1230) bestWindow = 'Wait until after 8:30 PM for less crowd';
        else bestWindow = 'You are travelling in off-peak hours \u2014 enjoy!';

        // CO\u2082 savings (cab: ~185g/km, metro: ~35g/km, both per passenger)
        const co2CabPerKm   = 185; // grams
        const co2MetroPerKm = 35;
        const co2Saved      = Math.round((co2CabPerKm - co2MetroPerKm) * dist);
        const co2Emoji      = co2Saved > 500 ? '\uD83C\uDF33\uD83C\uDF33' : co2Saved > 200 ? '\uD83C\uDF33' : '\uD83C\uDF31';

        // Monthly savings (vs cab, 20 working days, 2 trips/day)
        const cabMinFare    = parseInt(road.cab.fare.match(/\d+/)[0]);
        const monthlySaving = (cabMinFare - metroFareNum) * 2 * 20;
        const annualSaving  = monthlySaving * 12;

        // ── NEXT DEPARTURE (simulated based on current time) ─────────
        const freq = (crowdLevel === 'HIGH') ? 6 : 12; // minutes between trains
        const minsToNext = freq - (minute % freq);
        const nextDeptStr = isOperating
            ? (minsToNext <= 1 ? 'Arriving now!' : `In ${minsToNext} min`)
            : 'Service ended for today';

        // ── STATUS PILL ─────────────────────────────────────────────
        const statusColor  = isOperating ? '#4ade80' : '#f87171';
        const statusBg     = isOperating ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.1)';
        const statusBorder = isOperating ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.25)';
        const statusText   = isOperating ? '\u25CF LIVE \u2014 Operational' : '\u25CF Closed \u2014 Opens 6:00 AM';

        const compareModes = [
            { label: 'Auto Rickshaw', key: 'rickshaw', icon: 'bike',  color: '#fb923c', d: road.rickshaw },
            { label: 'Cab (Ola/Uber)', key: 'cab',     icon: 'car',   color: '#22d3ee', d: road.cab      },
            { label: 'Bike Taxi',      key: 'bike',     icon: 'zap',   color: '#4ade80', d: road.bike     },
        ];

        const allStations = TrafficData.metroStations;
        const fromObj = allStations.find(s => s.name === fromStn);
        const toObj   = allStations.find(s => s.name === toStn);
        const stopsArr = allStations.slice(
            Math.min(allStations.indexOf(fromObj), allStations.indexOf(toObj)),
            Math.max(allStations.indexOf(fromObj), allStations.indexOf(toObj)) + 1
        );

        el.innerHTML = `
        <div style="animation:fadeInUp 0.35s ease;">

            <!-- Metro journey header -->
            <div class="rounded-[10px] p-4 mb-3" style="background: linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(8,10,28,0.9) 60%); border: 1.5px solid rgba(56,189,248,0.35); box-shadow: 0 0 20px rgba(56,189,248,0.1);">
                <div class="flex items-center gap-2 mb-3">
                    <i data-lucide="train-front" class="w-4 h-4" style="color:#38bdf8;"></i>
                    <span class="font-heading font-black text-[13px]" style="color:#e0f2fe;">Metro Line 9 \u00b7 Red Line</span>
                    <span class="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style="background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};">${statusText}</span>
                </div>

                <!-- Station Journey strip -->
                <div class="flex items-center gap-1 overflow-x-auto pb-1 mb-3" style="scrollbar-width:none;">
                    ${stopsArr.map((s, i) => `
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <div class="flex flex-col items-center gap-0.5">
                            <div class="w-3 h-3 rounded-full flex-shrink-0" style="background:${s.name===fromStn||s.name===toStn?'#38bdf8':'rgba(56,189,248,0.35)'}; border: 2px solid ${s.name===fromStn||s.name===toStn?'#7dd3fc':'rgba(56,189,248,0.2)'}; box-shadow: ${s.name===fromStn||s.name===toStn?'0 0 8px rgba(56,189,248,0.6)':''}"></div>
                            <span class="text-[8px] text-center whitespace-nowrap" style="color:${s.name===fromStn||s.name===toStn?'#e0f2fe':'#475569'}; max-width:52px; overflow:hidden; text-overflow:ellipsis;">${s.name}</span>
                        </div>
                        ${i < stopsArr.length-1 ? '<div class="flex-shrink-0 h-0.5 w-5 mt-[-10px]" style="background:rgba(56,189,248,0.3);"></div>' : ''}
                    </div>`).join('')}
                </div>

                <!-- Metro stats row -->
                <div class="grid grid-cols-3 gap-2">
                    <div class="text-center p-2 rounded-[6px]" style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.15);">
                        <p class="data-mono text-[16px] font-black" style="color:#38bdf8;">${mf.fare}</p>
                        <p class="text-[8px]" style="color:#475569;">Fare</p>
                    </div>
                    <div class="text-center p-2 rounded-[6px]" style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.15);">
                        <p class="data-mono text-[16px] font-black" style="color:#38bdf8;">${mf.time}</p>
                        <p class="text-[8px]" style="color:#475569;">Travel Time</p>
                    </div>
                    <div class="text-center p-2 rounded-[6px]" style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.15);">
                        <p class="data-mono text-[16px] font-black" style="color:#38bdf8;">${mf.distance}</p>
                        <p class="text-[8px]" style="color:#475569;">Distance</p>
                    </div>
                </div>
            </div>

            <!-- VS comparison -->
            <div class="mb-3">
                <p class="section-label mb-2" style="color:rgba(56,189,248,0.6);">Metro vs. Other Modes \u2014 Same Corridor</p>
                <div class="space-y-2">
                    ${compareModes.map(m => {
                        const tSave = timeSaving(m.d.time);
                        const mSave = moneySaving(m.d.fare);
                        const tSaveStr = tSave > 0 ? `\u2212${tSave} min faster` : tSave < 0 ? `+${Math.abs(tSave)} min slower` : 'Same time';
                        const mSaveStr = mSave > 0 ? `Save \u20b9${mSave}` : mSave < 0 ? `\u20b9${Math.abs(mSave)} more by metro` : 'Same cost';
                        const tGood = tSave > 0; const mGood = mSave > 0;
                        return `
                        <div class="flex items-center gap-3 rounded-[8px] px-3 py-2.5" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);">
                            <div class="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0" style="background:${m.color}18; border:1.5px solid ${m.color}30;">
                                <i data-lucide="${m.icon}" class="w-3.5 h-3.5" style="color:${m.color};"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[11px] font-bold" style="color:#cbd5e1;">${m.label}</p>
                                <p class="text-[10px]" style="color:#475569;">${m.d.fare} &nbsp;\u00b7&nbsp; ${m.d.time}</p>
                            </div>
                            <div class="flex flex-col items-end gap-0.5">
                                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:${tGood?'rgba(74,222,128,0.12)':'rgba(248,113,113,0.1)'}; color:${tGood?'#4ade80':'#f87171'}; border:1px solid ${tGood?'rgba(74,222,128,0.25)':'rgba(248,113,113,0.2)'}; white-space:nowrap;">${tSaveStr}</span>
                                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:${mGood?'rgba(74,222,128,0.12)':'rgba(251,146,60,0.1)'}; color:${mGood?'#4ade80':'#fb923c'}; border:1px solid ${mGood?'rgba(74,222,128,0.25)':'rgba(251,146,60,0.2)'}; white-space:nowrap;">${mSaveStr}</span>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <!-- ════ SMART COMMUTE PLANNER ════ -->
            <div class="rounded-[10px] overflow-hidden mb-3" style="border: 1.5px solid rgba(139,92,246,0.35); background: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(8,10,28,0.92) 60%);">
                <!-- Header -->
                <div class="flex items-center gap-2 px-4 py-2.5" style="border-bottom:1px solid rgba(139,92,246,0.15); background:rgba(139,92,246,0.06);">
                    <i data-lucide="brain-circuit" class="w-3.5 h-3.5" style="color:#a78bfa;"></i>
                    <span class="font-heading font-black text-[11px] uppercase tracking-wider" style="color:#c4b5fd;">Smart Commute Planner</span>
                    <span class="ml-auto text-[8px] font-bold px-2 py-0.5 rounded-full" style="background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);">AI INSIGHT</span>
                </div>

                <div class="p-4 grid grid-cols-2 gap-3">

                    <!-- Live Status + Next Train -->
                    <div class="col-span-2 flex items-center justify-between rounded-[8px] px-3 py-2.5" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);">
                        <div class="flex items-center gap-2">
                            <i data-lucide="radio" class="w-3.5 h-3.5" style="color:${statusColor};"></i>
                            <div>
                                <p class="text-[11px] font-bold" style="color:${statusColor};">${isOperating ? 'Metro is Running' : 'Metro Closed'}</p>
                                <p class="text-[9px]" style="color:#475569;">6:00 AM \u2013 10:00 PM daily</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="data-mono text-[13px] font-black" style="color:#e0f2fe;">${nextDeptStr}</p>
                            <p class="text-[9px]" style="color:#475569;">Next departure</p>
                        </div>
                    </div>

                    <!-- Crowd Level -->
                    <div class="rounded-[8px] p-3" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
                        <div class="flex items-center gap-1.5 mb-2">
                            <i data-lucide="users" class="w-3 h-3" style="color:#94a3b8;"></i>
                            <span class="section-label">Now on Metro</span>
                        </div>
                        <div class="crowd-pulse inline-flex items-center gap-1.5 px-2 py-1 rounded-full mb-1.5" style="background:${crowdBg};border:1px solid ${crowdBorder};">
                            <span class="w-1.5 h-1.5 rounded-full" style="background:${crowdColor};box-shadow:0 0 6px ${crowdColor};"></span>
                            <span class="text-[9px] font-bold" style="color:${crowdColor};">${crowdLevel}</span>
                        </div>
                        <p class="text-[9px] leading-relaxed" style="color:#64748b;">${crowdLabel}</p>
                    </div>

                    <!-- Best Window -->
                    <div class="rounded-[8px] p-3" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
                        <div class="flex items-center gap-1.5 mb-2">
                            <i data-lucide="clock-3" class="w-3 h-3" style="color:#94a3b8;"></i>
                            <span class="section-label">Best Time</span>
                        </div>
                        <p class="text-[10px] font-bold leading-snug" style="color:#fde68a;">${bestWindow}</p>
                    </div>

                    <!-- CO2 savings -->
                    <div class="rounded-[8px] p-3" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
                        <div class="flex items-center gap-1.5 mb-2">
                            <i data-lucide="leaf" class="w-3 h-3" style="color:#4ade80;"></i>
                            <span class="section-label">CO\u2082 Saved / Trip</span>
                        </div>
                        <p class="data-mono text-[18px] font-black leading-none" style="color:#4ade80;">${co2Saved}g</p>
                        <p class="text-[9px] mt-1" style="color:#475569;">${co2Emoji} vs taking a cab</p>
                    </div>

                    <!-- Monthly savings -->
                    <div class="rounded-[8px] p-3" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
                        <div class="flex items-center gap-1.5 mb-2">
                            <i data-lucide="piggy-bank" class="w-3 h-3" style="color:#fbbf24;"></i>
                            <span class="section-label">Monthly Savings</span>
                        </div>
                        <p class="data-mono text-[18px] font-black leading-none" style="color:#fde047;">\u20b9${monthlySaving.toLocaleString()}</p>
                        <p class="text-[9px] mt-1" style="color:#475569;">vs cab \u00b7 20 days \u00b7 \u20b9${annualSaving.toLocaleString()}/yr</p>
                    </div>

                </div>
            </div>

            <!-- Verdict banner -->
            <div class="flex items-start gap-2 p-3 rounded-[8px]" style="background:rgba(74,222,128,0.08); border:1.5px solid rgba(74,222,128,0.25);">
                <i data-lucide="sparkles" class="w-4 h-4 mt-0.5 flex-shrink-0" style="color:#4ade80;"></i>
                <p class="text-[11px] leading-relaxed" style="color:#86efac;">
                    <strong>Metro Line 9</strong> offers the fastest journey at <strong>${mf.time}</strong> for just <strong>${mf.fare}</strong> \u2014 avoiding road traffic entirely between <strong>${fromStn}</strong> and <strong>${toStn}</strong>.
                </p>
            </div>
        </div>`;
        lucide.createIcons();
    },

}; // end RickshawLogic

// ===== 5. REPORTS & AI ANALYSIS =====
const ReportLogic = {
    selectedType: null,
    reportsTabInitialized: false,
    uploadedImageData: null,

    init: () => { ReportLogic.renderReports(); },

    // === Reports Tab Initialization ===
    initReportsTab: () => {
        if (ReportLogic.reportsTabInitialized) return;
        ReportLogic.reportsTabInitialized = true;
        ReportLogic.renderCitySummary();
        ReportLogic.renderUpcomingProjects();
        ReportLogic.renderGovtMilestones();
    },

    // === City Problem Summary ===
    renderCitySummary: () => {
        const data = TrafficData.citySummary;
        const container = document.getElementById('city-problems-container');
        if (!container) return;

        container.innerHTML = data.problems.map((problem, i) => `
            <div class="bg-white/[0.06] rounded-2xl p-4 border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.1] transition-all cursor-default"
                 style="animation: fadeInUp 0.5s ease ${i * 0.1}s forwards; opacity: 0;">
                <div class="flex items-center gap-2.5 mb-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: ${problem.color}15; border: 1px solid ${problem.color}25;">
                        <i data-lucide="${problem.icon}" class="w-4.5 h-4.5" style="color: ${problem.color};"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-heading font-bold text-white text-[14px]">${problem.title}</h4>
                    </div>
                </div>
                <div class="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold" style="background: ${problem.color}15; color: ${problem.color}; border: 1px solid ${problem.color}20;">
                    <i data-lucide="indian-rupee" class="w-3 h-3"></i> ${problem.cost}
                </div>
                <p class="text-[12px] text-slate-400 leading-relaxed">${problem.description}</p>
            </div>
        `).join('');

        lucide.createIcons();
    },

    // === Government Milestones ===
    renderGovtMilestones: () => {
        const data = TrafficData.governmentInitiatives;
        const container = document.getElementById('govt-milestones-container');
        if (!container) return;

        container.innerHTML = data.milestones.map((m, i) => `
            <div class="bg-white/[0.08] rounded-xl px-3 py-2.5 border border-white/[0.08] text-center hover:bg-white/[0.12] transition-all"
                 style="animation: fadeInUp 0.4s ease ${i * 0.08}s forwards; opacity: 0;">
                <i data-lucide="${m.icon}" class="w-4 h-4 mx-auto mb-1.5 text-sky-400"></i>
                <p class="text-[12px] font-heading font-bold text-white">${m.label}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">${m.status}</p>
            </div>
        `).join('');

        document.getElementById('govt-summary').textContent = data.summary;
        lucide.createIcons();
    },

    // === Upcoming Projects ===
    renderUpcomingProjects: () => {
        const projects = TrafficData.upcomingProjects;
        const container = document.getElementById('projects-container');
        if (!container) return;

        container.innerHTML = projects.map((project, i) => {
            const statusNeon = {
                'Under Construction': '#fde047',
                'DPR Approved': '#22d3ee',
                'Pilot Phase': '#4ade80',
                'Tendering': '#c4b5fd',
                'Feasibility Study': '#f472b6'
            };
            const sc = statusNeon[project.status] || '#c4b5fd';

            return `
                <div class="card-flat overflow-hidden" style="animation: fadeInUp 0.5s ease ${i * 0.1}s forwards; opacity: 0; border-left: 3px solid ${project.color}60;">
                    <div class="p-5">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0">
                                <div class="w-11 h-11 rounded-[8px] flex items-center justify-center" style="background:${project.color}12;border:2px solid ${project.color}30;box-shadow:2px 2px 0 rgba(0,0,0,0.5)">
                                    <i data-lucide="${project.icon}" class="w-5 h-5" style="color:${project.color}"></i>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 class="font-heading font-bold text-[15px]" style="color:#f1f5f9">${project.title}</h4>
                                    <span class="tag" style="background:${sc}15;color:${sc};border:1.5px solid ${sc}35">
                                        <span class="w-1.5 h-1.5 rounded-full inline-block" style="background:${sc}"></span> ${project.status}
                                    </span>
                                </div>
                                <div class="flex items-center gap-3 text-[11px] font-medium mb-3" style="color:#475569">
                                    <span class="flex items-center gap-1"><i data-lucide="building-2" class="w-3 h-3"></i> ${project.authority}</span>
                                    <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${project.timeline}</span>
                                </div>
                                <p class="text-[13px] leading-relaxed mb-4" style="color:#64748b">${project.description}</p>

                                <div class="mb-4">
                                    <div class="flex justify-between section-label mb-1.5">
                                        <span>Progress</span>
                                        <span class="data-mono" style="color:${project.color}">${project.progress}%</span>
                                    </div>
                                    <div class="progress-track h-2">
                                        <div class="progress-fill h-full" style="width:${project.progress}%;background:${project.color};box-shadow:0 0 8px ${project.color}60;animation:progressFill 1.2s ease;"></div>
                                    </div>
                                </div>

                                <div class="grid sm:grid-cols-2 gap-3">
                                    <div class="construction-warning p-3">
                                        <div class="flex items-center gap-1.5 mb-1.5">
                                            <i data-lucide="triangle-alert" class="w-3.5 h-3.5" style="color:#fde047"></i>
                                            <span class="section-label" style="color:#fde04790">During Construction</span>
                                        </div>
                                        <p class="text-[11px] leading-relaxed" style="color:#64748b">${project.trafficDuringConstruction}</p>
                                    </div>
                                    <div class="p-3 rounded-[8px]" style="background:rgba(74,222,128,0.06);border:1.5px solid rgba(74,222,128,0.2)">
                                        <div class="flex items-center gap-1.5 mb-1.5">
                                            <i data-lucide="check-circle-2" class="w-3.5 h-3.5" style="color:#4ade80"></i>
                                            <span class="section-label" style="color:#4ade8090">After Completion</span>
                                        </div>
                                        <p class="text-[11px] leading-relaxed" style="color:#64748b">${project.postCompletionBenefit}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    },

    // === Report List ===
    renderReports: () => {
        const list = document.getElementById('reports-list');
        const rules = TrafficData.aiSeverityRules;
        list.innerHTML = TrafficData.reports.map((report, i) => {
            const ai = rules[report.type] || rules['Others'];
            const severityClass = {
                'Critical': 'severity-critical',
                'High': 'severity-high',
                'Medium': 'severity-medium',
                'Low': 'severity-low'
            }[ai.severity] || 'severity-medium';
            const weightColor = ai.weight >= 80 ? '#ef4444' : ai.weight >= 50 ? '#f59e0b' : '#22c55e';
            const hasDesc = report.description && report.description.trim().length > 0;
            const hasImg = report.hasImage || report.imageData;

            return `
            <div class="report-item" id="report-item-${report.id}" style="animation: fadeInUp 0.4s ease ${i * 0.08}s forwards; opacity: 0;">
                <!-- Clickable Row -->
                <div class="report-row card p-4 flex gap-4" onclick="ReportLogic.toggleReportDetail(${report.id})" style="margin-bottom: 8px;">
                    <div class="flex-shrink-0">
                        <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-300 border border-slate-700/50">
                            <i data-lucide="${ReportLogic.getIcon(report.type)}" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="text-[13px] font-heading font-semibold text-slate-100">${report.type}</p>
                            <span class="px-2 py-0.5 rounded-md text-[9px] font-bold ${severityClass} shadow-sm">${ai.severity}</span>
                        </div>
                        <p class="text-[12px] text-slate-400 truncate mt-0.5">${report.location}</p>
                        <!-- Weight Bar -->
                        <div class="flex items-center gap-2 mt-1.5">
                            <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden" style="max-width:120px;">
                                <div class="h-full rounded-full" style="width:${ai.weight}%; background:${weightColor}; transition: width 0.8s ease;"></div>
                            </div>
                            <span class="text-[9px] font-bold" style="color:${weightColor};">${ai.weight}/100</span>
                            <span class="text-[9px] text-slate-300 font-medium">· ${ai.category}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-1.5">
                        <span class="inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${ReportLogic.getStatusColor(report.status)}">${report.status}</span>
                        <span class="text-[10px] text-slate-300 font-medium">${report.time}</span>
                        <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-300 expand-icon"></i>
                    </div>
                </div>
                <!-- Expandable Detail Panel -->
                <div class="report-detail" id="report-detail-${report.id}">
                    <div class="bg-gradient-to-br from-slate-800/80 to-indigo-900/30 rounded-2xl p-4 border border-slate-700 space-y-3 mt-2">
                        <!-- Location -->
                        <div class="flex items-start gap-2">
                            <i data-lucide="map-pin" class="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0"></i>
                            <div>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Location</span>
                                <p class="text-[13px] text-slate-200 font-medium">${report.location}</p>
                            </div>
                        </div>
                        ${hasDesc ? `
                        <!-- Description -->
                        <div class="flex items-start gap-2">
                            <i data-lucide="file-text" class="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0"></i>
                            <div>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Description</span>
                                <p class="text-[13px] text-slate-300 leading-relaxed">${report.description}</p>
                            </div>
                        </div>
                        ` : `
                        <div class="flex items-center gap-2 text-[12px] text-slate-400 italic">
                            <i data-lucide="info" class="w-3.5 h-3.5"></i> No description provided
                        </div>
                        `}
                        ${hasImg ? `
                        <!-- Attached Image -->
                        <div class="flex items-start gap-2">
                            <i data-lucide="image" class="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0"></i>
                            <div class="flex-1">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Attached Image</span>
                                ${report.imageData ? `
                                <div class="mt-1.5 rounded-xl overflow-hidden border border-slate-700 shadow-sm">
                                    <img src="${report.imageData}" alt="Report evidence" class="w-full h-[160px] object-cover">
                                </div>
                                ` : `
                                <div class="mt-1.5 bg-slate-800 rounded-xl p-3 flex items-center gap-2 border border-slate-700">
                                    <i data-lucide="image" class="w-5 h-5 text-slate-400"></i>
                                    <span class="text-[12px] text-slate-300 font-medium">${report.image}</span>
                                </div>
                                `}
                            </div>
                        </div>
                        ` : `
                        <div class="flex items-center gap-2 text-[12px] text-slate-400 italic">
                            <i data-lucide="image-off" class="w-3.5 h-3.5"></i> No image attached
                        </div>
                        `}
                        <!-- AI Analysis Shortcut -->
                        <div class="flex items-center gap-2 pt-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">AI Category:</span>
                            <span class="text-[11px] font-heading font-bold text-brand-400 bg-brand-900/40 px-2 py-0.5 rounded-md border border-brand-800">${ai.category}</span>
                            <span class="text-[10px] text-slate-400">·</span>
                            <span class="text-[10px] text-slate-400">Est. resolution: <strong class="text-slate-200">${ai.estimatedResolution}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        lucide.createIcons();
    },

    getStatusColor: (s) => s === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : s === 'In Progress' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200',

    getIcon: (t) => {
        const iconMap = {
            'Pothole': 'alert-circle',
            'Illegal Parking': 'ban',
            'Road Obstruction': 'construction',
            'Broken Signal': 'signal',
            'Waterlogging': 'droplets',
            'Streetlight Issue': 'lightbulb-off',
            'Footpath Damage': 'footprints',
            'Dangerous Driving': 'siren',
            'Noise Pollution': 'volume-x',
            'Garbage Dump': 'trash-2',
            'Open Manhole': 'circle-alert',
            'Others': 'message-circle-plus'
        };
        return iconMap[t] || 'alert-circle';
    },

    // === Report Modal: Issue Types ===
    renderModalIssueTypes: () => {
        const container = document.getElementById('modal-issue-types');
        if (!container) return;

        container.innerHTML = TrafficData.issueTypes.map(item => `
            <button onclick="ReportLogic.selectType('${item.type}')"
                class="type-btn-new" data-type="${item.type}" id="type-btn-${item.type.replace(/\s+/g, '-')}">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                <span class="text-[10px] leading-tight">${item.type}</span>
            </button>
        `).join('');

        lucide.createIcons();
    },

    selectType: (type) => {
        ReportLogic.selectedType = type;
        document.querySelectorAll('.type-btn-new').forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    },

    toggleReportDetail: (reportId) => {
        const detail = document.getElementById(`report-detail-${reportId}`);
        const row = detail.previousElementSibling;
        if (detail.classList.contains('open')) {
            detail.classList.remove('open');
            row.classList.remove('expanded');
        } else {
            // Close all other open details first
            document.querySelectorAll('.report-detail.open').forEach(el => {
                el.classList.remove('open');
                el.previousElementSibling.classList.remove('expanded');
            });
            detail.classList.add('open');
            row.classList.add('expanded');
        }
    },

    handleImageUpload: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            ReportLogic.uploadedImageData = e.target.result;
            // Show preview
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-file-name').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
            document.getElementById('image-preview-wrapper').classList.remove('hidden');
            document.getElementById('upload-zone').classList.add('hidden');
            lucide.createIcons();
        };
        reader.readAsDataURL(file);
    },

    removeUploadedImage: () => {
        ReportLogic.uploadedImageData = null;
        document.getElementById('image-preview-wrapper').classList.add('hidden');
        document.getElementById('upload-zone').classList.remove('hidden');
        document.getElementById('file-upload').value = '';
    },

    submitReport: () => {
        const zone     = (document.getElementById('report-zone')?.value     || '').trim();
        const building = (document.getElementById('report-building')?.value || '').trim();
        const description = document.getElementById('report-description').value;

        // Build a combined location string
        const location = [zone, building].filter(Boolean).join(' — ') || zone || building;

        if (!ReportLogic.selectedType || !location) {
            alert('Please select an issue type and choose a zone.');
            return;
        }

        const reportType = ReportLogic.selectedType;

        TrafficData.reports.unshift({
            id: Date.now(),
            type: reportType,
            location,
            description: description || '',
            status: 'Reported',
            time: 'Just now',
            image: ReportLogic.uploadedImageData ? 'uploaded.jpg' : '',
            hasImage: !!ReportLogic.uploadedImageData,
            imageData: ReportLogic.uploadedImageData || null
        });

        // Stats cards removed from dashboard

        ReportLogic.renderReports();
        Navigation.closeReportModal();

        // Refresh map report markers so new report appears instantly
        if (MapLogic.map) {
            MapLogic.removeReportMarkers();
            MapLogic.addReportMarkers();
        }

        // Show AI Analysis after a brief delay
        setTimeout(() => {
            Navigation.openAIModal(reportType, location);
        }, 400);
    },

    // === AI Severity Analysis ===
    showAIAnalysis: (reportType, location) => {
        const rules = TrafficData.aiSeverityRules;
        const analysis = rules[reportType] || rules['Others'];

        const severityClass = {
            'Critical': 'severity-critical',
            'High': 'severity-high',
            'Medium': 'severity-medium',
            'Low': 'severity-low'
        }[analysis.severity] || 'severity-medium';

        const weightColor = analysis.weight >= 80 ? '#ef4444' : analysis.weight >= 50 ? '#f59e0b' : '#22c55e';

        document.getElementById('ai-report-type').innerHTML = `
            <div class="flex items-center gap-2 mt-2">
                <i data-lucide="${ReportLogic.getIcon(reportType)}" class="w-4 h-4 text-slate-300"></i>
                <span class="font-heading font-bold text-white">${reportType}</span>
                <span class="text-slate-500">·</span>
                <span class="text-slate-400 text-[12px]">${location}</span>
            </div>
        `;

        document.getElementById('ai-analysis-body').innerHTML = `
            <!-- Severity Badge -->
            <div class="flex items-center gap-3">
                <span class="px-4 py-2 rounded-xl text-[13px] font-bold ${severityClass} shadow-lg">
                    ${analysis.severity} Severity
                </span>
                <span class="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    ${analysis.urgency}
                </span>
            </div>

            <!-- Priority Weight Gauge -->
            <div class="card-flat p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Priority Weight</span>
                    <span class="text-[20px] font-heading font-bold" style="color: ${weightColor};">${analysis.weight}/100</span>
                </div>
                <div class="progress-track h-2.5">
                    <div class="progress-fill h-full rounded-full" style="width: ${analysis.weight}%; background: linear-gradient(90deg, ${weightColor}, ${weightColor}cc); animation: progressFill 1s ease;"></div>
                </div>
                <p class="text-[10px] text-slate-400 mt-2">Higher weight = higher priority for resolution</p>
            </div>

            <!-- Category -->
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Category:</span>
                <span class="text-[12px] font-heading font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">${analysis.category}</span>
            </div>

            <!-- AI Response -->
            <div class="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-4 border border-slate-100">
                <div class="flex items-center gap-2 mb-2">
                    <i data-lucide="sparkles" class="w-4 h-4 text-brand-500"></i>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">AI Assessment</span>
                </div>
                <p class="text-[13px] text-slate-700 leading-relaxed">${analysis.response}</p>
            </div>

            <!-- Estimated Resolution -->
            <div class="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <i data-lucide="timer" class="w-4 h-4 text-emerald-500"></i>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Est. Resolution</span>
                    <p class="text-[13px] font-heading font-bold text-emerald-700">${analysis.estimatedResolution}</p>
                </div>
            </div>
        `;

        lucide.createIcons();
    }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    MapLogic.init();
    GreenSlot.init();
    ChartLogic.renderAIInsights();
    ReportLogic.init();
    RickshawLogic.init();
    MapEnhanced.populateDirections();

    // Refresh green slot every 60 seconds
    setInterval(() => {
        GreenSlot.renderAreas();
        ChartLogic.renderAIInsights();
    }, 60000);

    setTimeout(() => lucide.createIcons(), 300);
});
