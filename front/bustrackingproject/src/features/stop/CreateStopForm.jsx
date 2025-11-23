import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Thêm useParams
import MapPicker from './MapPicker';
import AddressSearch from './components/SearchAddress';
import useApiStop from './api/useAPIStop';
import './css/CreateStopForm.css';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

const initialPosition = { lng: 106.6952, lat: 10.7770 };

const CreateStopForm = () => {
    // 1. Lấy ID từ URL để xác định chế độ Edit
    const { id } = useParams(); 
    const isEditMode = !!id;

    // 2. Lấy thêm các hàm updateStop, getStopById từ hook
    const { createStop, updateStop, getStopById, isLoading, error } = useApiStop();
    
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;
    const navigate = useNavigate();
    
    // State Form
    const [stopName, setStopName] = useState('');
    const [address, setAddress] = useState('135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1');
    const [position, setPosition] = useState(initialPosition);
    const [inputposition, setinputPosition] = useState(initialPosition);
    const [mapCenter, setMapCenter] = useState(initialPosition);

    // 3. LOAD DỮ LIỆU CŨ (NẾU ĐANG EDIT)
    useEffect(() => {
        if (isEditMode) {
            const fetchStopData = async () => {
                try {
                    const data = await getStopById(id);
                    // Fill dữ liệu vào form
                    setStopName(data.name || data.stopName); // Tùy tên trường backend trả về
                    setAddress(data.address);
                    
                    // Fill tọa độ map
                    if (data.latitude && data.longitude) {
                        const pos = { lat: data.latitude, lng: data.longitude };
                        setPosition(pos);
                        setinputPosition(pos);
                        setMapCenter(pos);
                    }
                } catch (err) {
                    toast.error("Could not load stop details.");
                    navigate('/school/stop');
                }
            };
            fetchStopData();
        }
    }, [id]); // Chạy lại khi ID thay đổi

    // Xử lý lỗi chung
    useEffect(() => {
        if (error && error.message) {
            toast.error(error.message);
        }
    }, [error]);

    const handleAddressSelect = useCallback((selected) => {
        setAddress(selected.address);
        setPosition(selected.position);
        setinputPosition(selected.position);
        setMapCenter(selected.position);
    }, []);

    const handlePositionChange = useCallback((newPosition, newAddress) => {
        setAddress(newAddress);
        setPosition(newPosition);
        setMapCenter(newPosition);
    }, []);
    
    // 4. XỬ LÝ LƯU (CREATE HOẶC UPDATE)
    const handleSave = async () => {
        if (!stopName || !address) {
           toast.warning('Please enter Stop Name and Address.');
           return;
        }

        const dataToSave = {
            stopName: stopName,
            address: address,
            latitude: position.lat,
            longitude: position.lng,
        };

        try {
            if (isEditMode) {
                // Gọi API Update
                await updateStop(id, dataToSave);
                navigate('/school/stop', {
                    replace: true,
                    state: { message: `Stop updated successfully!` }
                });
            } else {
                // Gọi API Create
                const result = await createStop(dataToSave);
                navigate('/school/stop', {
                    replace: true,
                    state: { message: `Stop created! ID: ${result.id}` }
                });
            }
        } catch (err) {
            // Lỗi đã được useEffect xử lý hiển thị toast
        }
    };

    const handleCancel = () => {
        navigate('/school/stop', { replace: true });
    };

    return (
        <div className="container-stop">
            <LoadingSpinner isLoading={isLoading} />
            <div className="form-panel-stop">
                {/* Đổi tiêu đề linh động */}
                <h2>{isEditMode ? 'Edit Stop' : 'Create new stop'}</h2>
                
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
                        value={address}
                        onChange={setAddress}
                        onSelect={handleAddressSelect}
                    />
                </div>
                <div className="button-group">
                    <button className="btn btn-secondary-stop" onClick={handleCancel}>CANCEL</button>
                    <button className="btn btn-primary-stop" onClick={handleSave}>
                        {/* Đổi tên nút linh động */}
                        {isEditMode ? 'UPDATE' : 'SAVE'}
                    </button>
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