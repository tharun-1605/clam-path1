export const COMMUNITY_REPORTS_KEY = 'neuro-nav-community-reports';

export function loadCommunityReports() {
    try {
        const raw = JSON.parse(localStorage.getItem(COMMUNITY_REPORTS_KEY) || '[]');
        return Array.isArray(raw) ? raw : [];
    } catch {
        return [];
    }
}

export function saveCommunityReport(report) {
    const current = loadCommunityReports();
    const next = [report, ...current].slice(0, 300);
    localStorage.setItem(COMMUNITY_REPORTS_KEY, JSON.stringify(next));
}

export function getNearbyCommunityReports(lat, lon, radiusKm = 3, limit = 10) {
    const reports = loadCommunityReports()
        .filter((item) => item?.lat != null && item?.lon != null)
        .filter((item) => haversineKm(lat, lon, Number(item.lat), Number(item.lon)) <= radiusKm)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return reports.slice(0, limit);
}

export function getCommunityCalmStatsNear(lat, lon, radiusKm = 3) {
    const nearby = getNearbyCommunityReports(lat, lon, radiusKm, 100);
    if (!nearby.length) {
        return { count: 0, avgCalm: null, recent: [] };
    }

    const avg = nearby.reduce((sum, item) => sum + (Number(item.calmScore) || 0), 0) / nearby.length;
    return {
        count: nearby.length,
        avgCalm: Number(avg.toFixed(1)),
        recent: nearby.slice(0, 5)
    };
}

export function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
