import { useState, useCallback } from 'react';

const useApiStop = () => {
    // State để theo dõi trạng thái đang tải
    const [isLoading, setIsLoading] = useState(false);
    // State để lưu lỗi nếu có
    const [error, setError] = useState(null);
    // State để lưu dữ liệu trả về từ server
    const [data, setData] = useState(null);

    // Hàm để thực hiện việc tạo stop, dùng useCallback để tối ưu
    const createStop = useCallback(async (stopData) => {
        // Reset trạng thái trước khi gọi API mới
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            // Thay thế URL này bằng API endpoint thực tế của bạn
            const API_ENDPOINT = 'http://localhost:8081/api/v1/stops';

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Thêm Authorization header nếu API của bạn yêu cầu
                    // 'Authorization': `Bearer ${your_auth_token}`
                },
                body: JSON.stringify(stopData),
            });

            // Nếu response không thành công (status code không phải 2xx)
            if (!response.ok) {
                // Đọc lỗi từ body (nếu có) và ném ra để catch xử lý
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong');
            }

            // Nếu thành công, đọc dữ liệu và lưu vào state
            const responseData = await response.json();
            setData(responseData);
            return responseData; // Trả về dữ liệu để component có thể dùng ngay

        } catch (err) {
            // Lưu lỗi vào state
            setError(err.message);
            console.error("Failed to create stop:", err);
            // Ném lỗi ra ngoài để component biết là đã thất bại
            throw err;
        } finally {
            // Luôn tắt trạng thái loading sau khi hoàn tất
            setIsLoading(false);
        }
    }, []);

    // Trả về các state và hàm để component có thể sử dụng
    return { createStop, isLoading, error, data };
};

export default useApiStop;