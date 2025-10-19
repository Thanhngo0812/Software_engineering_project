import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Trang công khai (Public)
import LoginScreen from './features/auth/pages/LoginScreen.jsx';
import StudentPage from './features/student/Studentpage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
//trang school
import Stop from './features/stop/Stop.jsx';
import CreateStopForm from './features/stop/CreateStopForm.jsx';
import StopDetail from './features/stop/StopDetail.jsx';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/adminlayout/AdminLayout.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


// // Trang cần bảo vệ (Protected)
// import BusMap from './features/BusMap/BusMap.jsx';
// import AdminDashboard from './features/Admin/AdminDashboard.jsx';
// import StudentProfile from './features/Student/StudentProfile.jsx';

// Component bảo vệ (Custom Hook)
// import ProtectedRoute from './hooks/ProtectedRoute.jsx'; 

function App() {
  return (
   
    <AuthProvider> 
    <BrowserRouter>
      <Routes>
        
        {/* 1. Tuyến Công khai: Trang Đăng nhập */}
        {/* <Route path="/admin" element={<AdminLayout/>} /> */}
        <Route element={<PublicRoute />}>
        <Route path="/" element={<LoginScreen />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="ROLE_SCHOOL" />}>
        <Route path="/school" element={<AdminLayout />}>
            <Route index element={<Stop />} />
            <Route path="stop" element={<Stop />} />
            <Route path="stop/createstop" element={<CreateStopForm/>} />
            <Route path="/school/stop/:id" element={<StopDetail />} />
            {/* <Route path="product" element={<Product />} /> */}
          </Route>
                  {/* <Route path="/student" element={<StudentPage/>} /> */}
        </Route>
        <Route element={<ProtectedRoute requiredRole="ROLE_STUDENT" />}>
                  <Route path="/student" element={<StudentPage/>} />
        </Route>

        
       
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
    </AuthProvider> 
 
  );
}

export default App;


/*
 2. Tuyến Bảo vệ: Cần đăng nhập để truy cập
        <Route element={<ProtectedRoute />}>
            // {/* Tuyến chung cho tất cả user (Driver/Parent) */
 //           <Route path="/" element={<BusMap />} /> {/* Trang chính sau khi đăng nhập */}

            // {/* Tuyến dành cho Phụ huynh/Học sinh */}
//            <Route path="/profile" element={<StudentProfile />} /> 
            
            // {/* Tuyến dành cho Admin */}
//            <Route path="/admin" element={<AdminDashboard />} /> 
//        </Route>
        
        // {/* 3. Tuyến 404 (Không tìm thấy) */}
//        <Route path="*" element={<div>404: Page Not Found</div>} />