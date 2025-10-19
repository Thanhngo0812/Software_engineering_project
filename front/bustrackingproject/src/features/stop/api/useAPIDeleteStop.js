import { useState, useCallback } from 'react';
import authService from '../../auth/services/authService';
// URL API gốc
const API_URL = 'http://localhost:8081/api/school/v1/stops'; 

/**
 * Custom hook để xử lý yêu cầu DELETE Stop.
 * Xử lý các trạng thái loading, lỗi (bao gồm lỗi ràng buộc 409), và thành công.
 * * @returns {object} - Trả về: deleteStop (hàm xóa), loading, error, success, và resetStatus.
 */
function useAPIDeleteStop() {
    // Trạng thái: đang tải
    const [loading, setLoading] = useState(false);
    // Trạng thái: lỗi (chứa thông báo lỗi)
    const [errordlt, setError] = useState(null);
    // Trạng thái: thành công
    const [successdlt, setSuccess] = useState(false);

    /**
     * Hàm thực hiện xóa Stop
     * @param {number} stopId - ID của Stop cần xóa
     * @returns {object} - Kết quả xóa (success: boolean, message: string)
     */
    const deleteStop = useCallback(async (stopId) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/${stopId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
            });

            if (response.ok) {
                // Thành công: HTTP 200 hoặc 204
                setSuccess(true);
                return { success: true, message: `Stop ID ${stopId} đã được xóa thành công.` };
            }

            // Xử lý lỗi dựa trên mã trạng thái HTTP
            const result = await response.json();
            
            if (response.status === 404) {
                throw new Error(result.error || `Stop ID ${stopId} not Found.`);
            }
            
            if (response.status === 409) {
                // Xung đột (Conflict) - Lỗi ràng buộc StopRoute
                throw new Error(result.error || `Cannot deleted. This stop is being used for at least a route.`);
            }

            // Lỗi chung
            throw new Error(result.error || `Lỗi xóa không xác định (Status: ${response.status}).`);

        } catch (err) {
            setError(err.message);
            setSuccess(false);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm reset trạng thái lỗi và thành công (dùng để đóng thông báo)
    const resetStatus = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return { deleteStop, loading, errordlt, successdlt, resetStatus };
}

export default useAPIDeleteStop;
