package vn.edu.crs.foodx.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "foods")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
        Dùng để nối với ID ở frontend:
        egg, chicken, beef, potato...
        Nguyên liệu người dùng tự thêm có thể để null.
     */
    @Column(name = "source_key", unique = true, length = 100)
    private String sourceKey;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String type = "Nguyên liệu";

    /*
        Năng lượng
     */
    private Double kcal = 0.0;

    /*
        Thành phần dinh dưỡng
     */
    private Double protein = 0.0;

    private Double carb = 0.0;

    private Double fat = 0.0;

    /*
        Thành phần / mô tả chi tiết
     */
    @Column(columnDefinition = "TEXT")
    private String components;

    /*
        Ví dụ:
        Giảm cân
        Tăng cân
        Tăng cơ
        Cân bằng
     */
    @Column(length = 150)
    private String benefit;

    /*
        Ảnh món/nguyên liệu
     */
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    /*
        Số lượng mặc định khi thêm từ catalog
     */
    @Column(name = "default_quantity")
    private Double defaultQuantity = 1.0;

    @Column(length = 30)
    private String unit;

    /*
        Số ngày sử dụng mặc định
     */
    @Column(name = "default_expiry_days")
    private Integer defaultExpiryDays = 7;

    /*
        true = người dùng tự nhập
        false = nguyên liệu của hệ thống
     */
    @Column(name = "custom_food")
    private Boolean customFood = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;


    public Food() {
    }


    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (type == null) {
            type = "Nguyên liệu";
        }

        if (kcal == null) {
            kcal = 0.0;
        }

        if (protein == null) {
            protein = 0.0;
        }

        if (carb == null) {
            carb = 0.0;
        }

        if (fat == null) {
            fat = 0.0;
        }

        if (defaultQuantity == null) {
            defaultQuantity = 1.0;
        }

        if (defaultExpiryDays == null) {
            defaultExpiryDays = 7;
        }

        if (customFood == null) {
            customFood = false;
        }
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


    public String getSourceKey() {
        return sourceKey;
    }


    public void setSourceKey(String sourceKey) {
        this.sourceKey = sourceKey;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getType() {
        return type;
    }


    public void setType(String type) {
        this.type = type;
    }


    public Double getKcal() {
        return kcal;
    }


    public void setKcal(Double kcal) {
        this.kcal = kcal;
    }


    public Double getProtein() {
        return protein;
    }


    public void setProtein(Double protein) {
        this.protein = protein;
    }


    public Double getCarb() {
        return carb;
    }


    public void setCarb(Double carb) {
        this.carb = carb;
    }


    public Double getFat() {
        return fat;
    }


    public void setFat(Double fat) {
        this.fat = fat;
    }


    public String getComponents() {
        return components;
    }


    public void setComponents(String components) {
        this.components = components;
    }


    public String getBenefit() {
        return benefit;
    }


    public void setBenefit(String benefit) {
        this.benefit = benefit;
    }


    public String getImageUrl() {
        return imageUrl;
    }


    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


    public Double getDefaultQuantity() {
        return defaultQuantity;
    }


    public void setDefaultQuantity(Double defaultQuantity) {
        this.defaultQuantity = defaultQuantity;
    }


    public String getUnit() {
        return unit;
    }


    public void setUnit(String unit) {
        this.unit = unit;
    }


    public Integer getDefaultExpiryDays() {
        return defaultExpiryDays;
    }


    public void setDefaultExpiryDays(Integer defaultExpiryDays) {
        this.defaultExpiryDays = defaultExpiryDays;
    }


    public Boolean getCustomFood() {
        return customFood;
    }


    public void setCustomFood(Boolean customFood) {
        this.customFood = customFood;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}