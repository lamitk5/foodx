package vn.edu.crs.foodx.dto;

public record ProfileResponse(

        Long userId,

        Long profileId,

        String name,

        String avatarUrl,

        String gender,

        Integer age,

        Double weight,

        Double height,

        Double target,

        Double activity,

        String diet,

        String allergies,

        String dislikes

) {
}