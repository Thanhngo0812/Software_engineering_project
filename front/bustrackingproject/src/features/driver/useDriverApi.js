import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const useDriverApi = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy danh sách tài xế
    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/drivers`);
            setDrivers(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching drivers:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách xe bus rảnh
    const fetchAvailableBuses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/drivers/available-buses`);
            return res.data;
        } catch (err) {
            console.error("Error fetching buses:", err);
            return [];
        }
    };

    const updateDriver = async (id, data) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/drivers/${id}`, data);
            fetchDrivers(); 
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Update failed" };
        }
    };

    const toggleStatus = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/v1/drivers/${id}/toggle-status`);
            fetchDrivers();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Action failed because it is in a trip" };
        }
    };

    // --- CÁC HÀM MỚI ---
    
    // Gán xe
    const assignBus = async (driverId, busId) => {
        try {
            await axios.post(`${API_BASE_URL}/api/v1/drivers/${driverId}/assign-bus/${busId}`);
            fetchDrivers();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Assign failed" };
        }
    };

    // Hủy gán xe
    const unassignBus = async (driverId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/drivers/${driverId}/unassign-bus`);
            fetchDrivers();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Unassign failed" };
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    return { 
        drivers, loading, error, 
        fetchDrivers, updateDriver, toggleStatus, 
        fetchAvailableBuses, assignBus, unassignBus 
    };
};

export default useDriverApi;