import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash, faUserGraduate, faPlus } from '@fortawesome/free-solid-svg-icons';

import './StudentPage.css'; // CSS mới đồng bộ

// --- MOCK DATA (Dữ liệu giả) ---
const MOCK_STUDENTS = [
    { id: 1, studentId: 'STU001', fullName: 'Lê Hoàng Minh', parentName: 'Lê Văn Cường', email: 'minh@example.com', grade: 'Lớp 3A', status: 'Active' },
    { id: 2, studentId: 'STU002', fullName: 'Phạm Ngọc Hân', parentName: 'Phạm Thị Duyên', email: 'han@example.com', grade: 'Lớp 5B', status: 'Active' },
    { id: 3, studentId: 'STU003', fullName: 'Nguyễn Văn An', parentName: 'Nguyễn Văn Ba', email: 'an@example.com', grade: 'Lớp 2C', status: 'Inactive' },
    { id: 4, studentId: 'STU004', fullName: 'Trần Thị Bưởi', parentName: 'Trần Văn Cam', email: 'buoi@example.com', grade: 'Lớp 4A', status: 'Active' },
    { id: 5, studentId: 'STU005', fullName: 'Hoàng Văn Em', parentName: 'Hoàng Thị Chị', email: 'em@example.com', grade: 'Lớp 1A', status: 'Active' },
    { id: 6, studentId: 'STU006', fullName: 'Đỗ Nam Trung', parentName: 'Đỗ Văn Bắc', email: 'trung@example.com', grade: 'Lớp 5A', status: 'Active' },
];

const StudentPage = () => {
    // State quản lý dữ liệu
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 5;

    // 1. Xử lý Tìm kiếm (Client-side filtering)
    const filteredStudents = students.filter(student => 
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Xử lý Phân trang (Client-side pagination)
    const pageCount = Math.ceil(filteredStudents.length / pageSize);
    const displayedStudents = filteredStudents.slice(
        currentPage * pageSize, 
        (currentPage + 1) * pageSize
    );

    // 3. Hàm chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pageCount) {
            setCurrentPage(newPage);
        }
    };

    // 4. Xử lý Xóa (Mock Delete)
    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to remove student "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Xóa khỏi state mock
                setStudents(prev => prev.filter(s => s.id !== id));
                toast.success(`Deleted student ${name}`);
            }
        });
    };

    const createPageDescrip = () => {
        if (filteredStudents.length === 0) return '0 - 0 of 0';
        const start = currentPage * pageSize + 1;
        const end = Math.min((currentPage + 1) * pageSize, filteredStudents.length);
        return `${start} - ${end} of ${filteredStudents.length}`;
    };

    return (
        <div className="student-main-content">
            {/* HEADER */}
            <div className="content-header">
                <h2>
                    <span role="img" aria-label="student-icon">
                        <FontAwesomeIcon icon={faUserGraduate} />
                    </span> 
                    Students Management
                </h2>
                <button className="create-button" onClick={() => toast.info("This is a mock feature for demo.")}>
                    CREATE +
                </button>
            </div>

            {/* BODY */}
            <div className="content-body">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search by Name, ID or Parent..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(0); // Reset về trang 1 khi search
                    }}
                />

                {/* Table */}
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Parent Name</th>
                            <th>Email</th>
                            <th>Class</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedStudents.length > 0 ? (
                            displayedStudents.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.studentId}</td>
                                    <td><strong>{student.fullName}</strong></td>
                                    <td>{student.parentName}</td>
                                    <td>{student.email}</td>
                                    <td>{student.grade}</td>
                                    <td>
                                        <span className={`status-badge ${student.status.toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="icon-button" title="View">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button className="icon-button" title="Edit">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        <button 
                                            className="icon-button" 
                                            title="Delete"
                                            onClick={() => handleDelete(student.id, student.fullName)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                                    No students found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination-container">
                    <div style={{ marginRight: 10, fontSize: '14px', color: '#666' }}>
                        {createPageDescrip()}
                    </div>
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
                        disabled={currentPage >= pageCount - 1}
                    >
                        Next &raquo;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;