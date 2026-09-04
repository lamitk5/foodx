package com.nhom6.foodx.social.dto;

public record LikeResponse(
        boolean liked,
        long likeCount
) {
}