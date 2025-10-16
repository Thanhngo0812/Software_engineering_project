import { useState, useEffect } from 'react';
import authService from '../features/auth/services/authService';
// Custom hook để lấy và quản lý danh sách sinh viên
export const useStudents = () => {
  // State lưu danh sách sinh viên
  const [students, setStudents] = useState([]);
  // State để biết khi nào đang tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để lưu lỗi nếu có
  const [error, setError] = useState(null);

  // useEffect sẽ chạy một lần duy nhất khi hook được sử dụng lần đầu
  useEffect(() => {
    // Định nghĩa hàm gọi API
    const fetchStudents = async () => {
      try {

        // Gọi đến API của bạn. Thay thế URL này bằng URL thực tế.
        const response = await fetch('http://localhost:8081/api/admin/v1/students', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader()
                
            }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setStudents(data); // Cập nhật danh sách sinh viên
      } catch (err) {
        setError(err.message); // Cập nhật lỗi
      } finally {
        setLoading(false); // Luôn tắt loading sau khi hoàn tất
      }
    };

    // Gọi hàm
    fetchStudents();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  // Trả về các state để component có thể sử dụng
  return { students, loading, error };
};