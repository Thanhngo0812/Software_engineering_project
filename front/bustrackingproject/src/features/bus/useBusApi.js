import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const useBusApi = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/buses`);
            setBuses(res.data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const createBus = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/api/v1/buses`, data);
            fetchBuses();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Create failed" };
        }
    };

    // Hàm Update mới
    const updateBus = async (id, data) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/buses/${id}`, data);
            fetchBuses();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Update failed" };
        }
    };

    const deleteBus = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/buses/${id}`);
            fetchBuses();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Delete failed" };
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    return { buses, loading, error, fetchBuses, createBus, updateBus, deleteBus };
};

export default useBusApi;