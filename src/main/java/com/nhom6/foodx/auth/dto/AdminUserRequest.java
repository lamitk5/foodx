package com.nhom6.foodx.auth.dto;

import com.nhom6.foodx.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserRequest {

    @Size(min = 3, max = 50, message = "Username phải từ 3 đến 50 ký tự")
    private String username;

    @Email(message = "Email không đúng định dạng")
    private String email;

    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;

    private String fullName;

    private User.Role role;
}
