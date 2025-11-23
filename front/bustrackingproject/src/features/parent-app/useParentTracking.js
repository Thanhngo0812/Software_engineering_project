import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TRACKING_URL = 'http://localhost:8082';
const CORE_URL = 'http://localhost:8081'; 

export const useParentTracking = (studentId) => {
    const [tripId, setTripId] = useState(null); // State lưu tripId tìm được
    const [tripData, setTripData] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const intervalRef = useRef(null);

    // 1. TÌM TRIP ID DỰA TRÊN STUDENT ID
    useEffect(() => {
        if (!studentId) return;

        const findTrip = async () => {
            setLoading(true);
            try {
                // Gọi sang Core Service để hỏi: Học sinh này đang đi chuyến nào?
                const res = await axios.get(`${CORE_URL}/api/v1/students/${studentId}/active-trip`);
                if (res.data && res.data.tripId) {
                    console.log(res.data.tripId)
                    setTripId(res.data.tripId);
                } else {
                    setError("Không tìm thấy chuyến xe nào đang chạy cho học sinh này.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error finding trip:", err);
                setError("Không tìm thấy thông tin chuyến đi hoặc xe chưa xuất bến.");
                setLoading(false);
            }
        };

        findTrip();
    }, [studentId]);

    // 2. KHI CÓ TRIP ID -> LOAD DỮ LIỆU BAN ĐẦU (Route + Vị trí)
    useEffect(() => {
        if (!tripId) return;

        const fetchInitialData = async () => {
            try {
                // Gọi Tracking Service để lấy lộ trình vẽ map
                const res = await axios.get(`${TRACKING_URL}/api/v1/tracking/trip/${tripId}/full`);
                
                if (res.data) {
                    setTripData(res.data);
                    if (res.data.currentLocation) {
                        setCurrentLocation(res.data.currentLocation);
                    }
                }
                setError(null);
            } catch (err) {
                console.error("Error fetching full trip info:", err);
                setError("Lỗi khi tải dữ liệu bản đồ.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [tripId]);

    // 3. POLLING VỊ TRÍ (Chỉ chạy khi đã có tripId)
    useEffect(() => {
        if (!tripId) return;

        const pollLocation = async () => {
            try {
                const res = await axios.get(`${TRACKING_URL}/api/v1/tracking/${tripId}`);
                if (res.data) {
                    console.log(res.data)
                    setCurrentLocation(res.data);
                }
            } catch (e) {
                console.warn("Lost signal / Trip ended", e);
            }
        };

        // Gọi ngay 1 lần
        pollLocation();
        // Set interval 3s
        intervalRef.current = setInterval(pollLocation, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [tripId]);

    return { tripId, tripData, currentLocation, loading, error };
};