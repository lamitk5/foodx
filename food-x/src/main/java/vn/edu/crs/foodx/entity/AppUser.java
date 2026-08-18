package vn.edu.crs.foodx.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_users_email",
                        columnNames = "email"
                )
        }
)
public class AppUser {

    /* =====================================================
       ID
    ===================================================== */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /* =====================================================
       THÔNG TIN CƠ BẢN
    ===================================================== */

    @Column(name = "full_name", length = 150)
    private String fullName;


    /*
     * Tạm thời KHÔNG đặt nullable = false.
     *
     * Lý do:
     * Database hiện tại của bạn đã có user cũ
     * nhưng user đó chưa có email.
     *
     * Nếu đặt NOT NULL ngay bây giờ,
     * Hibernate có thể lỗi khi ALTER bảng.
     */
    @Column(
            name = "email",
            length = 190,
            unique = true
    )
    private String email;


    /*
     * Đây sẽ là mật khẩu đã mã hóa BCrypt.
     *
     * TUYỆT ĐỐI không lưu mật khẩu gốc.
     */
    @Column(
            name = "password",
            length = 255
    )
    private String password;


    /* =====================================================
       QUYỀN
    ===================================================== */

    @Column(
            name = "role",
            length = 30
    )
    private String role = "USER";


    /*
     * true  = tài khoản được sử dụng
     * false = tài khoản bị khóa
     */
    @Column(name = "enabled")
    private Boolean enabled = true;


    /* =====================================================
       AVATAR
    ===================================================== */

    @Column(
            name = "avatar_url",
            length = 500
    )
    private String avatarUrl;


    /* =====================================================
       THỜI GIAN
    ===================================================== */

    @Column(
            name = "created_at",
            updatable = false
    )
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    /* =====================================================
       JPA EVENTS
    ===================================================== */

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;


        if (this.role == null ||
                this.role.isBlank()) {

            this.role = "USER";
        }


        if (this.enabled == null) {

            this.enabled = true;
        }
    }


    @PreUpdate
    public void onUpdate() {

        this.updatedAt =
                LocalDateTime.now();
    }


    /* =====================================================
       CONSTRUCTOR
    ===================================================== */

    public AppUser() {
    }


    public AppUser(
            String fullName,
            String email,
            String password
    ) {

        this.fullName = fullName;
        this.email = email;
        this.password = password;

        this.role = "USER";
        this.enabled = true;
    }


    /* =====================================================
       GETTER / SETTER
    ===================================================== */

    public Long getId() {

        return id;
    }


    public void setId(Long id) {

        this.id = id;
    }


    public String getFullName() {

        return fullName;
    }


    public void setFullName(
            String fullName
    ) {

        this.fullName = fullName;
    }


    public String getEmail() {

        return email;
    }


    public void setEmail(
            String email
    ) {

        this.email = email;
    }


    public String getPassword() {

        return password;
    }


    public void setPassword(
            String password
    ) {

        this.password = password;
    }


    public String getRole() {

        return role;
    }


    public void setRole(
            String role
    ) {

        this.role = role;
    }


    public Boolean getEnabled() {

        return enabled;
    }


    public void setEnabled(
            Boolean enabled
    ) {

        this.enabled = enabled;
    }


    public String getAvatarUrl() {

        return avatarUrl;
    }


    public void setAvatarUrl(
            String avatarUrl
    ) {

        this.avatarUrl = avatarUrl;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {

        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }


    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {

        this.updatedAt = updatedAt;
    }
}