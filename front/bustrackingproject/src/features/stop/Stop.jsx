import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Stops.css'; // Import file CSS
import useFetchStops from './api/useFetchStop';
import useAPIDeleteStop from './api/useAPIDeleteStop';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Stops = () => {
        // 1. STATE QUẢN LÝ CÁC THAM SỐ TRUY VẤN
        const [currentPage, setCurrentPage] = useState(0); // API thường dùng base 0
        const [pageSize, setPageSize] = useState(5);
        const [searchQuery, setSearchQuery] = useState('');
        const [sortCriteria, setSortCriteria] = useState('updatedAt,desc'); // Sắp xếp mặc định
        const [loadingdlt, setLoadingdlt] = useState(false);
        let location = useLocation();
        const navigate = useNavigate();
      
        useEffect(() => {
          if (location.state && location.state.message) {
            toast.success(location.state.message);
            navigate(location.pathname, { replace: true, state: {} });
          }
        }, [location, navigate]);
        // 2. SỬ DỤNG HOOK ĐỂ LẤY DỮ LIỆU
        const { 
            data: stops, 
            pagination, 
            loading, 
            error, 
            refetch 
        } = useFetchStops({
            currentPage,
            size: pageSize,
            query: searchQuery,
            sort: sortCriteria,
        });

    // Sau này, bạn sẽ dùng 'setTotalPages' và 'setCurrentPage' với dữ liệu từ API

   
   // Xử lý thay đổi trang (Base 0)
    // newPage: Là chỉ số trang Base 0 được truyền vào từ các nút
    const handlePageChange = (newPage) => {
        // Đảm bảo newPage nằm trong phạm vi hợp lệ
        const safePage = Math.min(Math.max(0, newPage), pagination.totalPages - 1);
        setCurrentPage(safePage);
    };

    const createPageDescrip = () =>{
        if(pagination.totalPages==1){
            return `${currentPage*pageSize+1} - ${pagination.totalElements} of ${pagination.totalElements}`;
        }
        else {
            return `${currentPage*pageSize+1} - ${currentPage*pageSize+pageSize} of ${pagination.totalElements}`
        }
    }

    // HÀM HỖ TRỢ RENDER CÁC NÚT SỐ TRANG
    const renderPageNumbers = () => {
        const pages = [];
        const totalPages = pagination.totalPages;
        const current = pagination.number; // Base 0 từ API

        // Hiển thị tối đa 5 nút số trang
        let startPage = Math.max(0, current - 2);
        let endPage = Math.min(totalPages - 1, current + 2);

        if (current <= 2) {
            endPage = Math.min(totalPages - 1, 4);
        }
        if (current >= totalPages - 3) {
            startPage = Math.max(0, totalPages - 5);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            // Hiển thị i + 1 (Base 1) nhưng gọi handlePageChange(i) (Base 0)
                
            pages.push(
                <button
                key={i}
                className={`page-number ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
              disabled={loading}>
                {i+1}
            </button>
            );
        }
        return pages;
    };
    //xóa stop
    const handleDeleteStop = (stopId, stopName) => {
        Swal.fire({
            title: 'Are you sure you want to delete?',
            html: `Stop **${stopName}** (ID: ${stopId}) will be permanently deleted. This action **could not be completed**!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Màu đỏ cho nút Xóa
            cancelButtonColor: '#3085d6', // Màu xanh cho nút Hủy
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            // Custom CSS (Nếu cần)
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary'
            },
            reverseButtons: true // Đảo vị trí nút
        }).then((result) => {
            if (result.isConfirmed) {
                // LOGIC XÓA SẼ ĐƯỢC THỰC HIỆN Ở ĐÂY
                handleDelete(stopId);
                // TODO: Gọi API deleteStop(stopId)
                
                // Hiển thị thông báo xóa thành công (Tùy chọn

                // Tải lại dữ liệu sau khi xóa
                
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Người dùng nhấn Hủy
            }
        });
    };

    const { 
        deleteStop: apiDeleteStop, 
        errordlt:errordlt,
        successdlt: successdlt,
        resetStatus: resetDeleteStatus 
    } = useAPIDeleteStop();
    
    // HÀM XỬ LÝ XÓA ĐƯỢC ĐƠN GIẢN HÓA
    const handleDelete = async (id) => {
        setLoadingdlt(true);
        // GỌI HOOK
        const result = await apiDeleteStop(id);
        if (result.success) {
          toast.info('deleted stop with id:'+id);
          refetch();
          
        } else {
          toast.error(result.message);

        }
        setLoadingdlt(false);

    };

//component chinh
    return (
        <div className="stops-main-content">
             <LoadingSpinner isLoading={loadingdlt} />
            {/* TIÊU ĐỀ VÀ NÚT TẠO */}
            <div className="content-header">
                <h2>
                    <span role="img" aria-label="stops-icon">🚌</span> Stops
                </h2>
                <Link to="/school/stop/createstop">
                <button className="create-button">
                    CREATE +
                </button>
                </Link>
            </div>

            {/* PHẦN NỘI DUNG CHÍNH (BOX TRẮNG) */}
            <div className="content-body">
                <input
                    type="text"
                    placeholder="Search by stop name or address"
                    className="search-bar"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* BẢNG DỮ LIỆU */}
                <table className="stops-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Routes</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stops.map((stop) => (
                            <tr key={stop.id}>
                                <td>{stop.id}</td>
                                <td>{stop.name}</td>
                                <td>{stop.address}</td>
                                <td>{stop.routes==0?'No Route':stop.routes}</td>
                                <td>{stop.created}</td>
                                <td className="actions-cell">
                                    <Link to={`/school/stop/${stop.id}`} 
                                        className="icon-button" 
                                        title="View"

                                    ><FontAwesomeIcon icon={faEye} /></Link>
                                    <button className="icon-button" title="Edit"
                                             onClick={() => navigate(`/school/stop/edit/${stop.id}`)}

                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                    <button className="icon-button" onClick={() => handleDeleteStop(stop.id, stop.name)} title="Delete">
                                        <FontAwesomeIcon icon={faTrash} />
                                        
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* THANH PHÂN TRANG */}
                <div className="pagination-container">
                <div style={{ marginRight: 10 }}>{createPageDescrip()}</div>
                    <button
                        className="page-nav"
                        onClick={() => handlePageChange(currentPage-1)}
                        disabled={currentPage === 0}
                    >
                        &laquo; Previous
                    </button>
                    
                    {renderPageNumbers()}

                    <button
                        className="page-nav"
                        onClick={() => handlePageChange(currentPage+1)}
                        disabled={currentPage === pagination.totalPages-1}
                    >
                        Next &raquo;
                    </button>
                </div>
            </div>
        </div>
       
    );
};

export default Stops;