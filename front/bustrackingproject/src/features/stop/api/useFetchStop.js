import { useState, useEffect, useCallback } from 'react';

// !!! BẠN CHỈ CẦN THAY THẾ URL NÀY BẰNG API CỦA BẠN !!!
const API_URL = 'http://localhost:8081/api/school/v1/stops'; 

/**
 * Custom hook để lấy danh sách các trạm dừng (stops) có phân trang từ backend.
 * * @param {object} params - Các tham số để truy vấn.
 * @param {number} params.currentPage - Số trang hiện tại.
 * @param {number} params.size - Kích thước mỗi trang.
 * @param {string} params.query - Từ khóa tìm kiếm.
 * @param {string} params.sort - Tiêu chí sắp xếp (ví dụ: 'name,asc').
 * @returns {object} - Trả về một đối tượng chứa dữ liệu, trạng thái loading, lỗi, và thông tin phân trang.
 */
function useFetchStops({ currentPage, size, query, sort }) {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        number: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sử dụng useCallback để không tạo lại hàm fetch mỗi lần render
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Sử dụng AbortController để hủy request nếu component unmount
        const controller = new AbortController();
        const signal = controller.signal;

        try {
            // Xây dựng URL với các tham số truy vấn
            const params = new URLSearchParams({
                page: currentPage,
                size: size,
                sort: sort,
            });
            if (query) {
                params.append('query', query);
            }
            const response = await fetch(`${API_URL}?${params.toString()}`, { signal });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            setData(result.content);
            setPagination({
                totalPages: result.totalPages,
                totalElements: result.totalElements,
                number: result.number,
            });

        } catch (err) {
            if (err.name !== 'AbortError') {
                 setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }

        // Cleanup function: hủy request khi component bị unmount hoặc params thay đổi
        return () => {
            controller.abort();
        };
    }, [currentPage, size, query, sort]);

    // Chạy fetchData mỗi khi có một trong các tham số thay đổi
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, pagination, loading, error, refetch: fetchData };
}

export default useFetchStops;
