import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation,faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import '../../../assets/style/login.css'
import { toast } from 'react-toastify';
import authService from '../services/authService';
// Component Đăng nhập
const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPass, setErrorPass] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.message) {
      toast.error(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (error && error.message) {
        // Sử dụng error.message để gọi toast
        toast.error(error.message); 
    }
    // Dependency Array: Sẽ chạy lại mỗi khi đối tượng 'error' thay đổi
    // (Chúng ta sẽ đảm bảo nó luôn thay đổi ở handleSubmit/validate)
}, [error]); 

  const handleBlurEmail = async (e) => {
    if(!username.trim()){
      setErrorEmail('Email cannot be empty.')
    }
    else if(!EMAIL_REGEX.test(username)){
      // setErrorEmail('Email không hợp lệ')
      setErrorEmail('')
    }
    else{
      setErrorEmail('')
    }
  }

  const handleBlurPassWord = async (e) => {
    if(!password.trim()){
      setErrorPass('Password cannot be empty.')
    }
    else if(password.length<8){
      setErrorPass('Password must be at least 8 characters long.')
    }
    else{
      setErrorPass('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError({id:Date.now(),message:'Invalid username or password.'});
      return;
    }
    if(errorEmail||errorPass){
      setError({id:Date.now(),message:'Invalid username or password.'});
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const response = await login(username, password);
      if (response.token) {
        if(authService.getUserRole()[0]=='ROLE_ADMIN'){
          navigate('/student', { replace: true });        }
      }
    } catch (error) {
      console.log(1)
      setError({id:Date.now(),message:'Login failed: ' + (error.response?.data?.error || error.error||'System error')});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <link rel="stylesheet" href="login.css" />
  <LoadingSpinner isLoading={loading} />
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
    <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red', marginRight: '5px' }} /> 
    {/* Chỉ cần render trực tiếp errorEmail */}
    {errorEmail} 
</span>
        <div id="input-box">
          <span id="icon">
            <ion-icon name="lock-closed" />
          </span>
          <input type="password" value={password} placeholder="Password" id="password"style={errorPass ? {borderColor: 'red'} : {}}  onBlur={handleBlurPassWord} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <span id="alertPw" style={{ display: errorPass ? 'inline' : 'none' }}> 
    <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red', marginRight: '5px' }} /> 
    {/* Chỉ cần render trực tiếp errorEmail */}
    {errorPass} 
</span>
        <div id="remember-forgot">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password</a>
        </div>
        <button id="btn" type="submit">
          Login 
        </button>
      </form>
    </div>
  </div>
</>

  );
};

export default LoginScreen;