import { useState, useEffect, useCallback } from 'react';
import authService from '../../auth/services/authService';

/**
 * Một custom hook để fetch chi tiết một điểm dừng (stop) bằng ID.
 * @param {string | number} id - ID của điểm dừng cần lấy.
 * @returns {{data: object | null, loading: boolean, error: string | null, refetch: function}}
 */
const useFetchStopById = (id) => {
    // State để lưu dữ liệu của stop
    const [data, setData] = useState(null);
    // State để theo dõi trạng thái đang tải
    const [loading, setLoading] = useState(true);
    // State để lưu lỗi nếu có
    const [error, setError] = useState(null);

    // 1. Dùng useCallback để định nghĩa hàm fetch, phụ thuộc vào `id`
    //    Việc này giúp hàm có thể được gọi lại để "refetch"
    const fetchStop = useCallback(async () => {
        // Nếu không có `id`, không làm gì cả
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setData(null); // Xóa dữ liệu cũ trước khi fetch mới

        try {
            // Lấy token từ localStorage (giống như các hook khác)
            // Endpoint của bạn (sử dụng port 8081 như các API trước)
            const API_ENDPOINT = `http://localhost:8081/api/school/v1/stops/${id}`;

            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                }
            });

            // Xử lý các lỗi HTTP (như 404 Not Found, 403 Forbidden...)
            if (!response.ok) {
                let errorMsg = `Lỗi HTTP! Status: ${response.status} ${response.statusText}`; // Thông báo lỗi mặc định
        
                try {
                    // Thử đọc lỗi dưới dạng JSON
                    const errorData = await response.json();
                    // Nếu server CÓ gửi về message lỗi (ví dụ: từ Spring Boot)
                    if (errorData && errorData.error) {
                        errorMsg = errorData.error;
                    }
                } catch (jsonError) {
                    // Bỏ qua lỗi này - nó chỉ có nghĩa là body rỗng hoặc không phải JSON
                    // Chúng ta sẽ dùng errorMsg mặc định đã tạo ở trên
                }
        
                // Ném ra lỗi với thông báo đã được xử lý
                throw new Error(errorMsg);
            }

            // Nếu thành công, parse JSON và lưu vào state
            const result = await response.json();
            setData(result);

        } catch (err) {
            setError(err.message);
        } finally {
            // Luôn tắt loading sau khi hoàn tất (dù thành công hay thất bại)
            setLoading(false);
        }
    }, [id]); // Hàm này sẽ được tạo lại mỗi khi `id` thay đổi

    // 2. Chạy hàm fetch này khi component mount hoặc khi `id` thay đổi
    useEffect(() => {
        fetchStop();
    }, [fetchStop]); // Phụ thuộc vào `fetchStop` (đã được bọc bởi useCallback)

    // 3. Trả về các state và hàm `refetch`
    return { data, loading, error, refetch: fetchStop };
};

export default useFetchStopById;