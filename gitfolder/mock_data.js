// MOCK DATA - MB-Flow Traffic Engine v4.0
// Realistic time-based traffic simulation for Mira-Bhayandar

const TrafficData = {

    // ============================
    // AREA DATABASE WITH TIME-BASED TRAFFIC
    // ============================
    // Each area has: schedules (time ranges that cause traffic), reasons, and peak loads
    areas: [
        // === COLLEGES ===
        {
            id: 'area-lrt', name: 'LR Tiwari Engineering College', type: 'college',
            lat: 19.2820, lng: 72.8410, icon: 'graduation-cap',
            schedules: [
                { start: '07:45', end: '09:30', load: 90, reason: 'College starts at 9:15 AM — students rushing in via autos & buses, heavy near gate' },
                { start: '09:30', end: '11:00', load: 45, reason: 'Post-entry settling — late arrivals and faculty commuting' },
                { start: '12:45', end: '13:45', load: 58, reason: 'Lunch break — students heading out for food, auto stands active' },
                { start: '15:30', end: '17:45', load: 85, reason: 'College dispersal — all batches leaving, auto stands overflowing' },
                { start: '17:45', end: '19:00', load: 50, reason: 'Late students & tuition traffic — moderate congestion near college' },
            ],
            baseLoad: 15,
            bestAlternateRoute: 'Use Mira-Bhayandar Road via Shanti Park instead of main college road',
            upcomingEvent: null,
        },
        {
            id: 'area-pillai', name: 'Pillai College (Panvel Rd)', type: 'college',
            lat: 19.2930, lng: 72.8480, icon: 'graduation-cap',
            schedules: [
                { start: '07:30', end: '09:15', load: 85, reason: 'Morning college rush — buses & two-wheelers choke the entry road' },
                { start: '09:15', end: '10:30', load: 42, reason: 'Late arrivals — faculty and staff vehicles still entering' },
                { start: '12:15', end: '13:30', load: 52, reason: 'Lunch crowd moving to nearby eateries, food stalls busy' },
                { start: '15:30', end: '17:30', load: 82, reason: 'Evening dispersal — heavy rickshaw demand at exit gate' },
                { start: '17:30', end: '18:45', load: 48, reason: 'Tuition & coaching classes start — second wave of student traffic' },
            ],
            baseLoad: 16,
            bestAlternateRoute: 'Approach from Bhayandar East side road to avoid main junction',
            upcomingEvent: null,
        },
        {
            id: 'area-spit', name: 'Smt. Indira Gandhi College', type: 'college',
            lat: 19.2770, lng: 72.8590, icon: 'graduation-cap',
            schedules: [
                { start: '08:15', end: '10:00', load: 80, reason: 'College entry rush — auto-rickshaws lining up at gate, road narrows' },
                { start: '12:00', end: '13:00', load: 45, reason: 'Midday break — moderate movement near canteen and main gate' },
                { start: '15:00', end: '16:45', load: 76, reason: 'Afternoon batch leaving — congestion near Mira Road station link' },
                { start: '16:45', end: '18:00', load: 42, reason: 'Evening classes ending — lighter but steady outflow' },
            ],
            baseLoad: 18,
            bestAlternateRoute: 'Take service road parallel to main Mira Road for smoother flow',
            upcomingEvent: null,
        },

        // === SCHOOLS ===
        {
            id: 'area-ryan', name: 'Ryan International School', type: 'school',
            lat: 19.2850, lng: 72.8530, icon: 'school',
            schedules: [
                { start: '06:45', end: '08:30', load: 88, reason: 'School buses & parents dropping kids — double parking blocks both lanes' },
                { start: '08:30', end: '09:30', load: 45, reason: 'Late arrivals — some parents still dropping, school zone still slow' },
                { start: '12:00', end: '13:00', load: 52, reason: 'Primary section half-day dismissal — parents queuing for pickup' },
                { start: '13:15', end: '14:45', load: 82, reason: 'Full school dispersal — school buses block half the road, autos packed' },
                { start: '15:30', end: '17:00', load: 48, reason: 'After-school activities end — sports kids being picked up' },
            ],
            baseLoad: 12,
            bestAlternateRoute: 'Use inner Sector 7 road instead of main school road during drop/pick hours',
            upcomingEvent: null,
        },
        {
            id: 'area-vibgyor', name: 'Vibgyor High School', type: 'school',
            lat: 19.2960, lng: 72.8550, icon: 'school',
            schedules: [
                { start: '06:50', end: '08:30', load: 85, reason: 'School start — parents & buses competing for road space near Bhayandar' },
                { start: '08:30', end: '09:15', load: 40, reason: 'Late drop-offs — traffic easing but zone still congested' },
                { start: '13:30', end: '15:15', load: 80, reason: 'School dismissal — massive pickup queue on narrow road, buses everywhere' },
                { start: '16:00', end: '17:30', load: 45, reason: 'After-school activities and tuition traffic — moderate load' },
            ],
            baseLoad: 12,
            bestAlternateRoute: 'Bypass via Bhayandar station road, rejoin after school zone',
            upcomingEvent: null,
        },
        {
            id: 'area-dav', name: 'DAV Public School', type: 'school',
            lat: 19.2740, lng: 72.8470, icon: 'school',
            schedules: [
                { start: '07:00', end: '08:45', load: 80, reason: 'Morning school rush — autos, vans & parents clog the lane' },
                { start: '08:45', end: '09:30', load: 38, reason: 'Assembly time — traffic calming down but zone still active' },
                { start: '12:30', end: '14:15', load: 75, reason: 'School dismissal — heavy foot traffic mixes with vehicles near gate' },
                { start: '15:00', end: '16:30', load: 42, reason: 'Coaching class students arriving — secondary traffic wave' },
            ],
            baseLoad: 10,
            bestAlternateRoute: 'Take the Kanakia bypass road instead of school lane',
            upcomingEvent: null,
        },

        // === CORPORATE / OFFICES ===
        {
            id: 'area-tcs', name: 'TCS Olympus (IT Park)', type: 'corporate',
            lat: 19.2890, lng: 72.8620, icon: 'building-2',
            schedules: [
                { start: '08:00', end: '10:15', load: 90, reason: 'Corporate office start — car traffic surges as employees arrive from all directions' },
                { start: '10:15', end: '12:00', load: 42, reason: 'Post-login period — delivery vehicles & vendor traffic near IT park' },
                { start: '12:30', end: '14:00', load: 55, reason: 'Lunch hour — employees heading to nearby restaurants, food trucks active' },
                { start: '17:00', end: '20:00', load: 92, reason: 'Office dispersal — massive outflow of cars & cabs onto main road, peak Ola/Uber surge' },
                { start: '20:00', end: '21:30', load: 55, reason: 'Late shift workers leaving — moderate but steady traffic near campus exit' },
            ],
            baseLoad: 22,
            bestAlternateRoute: 'Use the back road via Shanti Nagar to avoid IT park junction traffic',
            upcomingEvent: null,
        },
        {
            id: 'area-reliance', name: 'Reliance Corporate Park', type: 'corporate',
            lat: 19.3020, lng: 72.8570, icon: 'building-2',
            schedules: [
                { start: '08:15', end: '10:30', load: 88, reason: 'Morning office rush — company buses & cars flood the area simultaneously' },
                { start: '12:00', end: '13:30', load: 50, reason: 'Lunch break — employees ordering food, delivery bikes crowding lane' },
                { start: '17:30', end: '20:15', load: 92, reason: 'Evening office exit — peak cab bookings cause standstill near main gate' },
                { start: '20:15', end: '21:45', load: 48, reason: 'Extended shift employees leaving — lighter but sustained outflow' },
            ],
            baseLoad: 20,
            bestAlternateRoute: 'Avoid Maxus Mall road, take highway service road instead',
            upcomingEvent: null,
        },
        {
            id: 'area-lodha', name: 'Lodha Business District', type: 'corporate',
            lat: 19.2980, lng: 72.8510, icon: 'building-2',
            schedules: [
                { start: '08:30', end: '10:45', load: 82, reason: 'Office goers from nearby residential areas driving in simultaneously' },
                { start: '12:30', end: '13:45', load: 48, reason: 'Lunch traffic — food delivery and employee movement to restaurants' },
                { start: '17:30', end: '19:45', load: 88, reason: 'Evening rush — cars, autos, buses all compete for road space near towers' },
                { start: '19:45', end: '21:00', load: 50, reason: 'Late workers and overtime staff departing — moderate traffic' },
            ],
            baseLoad: 18,
            bestAlternateRoute: 'Use Bhayandar Flyover route to skip the business district area',
            upcomingEvent: null,
        },

        // === MARKETS / MALLS / TRANSPORT ===
        {
            id: 'area-golden', name: 'Golden Nest Junction', type: 'market',
            lat: 19.2900, lng: 72.8500, icon: 'store',
            schedules: [
                { start: '07:00', end: '08:30', load: 52, reason: 'Early morning wholesale market — vegetable vendors setting up, trucks unloading' },
                { start: '09:30', end: '12:30', load: 72, reason: 'Morning retail market peak — shoppers, delivery vehicles, street vendors active' },
                { start: '12:30', end: '15:00', load: 48, reason: 'Afternoon lull — lunch time, some shops close temporarily' },
                { start: '16:30', end: '21:00', load: 90, reason: 'Evening bazaar peak — shops, street food, pedestrian overflow, rickshaws everywhere' },
                { start: '21:00', end: '22:30', load: 58, reason: 'Late evening — shops closing, but street food stalls still drawing crowds' },
            ],
            baseLoad: 32,
            bestAlternateRoute: 'Take inner lane through Sector 5 if heading towards Mira Road Station',
            upcomingEvent: { time: '10:00', label: 'Market opens — vegetable & grocery shops start, traffic builds up' },
        },
        {
            id: 'area-mira-stn', name: 'Mira Road Station', type: 'transport',
            lat: 19.2813, lng: 72.8557, icon: 'train-front',
            schedules: [
                { start: '06:30', end: '10:30', load: 95, reason: 'Morning train rush — auto/bus stands overloaded, platform exits choked by commuters' },
                { start: '10:30', end: '12:00', load: 48, reason: 'Mid-morning — off-peak trains, moderate rickshaw activity near station' },
                { start: '12:00', end: '14:00', load: 42, reason: 'Afternoon — fewer commuters, but delivery and errand traffic continues' },
                { start: '16:30', end: '21:30', load: 95, reason: 'Evening train arrival — commuters flooding out, massive auto queues, road fully packed' },
                { start: '21:30', end: '23:00', load: 55, reason: 'Late evening trains — still significant commuter outflow, autos running' },
            ],
            baseLoad: 38,
            bestAlternateRoute: 'If heading north, use SH-27 highway instead of station approach road',
            upcomingEvent: null,
        },
        {
            id: 'area-maxus', name: 'Maxus Mall & Surroundings', type: 'market',
            lat: 19.3050, lng: 72.8600, icon: 'shopping-bag',
            schedules: [
                { start: '10:30', end: '13:30', load: 55, reason: 'Late morning mall crowd — families & shoppers arriving, parking filling up' },
                { start: '13:30', end: '15:30', load: 42, reason: 'Afternoon period — lunch at food court, parking lot turning over' },
                { start: '15:30', end: '21:30', load: 85, reason: 'Evening mall rush — movies, dining, weekend shopping peak, parking overflow' },
                { start: '21:30', end: '22:30', load: 55, reason: 'Post-movie crowd — late shows ending, dinner crowd still dining' },
            ],
            baseLoad: 25,
            bestAlternateRoute: 'Approach from Bhayandar West side to avoid east-side mall traffic',
            upcomingEvent: { time: '16:00', label: 'Weekend evening rush expected — sales event at mall' },
        },
        {
            id: 'area-bhay-flyover', name: 'Bhayandar Flyover', type: 'transport',
            lat: 19.3000, lng: 72.8500, icon: 'route',
            schedules: [
                { start: '07:30', end: '10:30', load: 82, reason: 'Morning office traffic from both sides merging onto narrow flyover lanes' },
                { start: '10:30', end: '12:00', load: 42, reason: 'Mid-morning — commercial vehicles and delivery trucks using flyover' },
                { start: '12:00', end: '14:00', load: 38, reason: 'Afternoon — lighter traffic but ongoing through-traffic from highway' },
                { start: '16:30', end: '20:30', load: 88, reason: 'Evening return traffic — bottleneck at merge points, bumper-to-bumper' },
                { start: '20:30', end: '22:00', load: 52, reason: 'Late evening — moderate highway traffic, some long-distance vehicles' },
            ],
            baseLoad: 28,
            bestAlternateRoute: 'Use Bhayandar ground-level road if flyover is backed up',
            upcomingEvent: null,
        },
        {
            id: 'area-kanakia', name: 'Kanakia Road', type: 'mixed',
            lat: 19.2750, lng: 72.8650, icon: 'map-pin',
            schedules: [
                { start: '07:30', end: '09:45', load: 58, reason: 'Morning commuters heading towards station and offices via Kanakia' },
                { start: '11:00', end: '13:00', load: 42, reason: 'Midday — local shop traffic and residential movement' },
                { start: '17:00', end: '20:00', load: 65, reason: 'Evening return traffic + local market opens — moderate congestion' },
                { start: '20:00', end: '21:30', load: 42, reason: 'Late evening market wind-down — shoppers heading home' },
            ],
            baseLoad: 18,
            bestAlternateRoute: 'Kanakia is usually clear — a great alternative to Golden Nest route',
            upcomingEvent: { time: '17:00', label: 'Evening local market opens — mild traffic expected' },
        },
        {
            id: 'area-kashimira', name: 'Kashimira Junction', type: 'transport',
            lat: 19.2680, lng: 72.8440, icon: 'git-branch',
            schedules: [
                { start: '07:00', end: '10:30', load: 90, reason: 'Highway junction morning rush — vehicles merging from multiple directions, signal delays' },
                { start: '10:30', end: '12:30', load: 48, reason: 'Mid-morning — inter-city truck traffic, some slowdowns at junction' },
                { start: '12:30', end: '15:00', load: 42, reason: 'Afternoon through-traffic — moderate highway vehicles passing' },
                { start: '16:00', end: '21:00', load: 92, reason: 'Evening highway traffic — Thane/Borivali bound vehicles cause gridlock at junction' },
                { start: '21:00', end: '22:30', load: 55, reason: 'Late night highway traffic — long-distance vehicles, trucks returning, still busy for a junction' },
            ],
            baseLoad: 35,
            bestAlternateRoute: 'Take internal Mira Road sector roads if heading locally',
            upcomingEvent: null,
        },
    ],

    // Helper: Get current traffic for an area based on time
    getAreaTraffic: function (area, currentTime) {
        const [hours, minutes] = currentTime.split(':').map(Number);
        const timeMinutes = hours * 60 + minutes;

        let activeSchedule = null;
        let currentLoad = area.baseLoad;

        for (const schedule of area.schedules) {
            const [sH, sM] = schedule.start.split(':').map(Number);
            const [eH, eM] = schedule.end.split(':').map(Number);
            const startMin = sH * 60 + sM;
            const endMin = eH * 60 + eM;

            if (timeMinutes >= startMin && timeMinutes <= endMin) {
                activeSchedule = schedule;
                currentLoad = schedule.load;
                break;
            }
            // Ramp up 30 min before
            if (timeMinutes >= startMin - 30 && timeMinutes < startMin) {
                const progress = (timeMinutes - (startMin - 30)) / 30;
                currentLoad = Math.round(area.baseLoad + (schedule.load - area.baseLoad) * progress * 0.6);
                activeSchedule = { ...schedule, reason: `Building up: ${schedule.reason}`, load: currentLoad };
                break;
            }
            // Ramp down 20 min after
            if (timeMinutes > endMin && timeMinutes <= endMin + 20) {
                const progress = 1 - ((timeMinutes - endMin) / 20);
                currentLoad = Math.round(area.baseLoad + (schedule.load - area.baseLoad) * progress * 0.5);
                activeSchedule = { ...schedule, reason: `Clearing: ${schedule.reason}`, load: currentLoad };
                break;
            }
        }

        const status = currentLoad > 70 ? 'heavy' : (currentLoad > 40 ? 'moderate' : 'clear');

        return {
            load: currentLoad,
            status,
            activeSchedule,
            reason: activeSchedule ? activeSchedule.reason : 'No major activity — area is clear right now',
        };
    },

    // Find next traffic window (when area will become busy/clear)
    getNextTrafficChange: function (area, currentTime) {
        const [hours, minutes] = currentTime.split(':').map(Number);
        const timeMinutes = hours * 60 + minutes;

        // Find next upcoming schedule
        let nextBusy = null;
        let nextClear = null;

        for (const schedule of area.schedules) {
            const [sH, sM] = schedule.start.split(':').map(Number);
            const [eH, eM] = schedule.end.split(':').map(Number);
            const startMin = sH * 60 + sM;
            const endMin = eH * 60 + eM;

            if (startMin > timeMinutes && !nextBusy) {
                nextBusy = { time: schedule.start, reason: schedule.reason, load: schedule.load };
            }
            if (timeMinutes >= startMin && timeMinutes <= endMin) {
                nextClear = { time: schedule.end, load: area.baseLoad };
            }
        }

        return { nextBusy, nextClear };
    },

    // AI best departure prediction
    getAIBestDeparture: function (area, currentTime) {
        const traffic = this.getAreaTraffic(area, currentTime);
        const change = this.getNextTrafficChange(area, currentTime);

        if (traffic.status === 'clear') {
            // Area is clear now — warn when it will get busy
            if (change.nextBusy) {
                return {
                    recommendation: 'go_now',
                    message: `This area is clear right now! Go through before ${change.nextBusy.time} when traffic will build up.`,
                    warningTime: change.nextBusy.time,
                    warningReason: change.nextBusy.reason,
                    predictedLoad: change.nextBusy.load,
                };
            }
            return {
                recommendation: 'go_now',
                message: 'This area is clear and no upcoming congestion is predicted. Safe to travel anytime.',
                warningTime: null,
                warningReason: null,
                predictedLoad: area.baseLoad,
            };
        } else {
            // Area is busy — tell when it will clear
            if (change.nextClear) {
                return {
                    recommendation: 'wait',
                    message: `Heavy traffic right now! Best to wait until after ${change.nextClear.time} when this area will clear up.`,
                    clearTime: change.nextClear.time,
                    currentReason: traffic.reason,
                    alternateRoute: area.bestAlternateRoute,
                };
            }

            // Find next clear window
            const allEndTimes = area.schedules.map(s => {
                const [eH, eM] = s.end.split(':').map(Number);
                return eH * 60 + eM;
            });
            const [hours2, minutes2] = currentTime.split(':').map(Number);
            const now = hours2 * 60 + minutes2;
            const futureEnds = allEndTimes.filter(t => t > now).sort((a, b) => a - b);

            if (futureEnds.length > 0) {
                const clearMin = futureEnds[0];
                const clearH = Math.floor(clearMin / 60);
                const clearM = clearMin % 60;
                return {
                    recommendation: 'wait',
                    message: `Traffic expected to clear around ${String(clearH).padStart(2, '0')}:${String(clearM).padStart(2, '0')}. Consider alternate route.`,
                    alternateRoute: area.bestAlternateRoute,
                    currentReason: traffic.reason,
                };
            }

            return {
                recommendation: 'alternate',
                message: `This area stays busy. Use alternate route: ${area.bestAlternateRoute}`,
                alternateRoute: area.bestAlternateRoute,
                currentReason: traffic.reason,
            };
        }
    },

    // ============================
    // REPORTS (unchanged)
    // ============================
    reports: [
        { id: 101, type: 'Pothole', location: 'Shanti Nagar Sector 4', description: 'Large pothole near the main intersection causing vehicles to swerve dangerously. Approximately 2 feet wide and 6 inches deep. Multiple two-wheelers have skidded here.', status: 'Resolved', time: '2h ago', image: 'pothole.jpg', hasImage: true },
        { id: 102, type: 'Illegal Parking', location: 'Station Road', description: 'Multiple cars parked on both sides of the road near the station exit blocking the entire lane. Auto-rickshaws unable to pick up passengers. Causes major jam during peak hours.', status: 'In Progress', time: '15m ago', image: 'parking.jpg', hasImage: true },
        { id: 103, type: 'Road Obstruction', location: 'Western Express Highway', description: 'Construction debris dumped on the highway near the service road exit. Steel rods and concrete blocks blocking half the lane. Extremely dangerous at night with no warning signs.', status: 'Reported', time: '5m ago', image: 'obstacle.jpg', hasImage: true },
        { id: 104, type: 'Broken Signal', location: 'Beverly Park Junction', description: 'Traffic signal completely non-functional since yesterday evening. All four directions showing no lights. Minor accidents already reported. Traffic police not present.', status: 'Reported', time: '22m ago', image: 'signal.jpg', hasImage: false },
        { id: 105, type: 'Waterlogging', location: 'Kashimira Underpass', description: 'Underpass flooded with 2 feet of water after morning rain. Vehicles stuck. Water appears to be sewage mixed. Strong foul smell in the area. Pumps not working.', status: 'In Progress', time: '1h ago', image: 'waterlog.jpg', hasImage: true },
    ],

    // ============================
    // CITY PROBLEM SUMMARY
    // ============================
    citySummary: {
        headline: 'The Congestion Burden',
        subtitle: 'Market nodes & commercial spines are choked — the numbers speak',
        problems: [
            { icon: 'clock', title: 'Delays', cost: '₹48 Cr/year', description: 'Peak hour speeds drop below 10 km/h near Golden Nest & Metro 9 area, adding 40+ min daily.', color: '#ef4444' },
            { icon: 'fuel', title: 'Fuel Waste', cost: '₹32 Cr/year', description: 'Idling consumes 30% extra fuel; lakhs of litres burned needlessly every month.', color: '#f97316' },
            { icon: 'heart-pulse', title: 'Quality of Life', cost: '₹15 Cr/year', description: 'Stress, lost family time, and unpredictable commutes define daily life for thousands.', color: '#8b5cf6' },
            { icon: 'shield-alert', title: 'Safety Risk', cost: '₹22 Cr/year', description: 'Abrupt merging and poor sightlines cause frequent side-swiping and bottlenecks.', color: '#dc2626' },
        ],
        totalAnnualCost: '₹117 Cr',
        affectedCommuters: '2.5 Lakh+',
        avgDelayPerDay: '42 min'
    },

    // ============================
    // UPCOMING PROJECTS
    // ============================
    upcomingProjects: [
        { id: 'proj1', title: 'Metro Line 9 Extension', authority: 'MMRDA', status: 'Under Construction', progress: 65, timeline: '2026 – 2028', description: 'The Metro 9 extension from Dahisar to Mira-Bhayandar will add 5 new stations.', impact: 'positive', trafficDuringConstruction: 'Heavy disruption near Golden Nest & Kashimira for 18 months.', postCompletionBenefit: 'Will reduce 35% vehicle load. Travel time Mira Road to Dahisar drops from 55 min to 18 min.', icon: 'train-front', color: '#0ea5e9' },
        { id: 'proj2', title: 'Bhayandar Flyover Redesign', authority: 'MMRDA + BMC', status: 'DPR Approved', progress: 30, timeline: '2026 – 2027', description: 'Complete redesign with wider lanes, better merge points, dedicated service roads.', impact: 'positive', trafficDuringConstruction: 'Partial lane closure on Bhayandar East side for 8 months.', postCompletionBenefit: 'Will eliminate bottleneck. Capacity increase from 3,200 to 5,800 vehicles/hour.', icon: 'milestone', color: '#6366f1' },
        { id: 'proj3', title: 'Smart Signal Corridor', authority: 'BMC + Maharashtra IT Dept', status: 'Pilot Phase', progress: 45, timeline: '2026 Q3 – 2027 Q1', description: 'AI-powered adaptive traffic signals on 12 major junctions.', impact: 'positive', trafficDuringConstruction: 'Minimal disruption — installation during night hours only.', postCompletionBenefit: 'Expected 22% reduction in average wait time at signals.', icon: 'traffic-cone', color: '#10b981' },
        { id: 'proj4', title: 'Kashimira Junction Grade Separator', authority: 'Maharashtra PWD + MMRDA', status: 'Tendering', progress: 15, timeline: '2027 – 2029', description: 'Grade separator at the congested Kashimira junction.', impact: 'positive', trafficDuringConstruction: 'Major disruption expected at Kashimira junction for 24 months.', postCompletionBenefit: 'Will completely eliminate the Kashimira bottleneck.', icon: 'layers', color: '#f59e0b' },
    ],

    governmentInitiatives: {
        headline: 'Approved & Underway',
        subtitle: 'Maharashtra Government & MMRDA are driving infrastructure solutions.',
        milestones: [
            { label: 'MMRDA', icon: 'building-2', status: 'Lead Authority' },
            { label: 'State Clearance', icon: 'badge-check', status: 'Granted' },
            { label: 'DPR in Progress', icon: 'file-bar-chart', status: '3 of 4 complete' },
            { label: 'Smart Signals', icon: 'signal', status: '12 Junctions' }
        ],
        summary: 'Flyover redesign already under execution — smart signal corridor piloting, Kashimira grade separator tendering underway.'
    },

    // ============================
    // ISSUE TYPES
    // ============================
    issueTypes: [
        { type: 'Pothole', icon: 'alert-circle', description: 'Road surface damage' },
        { type: 'Illegal Parking', icon: 'ban', description: 'Vehicles blocking roads' },
        { type: 'Road Obstruction', icon: 'construction', description: 'Debris or blockage' },
        { type: 'Broken Signal', icon: 'signal', description: 'Non-functional traffic light' },
        { type: 'Waterlogging', icon: 'droplets', description: 'Flooded roads' },
        { type: 'Streetlight Issue', icon: 'lightbulb-off', description: 'Non-working lights' },
        { type: 'Footpath Damage', icon: 'footprints', description: 'Broken sidewalks' },
        { type: 'Dangerous Driving', icon: 'siren', description: 'Reckless behaviour' },
        { type: 'Noise Pollution', icon: 'volume-x', description: 'Excessive honking' },
        { type: 'Garbage Dump', icon: 'trash-2', description: 'Waste on roads' },
        { type: 'Open Manhole', icon: 'circle-alert', description: 'Uncovered manholes' },
        { type: 'Others', icon: 'message-circle-plus', description: 'Other civic issue' }
    ],

    // ============================
    // AI SEVERITY RULES (unchanged)
    // ============================
    aiSeverityRules: {
        'Pothole': { severity: 'High', urgency: 'Immediate', weight: 85, category: 'Road Safety', response: 'Potholes cause accidents and vehicle damage. This needs immediate repair by BMC road division.', estimatedResolution: '24-48 hours' },
        'Illegal Parking': { severity: 'Medium', urgency: 'Within 24 hrs', weight: 55, category: 'Traffic Flow', response: 'Illegal parking constricts traffic flow. Local traffic police to be notified for towing action.', estimatedResolution: '2-6 hours' },
        'Road Obstruction': { severity: 'Critical', urgency: 'Immediate', weight: 95, category: 'Emergency', response: 'Road obstructions can cause pile-ups. Emergency response team to be dispatched ASAP.', estimatedResolution: '1-4 hours' },
        'Broken Signal': { severity: 'Critical', urgency: 'Immediate', weight: 92, category: 'Road Safety', response: 'Non-functional signals lead to serious accidents. Traffic police deployment + electrical team required.', estimatedResolution: '4-12 hours' },
        'Waterlogging': { severity: 'High', urgency: 'Urgent', weight: 80, category: 'Infrastructure', response: 'Waterlogging blocks commute and damages vehicles. BMC storm water dept to deploy pumps.', estimatedResolution: '6-24 hours' },
        'Streetlight Issue': { severity: 'Medium', urgency: 'Within 48 hrs', weight: 45, category: 'Public Safety', response: 'Dark stretches increase crime and accident risk. Electrical maintenance team to inspect.', estimatedResolution: '24-72 hours' },
        'Footpath Damage': { severity: 'Low', urgency: 'Scheduled', weight: 30, category: 'Infrastructure', response: 'Damaged footpaths affect pedestrians. Repair to be scheduled in next maintenance cycle.', estimatedResolution: '1-2 weeks' },
        'Dangerous Driving': { severity: 'High', urgency: 'Immediate', weight: 78, category: 'Law Enforcement', response: 'Reckless driving is a serious threat. Traffic police to increase patrolling in the area.', estimatedResolution: 'Ongoing monitoring' },
        'Noise Pollution': { severity: 'Low', urgency: 'Within 48 hrs', weight: 35, category: 'Environmental', response: 'Noise pollution affects quality of life. Enforcement of no-honking zones to be reviewed.', estimatedResolution: '1-2 weeks' },
        'Garbage Dump': { severity: 'Medium', urgency: 'Within 24 hrs', weight: 50, category: 'Sanitation', response: 'Garbage on roads is a health hazard and blocks drainage. BMC solid waste team notified.', estimatedResolution: '12-24 hours' },
        'Open Manhole': { severity: 'Critical', urgency: 'Immediate', weight: 98, category: 'Emergency', response: 'Open manholes are life-threatening. Barricading + immediate repair by BMC drainage dept.', estimatedResolution: '2-6 hours' },
        'Others': { severity: 'Medium', urgency: 'Review Pending', weight: 50, category: 'General', response: 'Issue under review. Our AI will classify this once more details are available.', estimatedResolution: 'Under review' }
    },

    // ============================
    // MOBILITY DATA
    // ============================

    mobilityServices: [
        { id: 'rickshaw', name: 'Auto Rickshaw', icon: 'bike', color: '#fb923c', active: 141, waitTime: '3–8 min', coverage: 'Full City', note: 'Most affordable for short hops', provider: 'Local Autos' },
        { id: 'cab', name: 'Cab (Ola / Uber)', icon: 'car', color: '#22d3ee', active: 92, waitTime: '5–12 min', coverage: 'City + Highway', note: 'Comfortable, AC, best for long rides', provider: 'Ola · Uber · InDrive' },
        { id: 'bike', name: 'Bike Taxi (Rapido)', icon: 'zap', color: '#4ade80', active: 74, waitTime: '2–5 min', coverage: 'Urban Zones', note: 'Fastest, beat traffic on 2 wheels', provider: 'Rapido · Ola Bike' },
        { id: 'train', name: 'Local Train (WR)', icon: 'train-front', color: '#c4b5fd', active: null, waitTime: '8–25 min', coverage: 'Station to Station', note: 'Cheapest for long distance travel', provider: 'Western Railway' },
        { id: 'metro', name: 'Metro Line 9', icon: 'tram', color: '#38bdf8', active: 12, unit: 'Trains', waitTime: '6–12 min', coverage: 'Dahisar – Mira Bhayandar', note: 'Operational! Avoid WEH traffic.', provider: 'MMRDA Metro', extraDetail: { label: 'Avg Speed', value: '35 km/h (Peak)' } },
    ],

    // ============================
    // METRO LINE 9 — MIRA-BHAYANDAR STATIONS
    // ============================
    metroStations: [
        { id: 'ms1', name: 'Dahisar East',     zone: 1, lat: 19.2530, lng: 72.8600, interchanges: ['Western Railway – Dahisar'] },
        { id: 'ms2', name: 'Pandurang Wadi',   zone: 1, lat: 19.2625, lng: 72.8575, interchanges: [] },
        { id: 'ms3', name: 'Miragaon',          zone: 1, lat: 19.2710, lng: 72.8550, interchanges: [] },
        { id: 'ms4', name: 'Kashigaon',         zone: 2, lat: 19.2780, lng: 72.8530, interchanges: [] },
        { id: 'ms5', name: 'Sai Baba Nagar',   zone: 2, lat: 19.2850, lng: 72.8510, interchanges: [] },
        { id: 'ms6', name: 'Meditiya Nagar',   zone: 2, lat: 19.2920, lng: 72.8490, interchanges: ['SCB Ground'] },
    ],

    // Metro fare calculation helper
    getMetroFare: function(fromStation, toStation) {
        const stations = TrafficData.metroStations;
        const fromIdx = stations.findIndex(s => s.name === fromStation);
        const toIdx   = stations.findIndex(s => s.name === toStation);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return null;
        const stops = Math.abs(fromIdx - toIdx);
        // Fare slab: ₹10 base + ₹5/stop, capped at ₹40
        const fare = Math.min(10 + stops * 5, 40);
        const dist  = parseFloat((stops * 1.75).toFixed(1));   // ~1.75 km/stop
        const timeMin = stops * 2 + 2;                          // 2 min/stop + 2 min dwell
        return { fare: `₹${fare}`, distance: `${dist} km`, time: `${timeMin} min`, stops };
    },

    mobilityFares: [
        // === Mira Road Station routes ===
        { from: 'Mira Road Station', to: 'Bhayandar Station', distance: '4.8 km', rickshaw: { fare: '₹55', time: '18 min' }, cab: { fare: '₹140–170', time: '14 min' }, bike: { fare: '₹72', time: '15 min' }, train: { fare: '₹10', time: '7 min' } },
        { from: 'Mira Road Station', to: 'Golden Nest Junction', distance: '2.1 km', rickshaw: { fare: '₹28', time: '9 min' }, cab: { fare: '₹95–120', time: '8 min' }, bike: { fare: '₹48', time: '8 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Maxus Mall & Surroundings', distance: '3.5 km', rickshaw: { fare: '₹42', time: '13 min' }, cab: { fare: '₹120–150', time: '11 min' }, bike: { fare: '₹62', time: '12 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Kashimira Junction', distance: '5.2 km', rickshaw: { fare: '₹65', time: '20 min' }, cab: { fare: '₹170–200', time: '17 min' }, bike: { fare: '₹88', time: '18 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'LR Tiwari Engineering College', distance: '2.4 km', rickshaw: { fare: '₹30', time: '10 min' }, cab: { fare: '₹105–130', time: '9 min' }, bike: { fare: '₹52', time: '9 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Reliance Corporate Park', distance: '6.5 km', rickshaw: { fare: '₹80', time: '25 min' }, cab: { fare: '₹200–240', time: '21 min' }, bike: { fare: '₹110', time: '22 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Lodha Business District', distance: '3.0 km', rickshaw: { fare: '₹38', time: '12 min' }, cab: { fare: '₹115–140', time: '10 min' }, bike: { fare: '₹58', time: '11 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Ryan International School', distance: '2.8 km', rickshaw: { fare: '₹35', time: '11 min' }, cab: { fare: '₹110–135', time: '10 min' }, bike: { fare: '₹56', time: '10 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Shanti Park', distance: '1.5 km', rickshaw: { fare: '₹20', time: '7 min' }, cab: { fare: '₹85–100', time: '6 min' }, bike: { fare: '₹38', time: '6 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Kanakia Road', distance: '1.8 km', rickshaw: { fare: '₹22', time: '8 min' }, cab: { fare: '₹88–110', time: '7 min' }, bike: { fare: '₹42', time: '7 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Pillai College (Panvel Rd)', distance: '3.2 km', rickshaw: { fare: '₹40', time: '13 min' }, cab: { fare: '₹118–145', time: '11 min' }, bike: { fare: '₹60', time: '12 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Smt. Indira Gandhi College', distance: '2.6 km', rickshaw: { fare: '₹32', time: '11 min' }, cab: { fare: '₹108–132', time: '9 min' }, bike: { fare: '₹54', time: '10 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'TCS Olympus (IT Park)', distance: '3.8 km', rickshaw: { fare: '₹48', time: '15 min' }, cab: { fare: '₹138–168', time: '13 min' }, bike: { fare: '₹72', time: '14 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Vibgyor High School', distance: '4.2 km', rickshaw: { fare: '₹52', time: '16 min' }, cab: { fare: '₹148–178', time: '14 min' }, bike: { fare: '₹78', time: '15 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'DAV Public School', distance: '2.0 km', rickshaw: { fare: '₹25', time: '8 min' }, cab: { fare: '₹92–115', time: '7 min' }, bike: { fare: '₹45', time: '7 min' }, train: { fare: '—', time: '—' } },
        { from: 'Mira Road Station', to: 'Bhayandar Flyover', distance: '4.0 km', rickshaw: { fare: '₹50', time: '16 min' }, cab: { fare: '₹145–175', time: '13 min' }, bike: { fare: '₹74', time: '14 min' }, train: { fare: '—', time: '—' } },
        // === Bhayandar Station routes ===
        { from: 'Bhayandar Station', to: 'Maxus Mall & Surroundings', distance: '1.2 km', rickshaw: { fare: '₹18', time: '5 min' }, cab: { fare: '₹85–100', time: '5 min' }, bike: { fare: '₹35', time: '4 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Golden Nest Junction', distance: '2.8 km', rickshaw: { fare: '₹35', time: '12 min' }, cab: { fare: '₹112–138', time: '10 min' }, bike: { fare: '₹56', time: '11 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Kashimira Junction', distance: '3.5 km', rickshaw: { fare: '₹45', time: '14 min' }, cab: { fare: '₹130–160', time: '12 min' }, bike: { fare: '₹68', time: '13 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Reliance Corporate Park', distance: '4.2 km', rickshaw: { fare: '₹55', time: '17 min' }, cab: { fare: '₹155–185', time: '14 min' }, bike: { fare: '₹80', time: '15 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Vibgyor High School', distance: '1.8 km', rickshaw: { fare: '₹22', time: '7 min' }, cab: { fare: '₹90–110', time: '6 min' }, bike: { fare: '₹42', time: '6 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'TCS Olympus (IT Park)', distance: '5.5 km', rickshaw: { fare: '₹70', time: '22 min' }, cab: { fare: '₹180–215', time: '18 min' }, bike: { fare: '₹95', time: '19 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'LR Tiwari Engineering College', distance: '4.5 km', rickshaw: { fare: '₹58', time: '18 min' }, cab: { fare: '₹160–190', time: '15 min' }, bike: { fare: '₹82', time: '16 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Lodha Business District', distance: '2.5 km', rickshaw: { fare: '₹32', time: '10 min' }, cab: { fare: '₹105–130', time: '9 min' }, bike: { fare: '₹52', time: '9 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Ryan International School', distance: '3.0 km', rickshaw: { fare: '₹38', time: '12 min' }, cab: { fare: '₹115–140', time: '10 min' }, bike: { fare: '₹58', time: '11 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Pillai College (Panvel Rd)', distance: '3.5 km', rickshaw: { fare: '₹45', time: '14 min' }, cab: { fare: '₹130–160', time: '12 min' }, bike: { fare: '₹68', time: '13 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Smt. Indira Gandhi College', distance: '5.0 km', rickshaw: { fare: '₹62', time: '19 min' }, cab: { fare: '₹165–198', time: '16 min' }, bike: { fare: '₹88', time: '17 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'DAV Public School', distance: '4.8 km', rickshaw: { fare: '₹60', time: '18 min' }, cab: { fare: '₹158–190', time: '15 min' }, bike: { fare: '₹85', time: '16 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Kanakia Road', distance: '5.2 km', rickshaw: { fare: '₹65', time: '20 min' }, cab: { fare: '₹170–205', time: '17 min' }, bike: { fare: '₹90', time: '18 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Shanti Park', distance: '4.5 km', rickshaw: { fare: '₹58', time: '17 min' }, cab: { fare: '₹155–185', time: '14 min' }, bike: { fare: '₹82', time: '15 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Station', to: 'Bhayandar Flyover', distance: '1.0 km', rickshaw: { fare: '₹15', time: '4 min' }, cab: { fare: '₹80–95', time: '3 min' }, bike: { fare: '₹28', time: '3 min' }, train: { fare: '—', time: '—' } },
        // === Golden Nest Junction routes ===
        { from: 'Golden Nest Junction', to: 'Kanakia Road', distance: '2.5 km', rickshaw: { fare: '₹30', time: '10 min' }, cab: { fare: '₹108–132', time: '9 min' }, bike: { fare: '₹52', time: '9 min' }, train: { fare: '—', time: '—' } },
        { from: 'Golden Nest Junction', to: 'Kashimira Junction', distance: '4.0 km', rickshaw: { fare: '₹50', time: '16 min' }, cab: { fare: '₹148–178', time: '13 min' }, bike: { fare: '₹76', time: '14 min' }, train: { fare: '—', time: '—' } },
        { from: 'Golden Nest Junction', to: 'LR Tiwari Engineering College', distance: '1.8 km', rickshaw: { fare: '₹22', time: '8 min' }, cab: { fare: '₹90–112', time: '7 min' }, bike: { fare: '₹42', time: '7 min' }, train: { fare: '—', time: '—' } },
        { from: 'Golden Nest Junction', to: 'Shanti Park', distance: '1.5 km', rickshaw: { fare: '₹20', time: '6 min' }, cab: { fare: '₹85–105', time: '5 min' }, bike: { fare: '₹38', time: '5 min' }, train: { fare: '—', time: '—' } },
        { from: 'Golden Nest Junction', to: 'Ryan International School', distance: '1.2 km', rickshaw: { fare: '₹18', time: '5 min' }, cab: { fare: '₹82–100', time: '5 min' }, bike: { fare: '₹35', time: '4 min' }, train: { fare: '—', time: '—' } },
        { from: 'Golden Nest Junction', to: 'Reliance Corporate Park', distance: '5.5 km', rickshaw: { fare: '₹70', time: '22 min' }, cab: { fare: '₹180–215', time: '18 min' }, bike: { fare: '₹95', time: '19 min' }, train: { fare: '—', time: '—' } },
        { from: 'Golden Nest Junction', to: 'TCS Olympus (IT Park)', distance: '3.2 km', rickshaw: { fare: '₹40', time: '13 min' }, cab: { fare: '₹118–145', time: '11 min' }, bike: { fare: '₹62', time: '12 min' }, train: { fare: '—', time: '—' } },
        // === Kashimira Junction routes ===
        { from: 'Kashimira Junction', to: 'Reliance Corporate Park', distance: '4.2 km', rickshaw: { fare: '₹55', time: '17 min' }, cab: { fare: '₹155–185', time: '14 min' }, bike: { fare: '₹80', time: '15 min' }, train: { fare: '—', time: '—' } },
        { from: 'Kashimira Junction', to: 'DAV Public School', distance: '3.0 km', rickshaw: { fare: '₹38', time: '12 min' }, cab: { fare: '₹115–140', time: '10 min' }, bike: { fare: '₹58', time: '11 min' }, train: { fare: '—', time: '—' } },
        { from: 'Kashimira Junction', to: 'Smt. Indira Gandhi College', distance: '4.8 km', rickshaw: { fare: '₹60', time: '18 min' }, cab: { fare: '₹158–190', time: '15 min' }, bike: { fare: '₹85', time: '16 min' }, train: { fare: '—', time: '—' } },
        // === Kanakia Road routes ===
        { from: 'Kanakia Road', to: 'Shanti Park', distance: '1.0 km', rickshaw: { fare: '₹15', time: '4 min' }, cab: { fare: '₹80–95', time: '4 min' }, bike: { fare: '₹30', time: '3 min' }, train: { fare: '—', time: '—' } },
        { from: 'Kanakia Road', to: 'Smt. Indira Gandhi College', distance: '1.5 km', rickshaw: { fare: '₹20', time: '6 min' }, cab: { fare: '₹85–105', time: '5 min' }, bike: { fare: '₹38', time: '5 min' }, train: { fare: '—', time: '—' } },
        { from: 'Kanakia Road', to: 'DAV Public School', distance: '1.2 km', rickshaw: { fare: '₹18', time: '5 min' }, cab: { fare: '₹82–100', time: '4 min' }, bike: { fare: '₹35', time: '4 min' }, train: { fare: '—', time: '—' } },
        // === Corporate cross-routes ===
        { from: 'Lodha Business District', to: 'TCS Olympus (IT Park)', distance: '3.8 km', rickshaw: { fare: '₹48', time: '15 min' }, cab: { fare: '₹138–168', time: '13 min' }, bike: { fare: '₹72', time: '13 min' }, train: { fare: '—', time: '—' } },
        { from: 'Lodha Business District', to: 'Reliance Corporate Park', distance: '2.8 km', rickshaw: { fare: '₹35', time: '11 min' }, cab: { fare: '₹112–138', time: '10 min' }, bike: { fare: '₹56', time: '10 min' }, train: { fare: '—', time: '—' } },
        { from: 'TCS Olympus (IT Park)', to: 'Reliance Corporate Park', distance: '4.0 km', rickshaw: { fare: '₹50', time: '16 min' }, cab: { fare: '₹148–178', time: '13 min' }, bike: { fare: '₹76', time: '14 min' }, train: { fare: '—', time: '—' } },
        // === College/School cross-routes ===
        { from: 'LR Tiwari Engineering College', to: 'Maxus Mall & Surroundings', distance: '3.0 km', rickshaw: { fare: '₹38', time: '12 min' }, cab: { fare: '₹115–140', time: '10 min' }, bike: { fare: '₹58', time: '11 min' }, train: { fare: '—', time: '—' } },
        { from: 'LR Tiwari Engineering College', to: 'Pillai College (Panvel Rd)', distance: '2.5 km', rickshaw: { fare: '₹32', time: '10 min' }, cab: { fare: '₹105–130', time: '9 min' }, bike: { fare: '₹52', time: '9 min' }, train: { fare: '—', time: '—' } },
        { from: 'Pillai College (Panvel Rd)', to: 'Ryan International School', distance: '1.8 km', rickshaw: { fare: '₹22', time: '7 min' }, cab: { fare: '₹90–112', time: '6 min' }, bike: { fare: '₹42', time: '6 min' }, train: { fare: '—', time: '—' } },
        { from: 'Pillai College (Panvel Rd)', to: 'Vibgyor High School', distance: '1.5 km', rickshaw: { fare: '₹20', time: '6 min' }, cab: { fare: '₹85–105', time: '5 min' }, bike: { fare: '₹38', time: '5 min' }, train: { fare: '—', time: '—' } },
        { from: 'Smt. Indira Gandhi College', to: 'DAV Public School', distance: '1.8 km', rickshaw: { fare: '₹22', time: '7 min' }, cab: { fare: '₹90–112', time: '6 min' }, bike: { fare: '₹42', time: '6 min' }, train: { fare: '—', time: '—' } },
        { from: 'Ryan International School', to: 'TCS Olympus (IT Park)', distance: '2.0 km', rickshaw: { fare: '₹25', time: '8 min' }, cab: { fare: '₹95–118', time: '7 min' }, bike: { fare: '₹46', time: '7 min' }, train: { fare: '—', time: '—' } },
        { from: 'Vibgyor High School', to: 'Reliance Corporate Park', distance: '2.2 km', rickshaw: { fare: '₹28', time: '9 min' }, cab: { fare: '₹100–125', time: '8 min' }, bike: { fare: '₹48', time: '8 min' }, train: { fare: '—', time: '—' } },
        // === Flyover routes ===
        { from: 'Bhayandar Flyover', to: 'Kashimira Junction', distance: '3.5 km', rickshaw: { fare: '₹45', time: '14 min' }, cab: { fare: '₹130–160', time: '12 min' }, bike: { fare: '₹68', time: '13 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Flyover', to: 'Golden Nest Junction', distance: '2.5 km', rickshaw: { fare: '₹32', time: '10 min' }, cab: { fare: '₹108–132', time: '9 min' }, bike: { fare: '₹52', time: '9 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Flyover', to: 'Maxus Mall & Surroundings', distance: '1.5 km', rickshaw: { fare: '₹20', time: '6 min' }, cab: { fare: '₹85–105', time: '5 min' }, bike: { fare: '₹38', time: '5 min' }, train: { fare: '—', time: '—' } },
        { from: 'Bhayandar Flyover', to: 'Lodha Business District', distance: '2.0 km', rickshaw: { fare: '₹25', time: '8 min' }, cab: { fare: '₹95–118', time: '7 min' }, bike: { fare: '₹46', time: '7 min' }, train: { fare: '—', time: '—' } },
        // === Other notable routes ===
        { from: 'DAV Public School', to: 'Mira Road Station', distance: '2.2 km', rickshaw: { fare: '₹28', time: '9 min' }, cab: { fare: '₹98–120', time: '8 min' }, bike: { fare: '₹48', time: '8 min' }, train: { fare: '—', time: '—' } },
        { from: 'DAV Public School', to: 'LR Tiwari Engineering College', distance: '1.5 km', rickshaw: { fare: '₹20', time: '6 min' }, cab: { fare: '₹85–105', time: '5 min' }, bike: { fare: '₹38', time: '5 min' }, train: { fare: '—', time: '—' } },
        { from: 'Shanti Park', to: 'Smt. Indira Gandhi College', distance: '1.8 km', rickshaw: { fare: '₹22', time: '7 min' }, cab: { fare: '₹88–110', time: '6 min' }, bike: { fare: '₹42', time: '6 min' }, train: { fare: '—', time: '—' } },
        { from: 'Shanti Park', to: 'LR Tiwari Engineering College', distance: '1.2 km', rickshaw: { fare: '₹18', time: '5 min' }, cab: { fare: '₹82–100', time: '5 min' }, bike: { fare: '₹35', time: '4 min' }, train: { fare: '—', time: '—' } },
        { from: 'Maxus Mall & Surroundings', to: 'Reliance Corporate Park', distance: '2.2 km', rickshaw: { fare: '₹28', time: '9 min' }, cab: { fare: '₹100–125', time: '8 min' }, bike: { fare: '₹48', time: '8 min' }, train: { fare: '—', time: '—' } },
        { from: 'Maxus Mall & Surroundings', to: 'Vibgyor High School', distance: '1.5 km', rickshaw: { fare: '₹20', time: '6 min' }, cab: { fare: '₹85–105', time: '5 min' }, bike: { fare: '₹38', time: '5 min' }, train: { fare: '—', time: '—' } },
    ],

    // Multi-transport demand zones (replaces rickshaw-only zones)
    demandZones: [
        { id: 'dz1', name: 'Mira Road Station', rickshaw: { demand: 'high', active: 45, wait: '3 min' }, cab: { demand: 'high', active: 28, wait: '5 min' }, bike: { demand: 'high', active: 22, wait: '2 min' }, metro: { demand: 'medium', status: 'Coming 2027' }, lat: 19.2813, lng: 72.8557 },
        { id: 'dz2', name: 'Bhayandar Station', rickshaw: { demand: 'high', active: 38, wait: '4 min' }, cab: { demand: 'high', active: 22, wait: '6 min' }, bike: { demand: 'medium', active: 15, wait: '3 min' }, metro: { demand: 'high', status: 'Coming 2027' }, lat: 19.3000, lng: 72.8500 },
        { id: 'dz3', name: 'Golden Nest Circle', rickshaw: { demand: 'medium', active: 22, wait: '6 min' }, cab: { demand: 'medium', active: 14, wait: '8 min' }, bike: { demand: 'medium', active: 12, wait: '4 min' }, metro: { demand: 'low', status: 'Not planned' }, lat: 19.2900, lng: 72.8500 },
        { id: 'dz4', name: 'Maxus Mall Gate', rickshaw: { demand: 'medium', active: 18, wait: '5 min' }, cab: { demand: 'high', active: 20, wait: '5 min' }, bike: { demand: 'medium', active: 10, wait: '4 min' }, metro: { demand: 'medium', status: 'Nearby station' }, lat: 19.3050, lng: 72.8600 },
        { id: 'dz5', name: 'Kashimira Junction', rickshaw: { demand: 'medium', active: 15, wait: '7 min' }, cab: { demand: 'medium', active: 12, wait: '8 min' }, bike: { demand: 'low', active: 6, wait: '6 min' }, metro: { demand: 'high', status: 'Terminal station' }, lat: 19.2680, lng: 72.8440 },
        { id: 'dz6', name: 'TCS / IT Park', rickshaw: { demand: 'medium', active: 14, wait: '6 min' }, cab: { demand: 'high', active: 25, wait: '4 min' }, bike: { demand: 'high', active: 18, wait: '3 min' }, metro: { demand: 'low', status: 'Not planned' }, lat: 19.2890, lng: 72.8620 },
        { id: 'dz7', name: 'Kanakia / Shanti Park', rickshaw: { demand: 'low', active: 10, wait: '8 min' }, cab: { demand: 'low', active: 6, wait: '10 min' }, bike: { demand: 'low', active: 5, wait: '5 min' }, metro: { demand: 'low', status: 'Not planned' }, lat: 19.2750, lng: 72.8650 },
    ],

    // Keep rickshawZones for backwards compatibility (map layer uses it)
    rickshawZones: [
        { id: 'rz1', name: 'Mira Road Station', demand: 'high', activeDrivers: 45, avgWait: '3 min', lat: 19.2813, lng: 72.8557 },
        { id: 'rz2', name: 'Bhayandar Station', demand: 'high', activeDrivers: 38, avgWait: '4 min', lat: 19.3000, lng: 72.8500 },
        { id: 'rz3', name: 'Golden Nest Circle', demand: 'medium', activeDrivers: 22, avgWait: '6 min', lat: 19.2900, lng: 72.8500 },
        { id: 'rz4', name: 'Maxus Mall Gate', demand: 'medium', activeDrivers: 18, avgWait: '5 min', lat: 19.3050, lng: 72.8600 },
        { id: 'rz5', name: 'Kanakia Junction', demand: 'low', activeDrivers: 10, avgWait: '8 min', lat: 19.2750, lng: 72.8650 },
        { id: 'rz6', name: 'Shanti Park', demand: 'low', activeDrivers: 8, avgWait: '10 min', lat: 19.2780, lng: 72.8520 },
    ],

    rickshawStats: {
        totalActive: 141,
        avgWaitTime: '5.2 min',
        busiestRoute: 'Mira Road Stn → Golden Nest',
        dailyRides: 1835,
        savingsVsCab: '₹45 avg savings / ride'
    },

    mobilityStats: {
        totalVehicles: 307,
        avgWaitAll: '4.8 min',
        busiestZone: 'Mira Road Station',
        dailyTrips: 5420,
        cheapestMode: 'Local Train (₹5–15)',
    },

    // ============================
    // DIRECTIONS DATA (for map directions feature)
    // ============================
    directionRoutes: [
        { from: 'Mira Road Station', to: 'Golden Nest Junction', normalTime: '15 min', trafficTime: '35 min', distance: '2.8 km', aiTip: 'Take inner Sector 5 road to avoid Golden Nest main junction — saves 12 min during peak' },
        { from: 'Golden Nest Junction', to: 'Maxus Mall & Surroundings', normalTime: '10 min', trafficTime: '25 min', distance: '2.1 km', aiTip: 'Use Bhayandar bypass road instead of main road — less congested, same distance' },
        { from: 'Mira Road Station', to: 'LR Tiwari Engineering College', normalTime: '12 min', trafficTime: '28 min', distance: '2.4 km', aiTip: 'Avoid 8:30-9:30 AM. If traveling then, take Shanti Park road to bypass college gate traffic' },
        { from: 'Bhayandar Flyover', to: 'Kashimira Junction', normalTime: '8 min', trafficTime: '22 min', distance: '3.5 km', aiTip: 'Highway service road is faster during peak — avoid main junction merge point' },
        { from: 'Ryan International School', to: 'TCS Olympus (IT Park)', normalTime: '10 min', trafficTime: '30 min', distance: '2.0 km', aiTip: 'Morning 8-9 AM: school + office traffic overlap. Leave before 7:30 AM or after 10 AM' },
        { from: 'Kanakia Road', to: 'Mira Road Station', normalTime: '8 min', trafficTime: '18 min', distance: '1.8 km', aiTip: 'Kanakia Road stays relatively clear — this is the best route during peak hours' },
        { from: 'Kashimira Junction', to: 'Reliance Corporate Park', normalTime: '14 min', trafficTime: '35 min', distance: '4.2 km', aiTip: 'Take SH-27 highway segment — faster than going through Bhayandar town' },
        { from: 'LR Tiwari Engineering College', to: 'Maxus Mall & Surroundings', normalTime: '15 min', trafficTime: '30 min', distance: '3.0 km', aiTip: 'Post 5 PM both areas are busy — best window is 3-4 PM for smooth travel' },
    ],
};
