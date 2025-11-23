import { useState, useCallback } from 'react';
import authService from '../../auth/services/authService';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081'; // Đảm bảo port đúng với backend của bạn

const useApiStop = () => {
    // State để theo dõi trạng thái đang tải
    const [isLoading, setIsLoading] = useState(false);
    // State để lưu lỗi nếu có
    const [error, setError] = useState(null);
    // State để lưu dữ liệu trả về từ server
    const [data, setData] = useState(null);
  // 1. Lấy chi tiết Stop (cho chức năng Edit)
    const getStopById = async (id) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/school/v1/stops/${id}`);
            return response.data; 
            // Response kỳ vọng: { id, name, address, latitude, longitude ... }
        } catch (err) {
            setError(err.response?.data || err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
      const updateStop = async (id, stopData) => {
        setIsLoading(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/api/school/v1/stops/${id}`, stopData);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data || err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    // Hàm để thực hiện việc tạo stop, dùng useCallback để tối ưu
    const createStop = useCallback(async (stopData) => {
        // Reset trạng thái trước khi gọi API mới
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            // Thay thế URL này bằng API endpoint thực tế của bạn
            const API_ENDPOINT = 'http://localhost:8081/api/school/v1/stops';

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Thêm Authorization header nếu API của bạn yêu cầu
                    // 'Authorization': `Bearer ${your_auth_token}`
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(stopData),
            });

            // Nếu response không thành công (status code không phải 2xx)
            if (!response.ok) {
                const errorData = await response.json();
            
                // Nếu errorData.errors tồn tại thì lấy thông báo đầu tiên
                if (errorData.errors) {
                    // Lấy lỗi đầu tiên trong object errors (ví dụ stopName)
                    const firstErrorKey = Object.keys(errorData.errors)[0];
                    const firstErrorMessage = errorData.errors[firstErrorKey];
                    throw new Error(firstErrorMessage);
                }
            
                throw new Error(errorData.message || 'Something went wrong');
            }

            // Nếu thành công, đọc dữ liệu và lưu vào state
            const responseData = await response.json();
            setData(responseData);
            return responseData; // Trả về dữ liệu để component có thể dùng ngay

        } catch (err) {
            // Lưu lỗi vào state
                       // Ném lỗi ra ngoài để component biết là đã thất bại
            throw err;
        } finally {
            // Luôn tắt trạng thái loading sau khi hoàn tất
            setIsLoading(false);
        }
    }, []);

    // Trả về các state và hàm để component có thể sử dụng
    return { createStop, getStopById,updateStop, isLoading, error, data };
};

export default useApiStop;