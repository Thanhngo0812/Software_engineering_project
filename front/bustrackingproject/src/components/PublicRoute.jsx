import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../features/auth/services/authService'; // Đường dẫn tới service của bạn

const PublicRoute = () => {
  const isAuthenticated = AuthService.isLoggedIn();
  console.log(isAuthenticated)
  // Nếu người dùng đã đăng nhập, không cho phép họ vào trang public (Login, Register...)
  if (isAuthenticated) {
    // Lấy danh sách quyền của người dùng
    const userRoles = AuthService.getUserRole();
    console.log(userRoles)
    // Mặc định chuyển hướng đến trang dashboard chung
    let redirectPath = '/'; 

    // Kiểm tra và xác định trang cần chuyển hướng dựa trên role
    if (userRoles.includes('ROLE_ADMIN')) {
      redirectPath = '/admin';
      return <Navigate to={redirectPath} replace />;
    } else if (userRoles.includes('ROLE_STUDENT')) {
      redirectPath = '/student';
      return <Navigate to={redirectPath} replace />;
    } else if (userRoles.includes('ROLE_SCHOOL')) {
    redirectPath = '/school';
    return <Navigate to={redirectPath} replace />;
  }
    // Thêm các else if khác cho các role khác nếu cần
    
    // Thực hiện chuyển hướng
    
  }

  // Nếu người dùng chưa đăng nhập, cho phép họ truy cập
  // <Outlet /> sẽ render component con (ví dụ: trang LoginPage)
  return <Outlet />;
};

export default PublicRoute;