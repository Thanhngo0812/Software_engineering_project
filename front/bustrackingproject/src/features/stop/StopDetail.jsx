// src/pages/StopDetail.js

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StaticMap from './StaticMap';
import './css/StopDetail.css'; 
// 1. Import hook vừa tạo
import useFetchStopById from './api/useFetchStopById';
import LoadingSpinner from '../../components/LoadingSpinner';// (Giả sử bạn có component này)

const StopDetail = () => {
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID từ URL

    // 2. Gọi hook để lấy dữ liệu
    const { data: stopData, loading, error } = useFetchStopById(id);

    const handleBack = () => {
        navigate(-1);
    };

    // 3. Xử lý các trạng thái
    if (loading) {
        return <LoadingSpinner isLoading={true} />;
    }

    if (error) {
        return (
            <div className="stop-detail-container">
                <h2>Lỗi</h2>
                <p> {error}</p>
                <button className="btn btn-back" onClick={handleBack}>
                    Back
                </button>
            </div>
        );
    }

    if (!stopData) {
        return (
            <div className="stop-detail-container">
                <h2>Không tìm thấy</h2>
                <p>Không tìm thấy điểm dừng với ID: {id}</p>
                <button className="btn btn-back" onClick={handleBack}>
                    Back
                </button>
            </div>
        );
    }
    
    // Dữ liệu tọa độ (đảm bảo đúng định dạng lat/lng)
    const coordinates = {
        lat: stopData.latitude,
        lng: stopData.longitude
    };

    // 4. Hiển thị dữ liệu
    return (
        <div className="stop-detail-container">
            <div className="stop-detail-header">
                <div className="stop-detail-info">
                    <h2>{stopData.stopName}</h2>
                    <p>{stopData.address}</p>
                </div>
                <button className="btn btn-back" onClick={handleBack}>
                    BACK
                </button>
            </div>
            <div className="stop-detail-map">
                {/* Truyền tọa độ vào bản đồ */}
                <StaticMap apiKey={apiKey} center={coordinates} />
            </div>
        </div>
    );
};

export default StopDetail;