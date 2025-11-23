// Công thức Haversine tính khoảng cách giữa 2 điểm (mét)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371e3; // metres
    const φ1 = Number(lat1) * Math.PI/180; 
    const φ2 = Number(lat2) * Math.PI/180;
    const Δφ = (Number(lat2)-Number(lat1)) * Math.PI/180;
    const Δλ = (Number(lon2)-Number(lon1)) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; 
}

// Hàm nội suy giữa 2 điểm (Linear Interpolation)
export const interpolatePoints = (start, end, steps) => {
    if (!start || !end || !steps || steps <= 0) return [];
    
    const startLat = Number(start.latitude || start.lat);
    const startLng = Number(start.longitude || start.lng);
    const endLat = Number(end.latitude || end.lat);
    const endLng = Number(end.longitude || end.lng);

    if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) return [];

    const points = [];
    const latStep = (endLat - startLat) / steps;
    const lngStep = (endLng - startLng) / steps;

    for (let i = 1; i <= steps; i++) {
        points.push({
            latitude: startLat + (latStep * i),
            longitude: startLng + (lngStep * i)
        });
    }
    return points;
}

// --- HÀM MỚI: Làm mượt đường đi thực tế ---
// Nhận vào mảng các điểm khúc cua từ TomTom, trả về mảng chi tiết để animation
export const expandRoutePath = (routePoints, stepsPerSegment = 5) => {
    if (!routePoints || routePoints.length < 2) return [];
    
    let expandedPath = [];
    
    for (let i = 0; i < routePoints.length - 1; i++) {
        const start = routePoints[i];
        const end = routePoints[i+1];
        
        // Nội suy giữa 2 điểm bất kỳ của con đường
        const segment = interpolatePoints(
            { lat: start.latitude, lng: start.longitude },
            { lat: end.latitude, lng: end.longitude },
            stepsPerSegment
        );
        expandedPath = [...expandedPath, ...segment];
    }
    
    return expandedPath;
}