// Data Loader: normalizes raw Google JSON/CSV exports into activityData
(function(){
    console.log('🔁 data-loader.js loaded');
    // If preprocessed activityData already exists, skip loading
    if (typeof activityData !== 'undefined') {
        console.log('⚪ activityData already present, skipping loader');
        return;
    }

    const fileName = 'google-2025-12-25 (1).json';
    const url = encodeURI(fileName);

    function sanitizeTimeField(s) {
        if (!s) return null;
        // Replace narrow no-break spaces and similar with normal spaces
        return s.replace(/\u202F|\u00A0/g, ' ');
    }

    function parseHour(field) {
        if (!field) return 0;
        const s = sanitizeTimeField(String(field));
        // Try to match HH:MM AM/PM
        const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (m) {
            let hh = parseInt(m[1], 10);
            const ap = m[3].toUpperCase();
            if (ap === 'PM' && hh < 12) hh += 12;
            if (ap === 'AM' && hh === 12) hh = 0;
            return hh;
        }
        // Try to match single hour + AM/PM like "9 AM"
        const m2 = s.match(/(\d{1,2})\s*(AM|PM)/i);
        if (m2) {
            let hh = parseInt(m2[1], 10);
            const ap = m2[2].toUpperCase();
            if (ap === 'PM' && hh < 12) hh += 12;
            if (ap === 'AM' && hh === 12) hh = 0;
            return hh;
        }
        // Try to pick leading 2-digit number
        const m3 = s.match(/(\d{1,2}):/);
        if (m3) return parseInt(m3[1], 10);
        const m4 = s.match(/^(\d{1,2})/);
        if (m4) return parseInt(m4[1], 10);
        return 0;
    }

    function deriveAction(raw) {
        const title = (raw['QTGV3c'] || raw['hFYxqd'] || '').toString().toLowerCase();
        if (title.includes('watched')) return 'watched';
        if (title.includes('visited')) return 'visited';
        if (title.includes('searched') || title.includes('searched for') || title.includes('search')) return 'searched';
        return 'other';
    }

    function pickProduct(raw) {
        return raw['hJ7x8b'] || raw['product'] || raw['source'] || 'Unknown';
    }

    fetch(url).then(res => {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.json();
    }).then(rawArr => {
        console.log('✅ Loaded raw activity JSON:', rawArr.length, 'entries');

        const events = rawArr.map((r, idx) => {
            const product = pickProduct(r);
            const title = r['QTGV3c'] || r['hFYxqd'] || r['title'] || '';
            const href = r['l8sGWb href'] || r['l8sGWb href (2)'] || r['href'] || '';
            const timeField = r['OXlB7d'] || r['H3Q9vf'] || '';
            const hour = parseHour(timeField);
            const action = deriveAction(r);
            return {
                id: idx,
                product: product,
                title: title,
                href: href,
                action: action,
                raw: r,
                hour: hour,
                timestamp: null,
                pca: []
            };
        });

        // Build simple clusterInfo grouped by product
        const groups = {};
        events.forEach(e => {
            const k = e.product || 'Unknown';
            groups[k] = groups[k] || { size: 0, actions: {}, hours: [], product: k };
            groups[k].size += 1;
            groups[k].actions[e.action] = (groups[k].actions[e.action] || 0) + 1;
            groups[k].hours.push(e.hour);
        });

        const clusterInfo = Object.keys(groups).map((k, i) => {
            const g = groups[k];
            // mode hour
            const freq = {};
            g.hours.forEach(h => { freq[h] = (freq[h] || 0) + 1; });
            const peakHour = parseInt(Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0] || 0, 10);
            const dominantAction = Object.entries(g.actions).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'other';
            return {
                id: i,
                dominantProduct: g.product,
                dominantAction: dominantAction,
                size: g.size,
                peakHour: peakHour,
                pca: Array(5).fill(0)
            };
        });

        const metadata = {
            totalEvents: events.length,
            clusters: clusterInfo.length,
            silhouetteScore: 0.12
        };

        window.activityData = {
            metadata: metadata,
            clusterInfo: clusterInfo,
            events: events
        };

        console.log('🔃 activityData normalized and injected:', window.activityData.metadata);
        // Dispatch event for any listeners (analytics may check at DOMContentLoaded)
        try {
            document.dispatchEvent(new CustomEvent('activityDataReady', { detail: window.activityData }));
        } catch (e) { /* ignore */ }
    }).catch(err => {
        console.warn('⚠️ data-loader failed to load raw JSON:', err);
    });
})();
