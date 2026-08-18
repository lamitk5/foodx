package vn.edu.crs.foodx.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.crs.foodx.entity.AppUser;

import java.util.Optional;

@Repository
public interface AppUserRepository
        extends JpaRepository<AppUser, Long> {

    /*
     * Dùng khi đăng nhập.
     */
    Optional<AppUser> findByEmailIgnoreCase(
            String email
    );


    /*
     * Dùng khi đăng ký để kiểm tra
     * email đã tồn tại hay chưa.
     */
    boolean existsByEmailIgnoreCase(
            String email
    );


    /*
     * Giữ lại hàm cũ vì ProfileService
     * hiện tại có thể vẫn đang dùng
     * user đầu tiên trong database.
     *
     * Sau khi đăng nhập hoàn chỉnh
     * ta sẽ bỏ cách này.
     */
    Optional<AppUser> findFirstByOrderByIdAsc();
}