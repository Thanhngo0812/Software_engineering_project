package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fullname", nullable = false)
    private String fullname;

    @Column(name = "parent_fullname", nullable = false)
    private String parentFullname;

    @Column(name = "student_email", unique = true)
    private String studentEmail;

    // --- Mối quan hệ Một-Một (One-to-One) với User ---
    // Mỗi Student sẽ được liên kết với một User account duy nhất.
    // Cột 'user_id' trong bảng 'students' sẽ là khóa ngoại trỏ tới 'id' của bảng 'users'.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    // --- Constructors ---

    public Student() {
    }

    public Student(Long id, String fullname, String parentFullname, String studentEmail, User user) {
        this.id = id;
        this.fullname = fullname;
        this.parentFullname = parentFullname;
        this.studentEmail = studentEmail;
        this.user = user;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getParentFullname() {
        return parentFullname;
    }

    public void setParentFullname(String parentFullname) {
        this.parentFullname = parentFullname;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // --- equals() and hashCode() ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return Objects.equals(id, student.id) && Objects.equals(studentEmail, student.studentEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, studentEmail);
    }

    // --- toString() ---

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", fullname='" + fullname + '\'' +
                ", parentFullname='" + parentFullname + '\'' +
                ", studentEmail='" + studentEmail + '\'' +
                ", userId=" + (user != null ? user.getId() : "null") +
                '}';
    }
}