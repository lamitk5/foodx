package vn.edu.crs.foodx.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
        Mỗi user chỉ có 1 hồ sơ.
    */
    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private AppUser user;


    @Column(length = 20)
    private String gender;


    private Integer age;


    @Column(name = "weight_kg")
    private Double weight;


    @Column(name = "height_cm")
    private Double height;


    @Column(name = "target_weight_kg")
    private Double targetWeight;


    /*
        Ví dụ:
        1.2 ít vận động
        1.375 nhẹ
        ...
    */
    private Double activity;


    @Column(length = 100)
    private String diet;


    @Column(columnDefinition = "TEXT")
    private String allergies;


    @Column(columnDefinition = "TEXT")
    private String dislikes;


    @Column(name = "created_at")
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    public UserProfile() {
    }


    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;

        if (activity == null) {
            activity = 1.2;
        }

        if (diet == null) {
            diet = "Ăn linh tinh";
        }
    }


    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public AppUser getUser() {
        return user;
    }


    public void setUser(AppUser user) {
        this.user = user;
    }


    public String getGender() {
        return gender;
    }


    public void setGender(String gender) {
        this.gender = gender;
    }


    public Integer getAge() {
        return age;
    }


    public void setAge(Integer age) {
        this.age = age;
    }


    public Double getWeight() {
        return weight;
    }


    public void setWeight(Double weight) {
        this.weight = weight;
    }


    public Double getHeight() {
        return height;
    }


    public void setHeight(Double height) {
        this.height = height;
    }


    public Double getTargetWeight() {
        return targetWeight;
    }


    public void setTargetWeight(Double targetWeight) {
        this.targetWeight = targetWeight;
    }


    public Double getActivity() {
        return activity;
    }


    public void setActivity(Double activity) {
        this.activity = activity;
    }


    public String getDiet() {
        return diet;
    }


    public void setDiet(String diet) {
        this.diet = diet;
    }


    public String getAllergies() {
        return allergies;
    }


    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }


    public String getDislikes() {
        return dislikes;
    }


    public void setDislikes(String dislikes) {
        this.dislikes = dislikes;
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