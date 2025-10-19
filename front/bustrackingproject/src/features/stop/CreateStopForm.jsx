// src/CreateStopForm.js
import React, { useState, useCallback,useEffect } from 'react';
import MapPicker from './MapPicker';
import AddressSearch from './components/SearchAddress';
import useApiStop from './api/useAPIStop';
import { Navigate,useNavigate, Outlet } from 'react-router-dom';
import './css/CreateStopForm.css';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

const initialPosition = { lng: 106.6952, lat: 10.7770 };

const CreateStopForm = () => {
    const { createStop, isLoading, error, data } = useApiStop();
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stopName, setStopName] = useState('');
    const [address, setAddress] = useState('135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1');
    const [position, setPosition] = useState(initialPosition);
    const [inputposition, setinputPosition] = useState(initialPosition);

    const [mapCenter, setMapCenter] = useState(initialPosition);
    useEffect(() => {
        if (error && error.message) {
            // Sử dụng error.message để gọi toast
            toast.error(error.message); 
        }
        // Dependency Array: Sẽ chạy lại mỗi khi đối tượng 'error' thay đổi
        // (Chúng ta sẽ đảm bảo nó luôn thay đổi ở handleSubmit/validate)
    }, [error]); 
    
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
        // if (!stopName || !address) {
        //     toast.error('Please enter the full Name and Stop Address.');
        //     return;
        // }

        const dataToSave = {
            stopName: stopName,
            address: address,
            latitude: position.lat,
            longitude: position.lng,
        };

        try {
            setLoading(true);
            const result = await createStop(dataToSave);
            // Nếu API gọi thành công
            navigate('/school/stop', {
                replace: true,
                state: { message: `Your Stop created! ID: ${result.id}` }
              });
        } catch (err) {
            // Lỗi đã được set trong hook, ở đây chỉ cần thông báo cho người dùng
            if(err.message=='Your session has been expired'){
                return <Navigate to="/" replace state={{ message: 'Your session has expired.' }} />;
            }
            toast.error("Save failed: "+err.message);
            // State 'error' từ hook sẽ tự động cập nhật và hiển thị trên UI
        }
        finally{
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/school/stop', {
            replace: true,
          });
    };
    return (
        <div className="container-stop">
            <LoadingSpinner isLoading={loading} />
            <div className="form-panel-stop">
                <h2>Create new stop</h2>
                <div className="form-group-stop">
                    <label htmlFor="stop-name">Name</label>
                    <input
                        id="stop-name"
                        type="text"
                        placeholder="Stop Name"
                        value={stopName}
                        onChange={(e) => setStopName(e.target.value)}
                    />
                </div>
                <div className="form-group-stop">
                    <label htmlFor="stop-address">Address</label>
                    <AddressSearch
                        apiKey={apiKey}
                        value={address} // Truyền state address xuống làm value
                        onChange={setAddress} // Truyền hàm setAddress xuống để cập nhật khi gõ
                        onSelect={handleAddressSelect} // Xử lý khi chọn một địa chỉ
                    />
                </div>
                <div className="button-group">
                    <button className="btn btn-secondary-stop" onClick={handleCancel}>CANCEL</button>
                    <button className="btn btn-primary-stop" onClick={handleSave}>SAVE</button>
                </div>
            </div>
            <div className="map-panel-stop">
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