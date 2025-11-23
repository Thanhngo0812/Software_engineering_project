import { useState, useCallback } from 'react';
import axios from 'axios';

const CORE_URL = 'http://localhost:8081';
const TRACKING_URL = 'http://localhost:8082';

export const useDriverApp = () => {
    const [loading, setLoading] = useState(false);

    // 1. Lấy danh sách chuyến đi của tài xế hôm nay
    // (Trong thực tế sẽ lấy ID từ token đăng nhập, ở đây mình giả lập driverId = 1)
    const getMyTrips = async (driverId = 1) => {
        setLoading(true);
        try {
            // Gọi API lấy tất cả rồi filter (hoặc backend nên có API filter by driver)
            const today = new Date().toLocaleDateString('en-CA');
            console.log(today)
            const res = await axios.get(`${CORE_URL}/api/v1/trips?date=${today}`);
            // Filter tạm ở client
            return res.data.filter(t => t.driverId === driverId && t.status !== 'cancelled'&&t.status !== 'completed');
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // 2. Bắt đầu chuyến đi (Gọi Core để đổi status -> Core sẽ bắn Kafka)
    const startTrip = async (tripId) => {
        try {
            await axios.patch(`${CORE_URL}/api/v1/trips/${tripId}/status?status=in_progress`);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // 3. Kết thúc chuyến đi
    const completeTrip = async (tripId) => {
        try {
            await axios.patch(`${CORE_URL}/api/v1/trips/${tripId}/status?status=completed`);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // 4. Lấy chi tiết lộ trình (để vẽ map và biết tọa độ các trạm)
    const getTripRoute = async (tripId) => {
        try {
            const res = await axios.get(`${CORE_URL}/api/v1/trips/${tripId}/stops`);
            return res.data; // Trả về danh sách stops đã sắp xếp đúng chiều
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    // 5. Gửi tọa độ về Tracking Service (Quan trọng)
    const sendLocationUpdate = async (tripId, lat, lng, speed) => {
        try {
            console.log(lat,lng)
            await axios.post(`${TRACKING_URL}/api/v1/tracking/update`, {
                tripId,
                latitude: lat,
                longitude: lng,
                speed
            });
        } catch (err) {
            // Không log lỗi này quá nhiều vì nó bắn liên tục
            console.warn("Tracking update failed", err.message);
        }
    };

    // 6. Lấy danh sách học sinh tại trạm (Manifest)
    const getStudentManifest = async (tripId, stopId) => {
        setLoading(true);
        try {
            // Cần đảm bảo Backend có API này
            const res = await axios.get(`${CORE_URL}/api/v1/trips/${tripId}/stops/${stopId}/manifest`);
            return res.data; 
        } catch (err) {
            console.error("Failed to fetch manifest", err);
            // Mock data nếu backend chưa kịp viết API này
            return mockManifest(stopId);
        } finally {
            setLoading(false);
        }
    };
  const markStudentAttendance = async (tripId, studentId, status, lat, lng) => {
        try {
            await axios.post(`${CORE_URL}/api/v1/attendance`, {
                tripId,
                studentId,
                status, // BOARDED, ALIGHTED, ABSENT
                latitude: lat,
                longitude: lng
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Mock data dự phòng
    const mockManifest = (stopId) => {
        return {
            stopName: "Trạm Demo #" + stopId,
            students: [
                { id: 1, name: "Nguyễn Văn A", status: "WAITING" },
                { id: 2, name: "Trần Thị B", status: "WAITING" }
            ]
        };
    };

    return {
        loading,
        getMyTrips,
        startTrip,
        completeTrip,
        getTripRoute,
        sendLocationUpdate,
        getStudentManifest,
        markStudentAttendance
    };
};