package vn.edu.crs.foodx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.edu.crs.foodx.dto.ExpiryRequest;
import vn.edu.crs.foodx.dto.FridgeItemRequest;
import vn.edu.crs.foodx.dto.FridgeItemResponse;
import vn.edu.crs.foodx.service.FridgeService;

import java.util.List;

@RestController
@RequestMapping("/api/fridge")
public class FridgeApiController {

    private final FridgeService fridgeService;


    public FridgeApiController(
            FridgeService fridgeService
    ) {

        this.fridgeService =
                fridgeService;
    }


    /* =====================================================
       GET ALL
    ===================================================== */

    @GetMapping
    public List<FridgeItemResponse> getAll() {

        return fridgeService.getAll();
    }


    /* =====================================================
       ADD
    ===================================================== */

    @PostMapping
    public FridgeItemResponse add(
            @RequestBody
            FridgeItemRequest request
    ) {

        return fridgeService.add(
                request
        );
    }


    /* =====================================================
       + / - QUANTITY
    ===================================================== */

    @PatchMapping(
            "/{id}/quantity"
    )
    public ResponseEntity<FridgeItemResponse>
    changeQuantity(

            @PathVariable
            Long id,

            @RequestParam
            Double delta

    ) {

        return fridgeService
                .changeQuantity(
                        id,
                        delta
                )
                .map(
                        ResponseEntity::ok
                )
                .orElseGet(
                        () ->
                                ResponseEntity
                                        .noContent()
                                        .build()
                );
    }


    /* =====================================================
       EXPIRY
    ===================================================== */

    @PatchMapping(
            "/{id}/expiry"
    )
    public FridgeItemResponse updateExpiry(

            @PathVariable
            Long id,

            @RequestBody
            ExpiryRequest request

    ) {

        return fridgeService
                .updateExpiry(
                        id,
                        request.expiresAt()
                );
    }


    /* =====================================================
       DELETE
    ===================================================== */

    @DeleteMapping(
            "/{id}"
    )
    public ResponseEntity<Void> delete(

            @PathVariable
            Long id

    ) {

        fridgeService.delete(
                id
        );


        return ResponseEntity
                .noContent()
                .build();
    }
}