package vn.edu.crs.foodx.dto;

public record ProfileRequest(

        String name,

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