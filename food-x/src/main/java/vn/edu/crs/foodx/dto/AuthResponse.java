package vn.edu.crs.foodx.dto;

public class AuthResponse {

    private boolean authenticated;

    private String message;

    private Long userId;

    private String fullName;

    private String email;

    private String role;

    private String avatarUrl;


    public AuthResponse() {
    }


    public AuthResponse(
            boolean authenticated,
            String message,
            Long userId,
            String fullName,
            String email,
            String role,
            String avatarUrl
    ) {

        this.authenticated =
                authenticated;

        this.message =
                message;

        this.userId =
                userId;

        this.fullName =
                fullName;

        this.email =
                email;

        this.role =
                role;

        this.avatarUrl =
                avatarUrl;
    }


    public boolean isAuthenticated() {

        return authenticated;
    }


    public void setAuthenticated(
            boolean authenticated
    ) {

        this.authenticated =
                authenticated;
    }


    public String getMessage() {

        return message;
    }


    public void setMessage(
            String message
    ) {

        this.message =
                message;
    }


    public Long getUserId() {

        return userId;
    }


    public void setUserId(
            Long userId
    ) {

        this.userId =
                userId;
    }


    public String getFullName() {

        return fullName;
    }


    public void setFullName(
            String fullName
    ) {

        this.fullName =
                fullName;
    }


    public String getEmail() {

        return email;
    }


    public void setEmail(
            String email
    ) {

        this.email =
                email;
    }


    public String getRole() {

        return role;
    }


    public void setRole(
            String role
    ) {

        this.role =
                role;
    }


    public String getAvatarUrl() {

        return avatarUrl;
    }


    public void setAvatarUrl(
            String avatarUrl
    ) {

        this.avatarUrl =
                avatarUrl;
    }
}