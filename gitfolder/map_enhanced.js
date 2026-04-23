/** Enhanced Map Logic v4.0 — Directions, AI tips, traffic zones, saturation */
const MapEnhanced = {
    trafficCircles: [],
    routeLine: null,
    saturationVisible: false,

    addTrafficZones(map) {
        this.removeTrafficZones(map);
        const time = GreenSlot.currentTime || '12:00';
        TrafficData.areas.forEach((area, areaIdx) => {
            const traffic = TrafficData.getAreaTraffic(area, time);
            const color = traffic.status === 'heavy' ? '#ef4444' : traffic.status === 'moderate' ? '#f59e0b' : '#10b981';
            const radius = traffic.status === 'heavy' ? 350 : traffic.status === 'moderate' ? 250 : 150;
            const opacity = traffic.status === 'heavy' ? 0.3 : traffic.status === 'moderate' ? 0.2 : 0.1;
            const circle = L.circle([area.lat, area.lng], {
                color, fillColor: color, fillOpacity: opacity, radius, weight: traffic.status === 'heavy' ? 3 : 2,
                className: 'traffic-zone-circle'
            }).addTo(map);
            const statusEmoji = traffic.status === 'heavy' ? '🔴' : traffic.status === 'moderate' ? '🟡' : '🟢';

            // Check for nearby reports in this area
            const nearbyReports = TrafficData.reports.filter((r, i) => {
                const matchIdx = i % TrafficData.areas.length;
                return matchIdx === areaIdx;
            });
            let reportsHTML = '';
            if (nearbyReports.length > 0) {
                reportsHTML = `<div style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:8px">
                    <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚠️ Active Issues Nearby</div>
                    ${nearbyReports.map(r => {
                    const sColor = r.status === 'Resolved' ? '#059669' : r.status === 'In Progress' ? '#d97706' : '#dc2626';
                    const sBg = r.status === 'Resolved' ? '#ecfdf5' : r.status === 'In Progress' ? '#fffbeb' : '#fef2f2';
                    const sIcon = r.status === 'Resolved' ? '✅' : r.status === 'In Progress' ? '🔧' : '🔴';
                    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                            <div style="display:flex;align-items:center;gap:4px">
                                <span style="font-size:10px">${sIcon}</span>
                                <span style="font-size:11px;font-weight:600;color:#334155">${r.type}</span>
                            </div>
                            <button onclick="MapLogic.viewReportDetail(${r.id})" style="font-size:9px;font-weight:700;color:#4f46e5;background:none;border:none;cursor:pointer;text-decoration:underline;font-family:'Inter'">Details →</button>
                        </div>`;
                }).join('')}
                </div>`;
            }

            circle.bindPopup(`
                <div style="font-family:'Inter',sans-serif;min-width:220px;padding:4px 0">
                    <h3 style="font-family:'Space Grotesk';font-weight:700;color:#0f172a;margin:0 0 6px;font-size:14px">${area.name}</h3>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                        <span style="font-size:12px">${statusEmoji}</span>
                        <span style="font-size:11px;font-weight:700;color:${color};text-transform:uppercase">${traffic.status}</span>
                        <span style="font-size:11px;color:#94a3b8">·</span>
                        <span style="font-size:11px;font-weight:700;color:${color}">${traffic.load}%</span>
                    </div>
                    <div style="background:#f8fafc;border-radius:10px;padding:8px;margin-bottom:8px">
                        <p style="font-size:11px;color:#64748b;margin:0;line-height:1.4">${traffic.reason}</p>
                    </div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px">
                        ${GreenSlot.getTypeLabel(area.type)}
                    </div>
                    ${reportsHTML}
                </div>
            `);
            this.trafficCircles.push(circle);
        });
    },

    removeTrafficZones(map) {
        this.trafficCircles.forEach(c => map.removeLayer(c));
        this.trafficCircles = [];
    },

    populateDirections() {
        const fromSel = document.getElementById('dir-from');
        const toSel = document.getElementById('dir-to');
        if (!fromSel || !toSel) return;
        const names = TrafficData.areas.map(a => a.name);
        const opts = '<option value="">Select location</option>' + names.map(n => `<option value="${n}">${n}</option>`).join('');
        fromSel.innerHTML = opts;
        toSel.innerHTML = opts;
    },

    getDirections() {
        const from = document.getElementById('dir-from').value;
        const to = document.getElementById('dir-to').value;
        const result = document.getElementById('dir-result');
        if (!from || !to || from === to) { result.innerHTML = ''; return; }

        const route = TrafficData.directionRoutes.find(r =>
            (r.from === from && r.to === to) || (r.from === to && r.to === from)
        );
        const fromArea = TrafficData.areas.find(a => a.name === from);
        const toArea = TrafficData.areas.find(a => a.name === to);
        const time = GreenSlot.currentTime || '12:00';
        const fromTraffic = fromArea ? TrafficData.getAreaTraffic(fromArea, time) : null;
        const toTraffic = toArea ? TrafficData.getAreaTraffic(toArea, time) : null;

        if (route) {
            const fromColor = fromTraffic ? (fromTraffic.status === 'heavy' ? '#ef4444' : fromTraffic.status === 'moderate' ? '#f59e0b' : '#10b981') : '#64748b';
            const toColor = toTraffic ? (toTraffic.status === 'heavy' ? '#ef4444' : toTraffic.status === 'moderate' ? '#f59e0b' : '#10b981') : '#64748b';
            result.innerHTML = `
            <div class="card-flat p-4 space-y-3" style="animation:fadeInUp .3s ease">
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-slate-50 rounded-xl p-2.5"><p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Distance</p><p class="text-[16px] font-heading font-bold text-slate-800 mt-0.5">${route.distance}</p></div>
                    <div class="bg-emerald-50 rounded-xl p-2.5"><p class="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Normal</p><p class="text-[16px] font-heading font-bold text-emerald-600 mt-0.5">${route.normalTime}</p></div>
                    <div class="bg-red-50 rounded-xl p-2.5"><p class="text-[9px] font-bold text-red-400 uppercase tracking-wider">In Traffic</p><p class="text-[16px] font-heading font-bold text-red-500 mt-0.5">${route.trafficTime}</p></div>
                </div>
                <div class="flex gap-2">
                    <div class="flex-1 rounded-xl p-2.5 border" style="border-color:${fromColor}30;background:${fromColor}08">
                        <p class="text-[9px] font-bold text-slate-400 uppercase">From</p>
                        <p class="text-[11px] font-semibold text-slate-700">${from}</p>
                        ${fromTraffic ? `<span class="text-[10px] font-bold" style="color:${fromColor}">${fromTraffic.load}% load</span>` : ''}
                    </div>
                    <div class="flex-1 rounded-xl p-2.5 border" style="border-color:${toColor}30;background:${toColor}08">
                        <p class="text-[9px] font-bold text-slate-400 uppercase">To</p>
                        <p class="text-[11px] font-semibold text-slate-700">${to}</p>
                        ${toTraffic ? `<span class="text-[10px] font-bold" style="color:${toColor}">${toTraffic.load}% load</span>` : ''}
                    </div>
                </div>
                <div class="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-xl p-3 border border-brand-100">
                    <div class="flex items-center gap-2 mb-1"><i data-lucide="sparkles" class="w-4 h-4 text-brand-500"></i><span class="text-[10px] font-bold text-brand-600 uppercase tracking-wider">AI Route Tip</span></div>
                    <p class="text-[12px] text-slate-700 leading-relaxed">${route.aiTip}</p>
                </div>
                <!-- Check Mobility Button -->
                <button type="button" onclick="MapEnhanced.checkRouteMobility('${from}', '${to}')" class="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-[8px] border" style="border-color:var(--border);background:rgba(255,255,255,0.03);color:#f1f5f9;font-size:12px;font-weight:600;transition:all 0.2s">
                    <i data-lucide="indian-rupee" class="w-4 h-4 text-emerald-400"></i> Check Mobility & Fares
                </button>
            </div>`;
        } else {
            const dist = fromArea && toArea ? (Math.sqrt(Math.pow(fromArea.lat - toArea.lat, 2) + Math.pow(fromArea.lng - toArea.lng, 2)) * 111).toFixed(1) : '?';
            result.innerHTML = `
            <div class="card-flat p-4" style="animation:fadeInUp .3s ease">
                <div class="text-center mb-3"><p class="text-[11px] text-slate-400">Estimated distance: <strong class="text-slate-700">${dist} km</strong></p></div>
                <div class="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div class="flex items-center gap-2 mb-1"><i data-lucide="lightbulb" class="w-4 h-4 text-amber-500"></i><span class="text-[10px] font-bold text-amber-600 uppercase">AI Suggestion</span></div>
                    <p class="text-[12px] text-slate-600">Check individual area cards for current traffic. ${fromTraffic && fromTraffic.status === 'heavy' ? 'Starting area is congested — wait or use alternate routes.' : 'Starting area looks clear — good to go!'}</p>
                </div>
            </div>`;
        }
        lucide.createIcons();
        // Draw line on map
        if (fromArea && toArea && MapLogic.map) {
            if (this.routeLine) MapLogic.map.removeLayer(this.routeLine);
            this.routeLine = L.polyline([[fromArea.lat, fromArea.lng], [toArea.lat, toArea.lng]], {
                color: '#6366f1', weight: 4, opacity: 0.7, dashArray: '10,8'
            }).addTo(MapLogic.map);
            MapLogic.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });
        }
    },

    checkRouteMobility(from, to) {
        // 1. Switch to the Mobility Tab (ID is 'rickshaw')
        Navigation.switchTab('rickshaw');
        
        // 2. Wait for tab transition, then set values and update fare
        setTimeout(() => {
            const fromSelect = document.getElementById('fare-from');
            const toSelect = document.getElementById('fare-to');
            if (fromSelect && toSelect) {
                // Remove trailing whitespace or fix slight name mismatches if any
                Array.from(fromSelect.options).forEach(opt => { if (opt.value.includes(from) || from.includes(opt.value)) fromSelect.value = opt.value; });
                Array.from(toSelect.options).forEach(opt => { if (opt.value.includes(to) || to.includes(opt.value)) toSelect.value = opt.value; });
                
                // Trigger the fare update
                RickshawLogic.updateFare();
                
                // Scroll specifically to the fare estimator section smoothly
                const fareSection = fromSelect.closest('.card-flat');
                if (fareSection) {
                    fareSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a brief highlight effect
                    fareSection.style.transition = 'box-shadow 0.3s ease';
                    fareSection.style.boxShadow = '0 0 0 2px var(--neon-purple)';
                    setTimeout(() => { fareSection.style.boxShadow = 'none'; }, 1500);
                }
            }
        }, 150);
    },

    renderSaturation() {
        const container = document.getElementById('saturation-container');
        if (!container) return;
        const time = GreenSlot.currentTime || '12:00';
        const areas = TrafficData.areas.map(area => ({ area, traffic: TrafficData.getAreaTraffic(area, time) }));
        areas.sort((a, b) => b.traffic.load - a.traffic.load);

        container.innerHTML = areas.map((item, i) => {
            const { area, traffic } = item;
            const color = traffic.load > 70 ? '#ef4444' : traffic.load > 40 ? '#f59e0b' : '#10b981';
            const chipClass = traffic.load > 70 ? 'chip-high' : traffic.load > 40 ? 'chip-medium' : 'chip-low';
            const statusLabel = traffic.load > 70 ? 'Heavy' : traffic.load > 40 ? 'Moderate' : 'Clear';
            return `
            <div class="card p-3 text-center" style="animation:fadeInUp .4s ease ${i * 0.04}s forwards;opacity:0">
                <div class="w-14 h-14 mx-auto mb-2 relative">
                    <canvas id="sat-gauge-${i}" width="56" height="56"></canvas>
                    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
                        <span class="gauge-value" style="font-size:14px;color:#f1f5f9">${traffic.load}%</span>
                    </div>
                </div>
                <p style="font-family:'Space Grotesk';font-size:10px;font-weight:600;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${area.name}">${area.name.length > 16 ? area.name.slice(0, 14) + '…' : area.name}</p>
                <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full ${chipClass}" style="text-transform:uppercase;letter-spacing:0.3px">${statusLabel}</span>
            </div>`;
        }).join('');

        // Draw gauges
        setTimeout(() => {
            areas.forEach((item, i) => {
                const canvas = document.getElementById(`sat-gauge-${i}`);
                if (!canvas) return;
                const color = item.traffic.load > 70 ? '#ef4444' : item.traffic.load > 40 ? '#f59e0b' : '#10b981';
                new Chart(canvas.getContext('2d'), {
                    type: 'doughnut',
                    data: { datasets: [{ data: [item.traffic.load, 100 - item.traffic.load], backgroundColor: [color, 'rgba(255,255,255,0.1)'], borderWidth: 0 }] },
                    options: { cutout: '76%', responsive: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, rotation: -90, circumference: 180 }
                });
            });
        }, 100);
    }
};
