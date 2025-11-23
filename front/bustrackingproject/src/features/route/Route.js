import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash, faRoute } from '@fortawesome/free-solid-svg-icons';

import LoadingSpinner from '../../components/LoadingSpinner'; 
import { useFetchRoutes, useApiRoute } from './api/useRouteApi.js'; 
import './route.css'; 

const Routess = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortCriteria, setSortCriteria] = useState('updatedAt,desc');
    
    let location = useLocation();
    const navigate = useNavigate();

    // Hiển thị thông báo từ trang Create quay về
    useEffect(() => {
        if (location.state && location.state.message) {
            toast.success(location.state.message);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // Lấy dữ liệu
    const { data: routes, pagination, loading, refetch } = useFetchRoutes({
        currentPage,
        size: pageSize,
        query: searchQuery,
        sort: sortCriteria,
    });

    // Hook xử lý API (Delete)
    const { deleteRoute, isLoading: loadingDelete } = useApiRoute();

    // Xử lý phân trang
    const handlePageChange = (newPage) => {
        const safePage = Math.min(Math.max(0, newPage), (pagination.totalPages || 1) - 1);
        setCurrentPage(safePage);
    };

    const createPageDescrip = () => {
        if (!pagination.totalElements) return '0 - 0 of 0';
        const end = Math.min((currentPage + 1) * pageSize, pagination.totalElements);
        return `${currentPage * pageSize + 1} - ${end} of ${pagination.totalElements}`;
    };

    // Xử lý Xóa
    const handleDeleteRoute = (routeId, routeName) => {
        Swal.fire({
            title: 'Are you sure?',
            html: `Route **${routeName}** (ID: ${routeId}) will be deleted along with its stops assignment.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await deleteRoute(routeId);
                if (res.success) {
                    toast.success(`Route ${routeName} deleted successfully`);
                    refetch();
                } else {
                    toast.error('Failed to delete: active route');
                }
            }
        });
    };

    return (
        <div className="stops-main-content"> 
            <LoadingSpinner isLoading={loading || loadingDelete} />
            
            <div className="content-header">
                <h2>
                    <span role="img" aria-label="route-icon"><FontAwesomeIcon icon={faRoute} /></span> Routes Management
                </h2>
                <Link to="/school/route/create">
                    <button className="create-button">CREATE +</button>
                </Link>
            </div>

            <div className="content-body">
                <input
                    type="text"
                    placeholder="Search by route name..."
                    className="search-bar"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <table className="stops-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Route Name</th>
                            <th>Description</th>
                            <th>Total Stops</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes && routes.length > 0 ? (
                            routes.map((route) => (
                                <tr key={route.id}>
                                    <td>{route.id}</td>
                                    <td>{route.routeName}</td>
                                    <td>{route.description}</td>
                                    <td>{route.stopCount || 0}</td> 
                                    <td>{route.createdAt}</td>
                                    <td className="actions-celll">
                                        <button  className="icon-button" 
                                        title="View Details" 
                                            onClick={() => navigate(`/school/route/${route.id}`)}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                            
                                        </button>
                                        {/* Nút Edit: Chuyển hướng sang trang form kèm ID */}
                                        <button 
                                            className="icon-button" 
                                            title="Edit"
                                            onClick={() => navigate(`/school/route/edit/${route.id}`)}
                                        >
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        <button 
                                            className="icon-button" 
                                            onClick={() => handleDeleteRoute(route.id, route.routeName)} 
                                            title="Delete">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{textAlign: 'center'}}>No routes found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination-container">
                    <div style={{ marginRight: 10 }}>{createPageDescrip()}</div>
                    <button
                        className="page-nav"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        &laquo; Previous
                    </button>
                    <span className="page-number active">{currentPage + 1}</span>
                    <button
                        className="page-nav"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= (pagination.totalPages - 1)}
                    >
                        Next &raquo;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Routess;