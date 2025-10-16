import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

import '../../assets/style/StudentPage.css'
import { useStudents } from '../../hooks/useStudent';

const StudentPage = () => {
    const { students, loading, error } = useStudents();
    console.log(students)
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    useEffect(() => {
        if (error) {
            // Sử dụng error.message để gọi toast
            toast.error(error); 
        }
        // Dependency Array: Sẽ chạy lại mỗi khi đối tượng 'error' thay đổi
        // (Chúng ta sẽ đảm bảo nó luôn thay đổi ở handleSubmit/validate)
    }, [error]); 
    return (<>
        {/* Hello world */}
        <div className="wrap">
          <div className="card" role="region" aria-label="Students panel">
            <div className="topbar">
              <div className="title">
                <div className="icon" aria-hidden="">
                  {/* clipboard icon */}
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 2h6v2h2a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1h2V2z"
                      stroke="#c98f3a"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                Students
              </div>
              <div className="actions">
                <button className="btn btn--download" title="Download .xlsx">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3v10"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 11l4 4 4-4"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x={4}
                      y={16}
                      width={16}
                      height={4}
                      rx={1}
                      fill="rgba(255,255,255,0.06)"
                    />
                  </svg>
                  DOWNLOAD .XLSX TEMPLATE
                </button>
                <button className="btn btn--upload" title="Upload .xlsx">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3v10"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 11l4 4 4-4"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  UPLOAD .XLSX FILE
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div className="tabs" role="tablist" aria-label="Student tabs">
              <div className="tab tab--active" role="tab" data-filter="active">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden=""
                >
                  <path
                    d="M12 2v20"
                    stroke="#c77f2a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                ACTIVE
              </div>
              <div className="tab" role="tab" data-filter="suspended">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden=""
                >
                  <circle cx={12} cy={12} r={8} stroke="#8f9599" strokeWidth="1.2" />
                </svg>
                SUSPENDED
              </div>
              <div className="tab" role="tab" data-filter="under-review">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden=""
                >
                  <path d="M4 12h16" stroke="#8f9599" strokeWidth="1.2" />
                </svg>
                UNDER REVIEW
              </div>
              <div className="tab" role="tab" data-filter="out-of-coins">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden=""
                >
                  <path
                    d="M12 2a10 10 0 110 20 10 10 0 010-20z"
                    stroke="#8f9599"
                    strokeWidth="1.2"
                  />
                </svg>
                OUT OF COINS
              </div>
            </div>
            {/* Search */}
            <div className="search">
              <input
                id="searchInput"
                placeholder="Search"
                aria-label="Search students"
              />
            </div>
            <div className="table-wrap" role="table" aria-label="Students table">
              <table>
                <thead>
                  <tr>
                    <th className="col-id">ID</th>
                    <th className="col-name">Name</th>
                    <th className="col-parent">Parent Name</th>
                    <th className="col-email">Student Email</th>
                    <th className="col-status">Status</th>
                    <th className="col-created">Created</th>
                    <th className="actions-cell">Actions</th>
                  </tr>
                </thead>
                <tbody id="tableBody">
                  {/* rows will be inserted here by JS for easier demo */}
                  {students.map(r => (
                        <tr key={r.id}>
                            <td data-label="ID">{r.studentId}</td>
                            <td data-label="Name">{r.fullname}</td>
                            <td data-label="Parent Name">{r.parentFullname}</td>
                            <td data-label="Student Email">{r.studentEmail}</td>
                            <td data-label="Status">
                                <span className={`badge ${r.accountLocked ? 'inactive': 'active'}`}>
                                    {capitalize(r.accountLocked?'Bị khóa':'active')}
                                </span>
                            </td>
                            <td data-label="Created">{r.accountCreatedAt}</td>
                            <td className="actions-cell" data-label="Actions">
                            <button className="icon-btn" title="View" aria-label="View">
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button className="icon-btn" title="Edit" aria-label="Edit">
                                <FontAwesomeIcon icon={faPenToSquare} />
                            </button>
                            <button className="icon-btn" title="Delete" aria-label="Delete">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="rows-per">
                Rows per page:
                <select id="rowsPer">
                  <option>5</option>
                  <option selected="">10</option>
                  <option>20</option>
                </select>
              </div>
              <div id="paginationInfo">1-4 of 4</div>
            </div>
          </div>
        </div>
      </>
      );
};

export default StudentPage;