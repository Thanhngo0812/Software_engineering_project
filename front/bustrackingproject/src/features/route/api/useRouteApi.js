import { useState, useEffect } from 'react';
import axios from 'axios';

// Cấu hình URL gốc cho API (Chạy cổng 8081)
const API_BASE_URL = 'http://localhost:8081';

// ------------------------------------------------
// 1. Hook lấy danh sách Routes (Phân trang & Search)
// ------------------------------------------------
export const useFetchRoutes = ({ currentPage, size, query, sort }) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ 
        totalPages: 0, 
        totalElements: 0, 
        number: 0, 
        size: size 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trigger, setTrigger] = useState(0); 

    const refetch = () => setTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Sử dụng API_BASE_URL
                const response = await axios.get(`${API_BASE_URL}/api/v1/routes`, {
                    params: { 
                        page: currentPage, 
                        size, 
                        query, 
                        sort 
                    }
                });
                
                if (response.data && response.data.content) {
                    setData(response.data.content);
                    setPagination({
                        totalPages: response.data.totalPages,
                        totalElements: response.data.totalElements,
                        number: response.data.number,
                        size: response.data.size
                    });
                } else {
                    setData(response.data);
                }
            } catch (err) {
                console.error("Error fetching routes:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, size, query, sort, trigger]);

    return { data, pagination, loading, error, refetch };
};

// ------------------------------------------------
// 2. Hook lấy toàn bộ Stops (Cho Dropdown chọn trạm)
// ------------------------------------------------
export const useFetchAllStops = () => {
    const [stops, setStops] = useState([]);

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/school/v1/stops`); 
                const stopsData = res.data.content ? res.data.content : res.data;
                setStops(stopsData);
            } catch (e) { 
                console.error("Failed to fetch stops list:", e); 
            }
        };
        fetchStops();
    }, []);

    return stops;
};

// ------------------------------------------------
// 3. Hook CRUD Route
// ------------------------------------------------
export const useApiRoute = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // A. Lấy chi tiết
    const getRouteById = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/routes/${id}`);
            return res.data; 
        } catch (err) {
            setError(err.response?.data || err);
            throw err; 
        } finally {
            setIsLoading(false);
        }
    };

    // B. Tạo mới
    const createRoute = async (routeData) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/routes`, routeData);
            return res.data;
        } catch (err) {
            setError(err.response?.data || err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // C. Cập nhật
    const updateRoute = async (id, routeData) => {
        setIsLoading(true);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/v1/routes/${id}`, routeData);
            return res.data;
        } catch (err) {
            setError(err.response?.data || err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // D. Xóa
    const deleteRoute = async (id) => {
        setIsLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/routes/${id}`);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            return { success: false, message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    return { 
        getRouteById, 
        createRoute, 
        updateRoute, 
        deleteRoute, 
        isLoading, 
        error 
    };
};