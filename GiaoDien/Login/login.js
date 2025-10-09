function checkNull() {
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let alertE = document.getElementById('alertE');
    let alertPw = document.getElementById('alertPw');

    if (email && email.value.trim() === "") {
        email.focus();
        email.style.borderColor = "red";
        //email.style.marginBottom = '0';
        alertE.innerText = 'Email is required';
        //return false; // dừng lại, báo lỗi
    } else {
        alertE.innerText = ''
        email.style.borderColor = "black";
    }

    if (password && password.value.trim() === "") {
        password.focus();
        password.style.borderColor = "red";
        //password.style.marginBottom = '0';
        alertPw.innerText = 'Password is required';
        return false;
    } else {
        alertPw.innerText = ''
        password.style.borderColor = "black";
    }

    return true; // hợp lệ
}




import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Trang công khai (Public)
import LoginScreen from './features/auth/pages/LoginScreen.jsx';
import StudentPage from './features/student/Studentpage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

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
        <Route path="/" element={<LoginScreen />} />
        <Route element={<ProtectedRoute requiredRole="USER" />}>
                  <Route path="/student" element={<StudentPage/>} />
        </Route>

        
       
      </Routes>
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










import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';

// Component Đăng nhập
const LoginScreen = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPass, setErrorPass] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleBlurEmail = async (e) => {
    if(!username.trim()){
      setErrorEmail('Email không được để trống')
    }
    else if(!EMAIL_REGEX.test(username)){
      setErrorEmail('Email không hợp lệ')
    }
    else{
      setErrorEmail('')
    }
  }

  const handleBlurPassWord = async (e) => {
    if(!username.trim()){
      setErrorEmail('Email không được để trống')
    }
    else if(!EMAIL_REGEX.test(username)){
      setErrorEmail('Email không hợp lệ')
    }
    else{
      setErrorEmail('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(username, password);
    } catch (error) {
      setError('Failed to login: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  // Hook xác thực và Định tuyến
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // Xử lý sự kiện khi submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Ngăn trình duyệt load lại trang

//     if (!email || !password) {
//       setError('Vui lòng nhập email và mật khẩu.');
//       return;
//     }

        // Bổ sung kiểm tra định dạng email
        // const emailRegex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
        // if (!emailRegex.test(email)) {
        //     setError('Định dạng email không hợp lệ.');
        //     return;
        // }
//     setError(null);
//     setIsLoading(true);

//     try {
//       // 1. Gọi API Đăng nhập
//       // Hàm này giả định sẽ trả về { token, role } nếu thành công.
//       const response = await loginApi(email, password); 

//       // 2. Cập nhật trạng thái xác thực
//       login(response.token, response.role); 

//       // 3. Chuyển hướng người dùng dựa trên Vai trò (Role)
//       if (response.role === 'ADMIN') {
//         navigate('/admin', { replace: true });
//       } else if (response.role === 'DRIVER') {
//         navigate('/driver-dashboard', { replace: true });
//       } else {
//         // Mặc định cho PARENT/STUDENT
//         navigate('/', { replace: true }); 
//       }

//     } catch (apiError) {
//       // 4. Xử lý lỗi từ API
//       setError(apiError.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
//       setIsLoading(false);
//     }
//   };

  return (
    <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <link rel="stylesheet" href="login.css" />
  <div id="background">
    <div id="login-box">
      <h1>SchoolTripTrack</h1>
      <form action="#" onSubmit={handleSubmit}>
        <p>Please sign-in to your account to start</p>
        <div id="input-box">
          <span id="icon">
            <ion-icon name="person" />
          </span>
          <input type="text" placeholder="Email" id="email" style={errorEmail ? {borderColor: 'red'} : {}}  value={username} onBlur={handleBlurEmail} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <span id="alertE" style={{ display: errorEmail ? 'inline' : 'none' }}> 
    <FontAwesomeIcon icon={faExclamation} style={{ color: 'red', marginRight: '5px' }} /> 
    {/* Chỉ cần render trực tiếp errorEmail */}
    {errorEmail} 
</span>
        <div id="input-box">
          <span id="icon">
            <ion-icon name="lock-closed" />
          </span>
          <input type="password" value={password} placeholder="Password" id="password" onBlur={handleBlurPassWord} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <span id="alertPw" />
        <div id="remember-forgot">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password</a>
        </div>
        <button id="btn" type="submit">
          Login +{error}
        </button>
      </form>
    </div>
  </div>
</>

  );
};

export default LoginScreen;