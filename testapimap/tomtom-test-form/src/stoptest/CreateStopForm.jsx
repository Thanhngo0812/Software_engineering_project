// src/CreateStopForm.js
import React, { useState, useCallback } from 'react';
import MapPicker from './MapPicker';
import AddressSearch from './AddressSearch';
import useApiStop from './api/useAPIStop';
import './CreateStopForm.css';

const initialPosition = { lng: 106.6952, lat: 10.7770 };

const CreateStopForm = () => {
    const { createStop, isLoading, error, data } = useApiStop();
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;

    const [stopName, setStopName] = useState('');
    const [address, setAddress] = useState('135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1');
    const [position, setPosition] = useState(initialPosition);
    const [inputposition, setinputPosition] = useState(initialPosition);

    const [mapCenter, setMapCenter] = useState(initialPosition);

    // Hàm này được gọi khi CHỌN một mục từ danh sách gợi ý
    const handleAddressSelect = useCallback((selected) => {
        setAddress(selected.address); // Cập nhật state address
        setPosition(selected.position);
        setinputPosition(selected.position);
        setMapCenter(selected.position);
    }, []);

    // Hàm này được gọi khi KÉO THẢ marker trên bản đồ
    const handlePositionChange = useCallback((newPosition, newAddress) => {
        setAddress(newAddress); // Cập nhật state address
        setPosition(newPosition);
        setMapCenter(newPosition);
    }, []);
    
    // ... (các hàm handleSave, handleCancel không đổi) ...
    const handleSave = async () => {
        if (!stopName || !address) {
            alert('Vui lòng nhập đầy đủ Tên và Địa chỉ điểm dừng.');
            return;
        }

        const dataToSave = {
            stopName: stopName,
            address: address,
            latitude: position.lat,
            longitude: position.lng,
        };
        console.error(dataToSave);

        try {
            const result = await createStop(dataToSave);
            // Nếu API gọi thành công
            alert(`Tạo điểm dừng thành công! ID: ${result.id}`);
            // Optional: Reset form sau khi lưu thành công
            // handleCancel(); 
        } catch (err) {
            // Lỗi đã được set trong hook, ở đây chỉ cần thông báo cho người dùng
            console.error("Save failed:", err);
            // State 'error' từ hook sẽ tự động cập nhật và hiển thị trên UI
        }
    };

    const handleCancel = () => {
        console.log('Cancel button clicked');
        // Reset form hoặc điều hướng đi nơi khác
        setStopName('');
        setAddress('');
        setPosition(initialPosition);
    };
    return (
        <div className="container">
            <div className="form-panel">
                <h2>Create new stop</h2>
                <div className="form-group">
                    <label htmlFor="stop-name">Name</label>
                    <input
                        id="stop-name"
                        type="text"
                        placeholder="Stop Name"
                        value={stopName}
                        onChange={(e) => setStopName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stop-address">Address</label>
                    <AddressSearch
                        apiKey={apiKey}
                        value={address} // Truyền state address xuống làm value
                        onChange={setAddress} // Truyền hàm setAddress xuống để cập nhật khi gõ
                        onSelect={handleAddressSelect} // Xử lý khi chọn một địa chỉ
                    />
                </div>
                <div className="button-group">
                    <button className="btn btn-secondary" onClick={handleCancel}>CANCEL</button>
                    <button className="btn btn-primary" onClick={handleSave}>SAVE</button>
                </div>
            </div>
            <div className="map-panel">
                <MapPicker
                    apiKey={apiKey}
                    initialPosition={position}
                    inputPosition={inputposition}
                    center={mapCenter}
                    onPositionChange={handlePositionChange}
                />
            </div>
        </div>
    );
};

export default CreateStopForm;