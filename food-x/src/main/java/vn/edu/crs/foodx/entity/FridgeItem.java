package vn.edu.crs.foodx.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fridge_items")
public class FridgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
        Một thực phẩm có thể xuất hiện trong tủ lạnh.

        fridge_items.food_id
                ↓
             foods.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "food_id",
            nullable = false
    )
    private Food food;


    /*
        Số lượng thực tế trong tủ
     */
    @Column(nullable = false)
    private Double quantity;


    /*
        g, kg, quả, hộp, lít...
     */
    @Column(nullable = false, length = 30)
    private String unit;


    /*
        Ngày hết hạn do người dùng đặt.
     */
    @Column(name = "expires_at")
    private LocalDate expiresAt;


    /*
        Ghi chú riêng.

        Ví dụ:
        "Mua sáng nay"
        "Đã mở hộp"
     */
    @Column(columnDefinition = "TEXT")
    private String note;


    @Column(name = "created_at")
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    public FridgeItem() {
    }


    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;

        if (quantity == null) {
            quantity = 1.0;
        }
    }


    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
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


    public Food getFood() {
        return food;
    }


    public void setFood(Food food) {
        this.food = food;
    }


    public Double getQuantity() {
        return quantity;
    }


    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }


    public String getUnit() {
        return unit;
    }


    public void setUnit(String unit) {
        this.unit = unit;
    }


    public LocalDate getExpiresAt() {
        return expiresAt;
    }


    public void setExpiresAt(LocalDate expiresAt) {
        this.expiresAt = expiresAt;
    }


    public String getNote() {
        return note;
    }


    public void setNote(String note) {
        this.note = note;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}