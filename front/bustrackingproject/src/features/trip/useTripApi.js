import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const useTripApi = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Dữ liệu dropdown
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);

    // Lấy danh sách Trip
    const fetchTrips = useCallback(async (dateStr) => {
        setLoading(true);
        try {
            const url = dateStr 
                ? `${API_BASE_URL}/api/v1/trips?date=${dateStr}`
                : `${API_BASE_URL}/api/v1/trips`;
            const res = await axios.get(url);
            setTrips(res.data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy Routes và Drivers (Không cần lấy Buses nữa)
    const fetchAttributes = async () => {
        try {
            const [routeRes, driverRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/v1/routes`),
                axios.get(`${API_BASE_URL}/api/v1/drivers`)
            ]);
            // Chỉ lấy tài xế Active (tùy chọn)
            const allDrivers = driverRes.data;
            setRoutes(routeRes.data.content || routeRes.data);
            setDrivers(allDrivers); 
        } catch (err) {
            console.error("Failed to load attributes");
        }
    };

    // --- API MỚI: Lấy chi tiết Route để vẽ map ---
    const fetchRouteDetails = async (routeId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/routes/${routeId}`);
            return res.data; // Trả về object Route có chứa routeStops
        } catch (err) {
            console.error("Failed to fetch route details", err);
            return null;
        }
    };

    const createTrip = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/api/v1/trips`, data);
            return { success: true };
        } catch (err) {
            console.log(err)
            return { success: false, message: err.response.data.error || "Create failed" };
        }
    };

    const updateTrip = async (id, data) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/trips/${id}`, data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Update failed" };
        }
    };

    const changeStatus = async (id, status) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/v1/trips/${id}/status?status=${status}`);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Status change failed" };
        }
    };
   useEffect(() => {
        fetchTrips();
    }, []);
    return { 
        trips, routes, drivers, loading, error, 
        fetchTrips, fetchAttributes, fetchRouteDetails, // Export thêm hàm này
        createTrip, updateTrip, changeStatus 
    };
};

export default useTripApi;