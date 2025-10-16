import logo from './logo.svg';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateStopForm from './stoptest/CreateStopForm';

import './App.css';

function App() {
  return(
    <BrowserRouter>
      <Routes>
        
        {/* 1. Tuyến Công khai: Trang Đăng nhập */}
        {/* <Route element={<PublicRoute />}> */}
        <Route path="/createstoptest" element={<CreateStopForm />} />
        {/* </Route> */}
        </Routes>
    </BrowserRouter>
 
  );
}

export default App;
