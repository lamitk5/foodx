package vn.edu.crs.foodx.dto;

import java.time.LocalDate;

public record ExpiryRequest(

        LocalDate expiresAt

) {
}