package vn.edu.crs.foodx.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vn.edu.crs.foodx.dto.FridgeItemRequest;
import vn.edu.crs.foodx.dto.FridgeItemResponse;
import vn.edu.crs.foodx.entity.Food;
import vn.edu.crs.foodx.entity.FridgeItem;
import vn.edu.crs.foodx.repository.FoodRepository;
import vn.edu.crs.foodx.repository.FridgeItemRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FridgeService {

    private final FoodRepository foodRepository;
    private final FridgeItemRepository fridgeItemRepository;


    public FridgeService(
            FoodRepository foodRepository,
            FridgeItemRepository fridgeItemRepository
    ) {

        this.foodRepository =
                foodRepository;

        this.fridgeItemRepository =
                fridgeItemRepository;
    }


    /* =====================================================
       LẤY TOÀN BỘ TỦ LẠNH
    ===================================================== */

    @Transactional(readOnly = true)
    public List<FridgeItemResponse> getAll() {

        return fridgeItemRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /* =====================================================
       THÊM THỰC PHẨM
    ===================================================== */

    @Transactional
    public FridgeItemResponse add(
            FridgeItemRequest request
    ) {

        if (
                request.name() == null ||
                        request.name().isBlank()
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên thực phẩm không được để trống"
            );
        }


        String sourceKey =
                request.sourceKey();


        /*
         * Nguyên liệu tự nhập không có sourceKey
         * → Food X tự sinh một key riêng.
         */
        if (
                sourceKey == null ||
                        sourceKey.isBlank()
        ) {

            sourceKey =
                    "custom-" +
                            UUID.randomUUID();
        }


        final String finalSourceKey =
                sourceKey;


        /*
         * Tìm food đã có trong database.
         * Nếu chưa có → tạo mới.
         */
        Food food =
                foodRepository
                        .findBySourceKey(
                                finalSourceKey
                        )
                        .orElseGet(
                                () ->
                                        createFood(
                                                request,
                                                finalSourceKey
                                        )
                        );


        /*
         * Nếu thực phẩm đó đã có trong tủ
         * thì tăng số lượng thay vì tạo dòng trùng.
         */
        Optional<FridgeItem> existing =
                fridgeItemRepository
                        .findFirstByFood_Id(
                                food.getId()
                        );


        FridgeItem fridgeItem;


        if (existing.isPresent()) {

            fridgeItem =
                    existing.get();


            double oldQuantity =
                    fridgeItem.getQuantity() == null
                            ? 0
                            : fridgeItem.getQuantity();


            double addedQuantity =
                    request.quantity() == null
                            ? 1
                            : request.quantity();


            fridgeItem.setQuantity(
                    oldQuantity +
                            addedQuantity
            );


            if (
                    request.unit() != null &&
                            !request.unit().isBlank()
            ) {

                fridgeItem.setUnit(
                        request.unit()
                );
            }


            if (
                    request.expiresAt() != null
            ) {

                fridgeItem.setExpiresAt(
                        request.expiresAt()
                );
            }


            if (
                    request.note() != null
            ) {

                fridgeItem.setNote(
                        request.note()
                );
            }

        } else {

            fridgeItem =
                    new FridgeItem();


            fridgeItem.setFood(
                    food
            );


            fridgeItem.setQuantity(
                    request.quantity() == null
                            ? 1.0
                            : request.quantity()
            );


            fridgeItem.setUnit(
                    request.unit() == null ||
                            request.unit().isBlank()
                            ? "phần"
                            : request.unit()
            );


            fridgeItem.setExpiresAt(
                    request.expiresAt() != null
                            ? request.expiresAt()
                            : LocalDate.now()
                            .plusDays(
                                    food.getDefaultExpiryDays() == null
                                            ? 7
                                            : food.getDefaultExpiryDays()
                            )
            );


            fridgeItem.setNote(
                    request.note()
            );
        }


        FridgeItem saved =
                fridgeItemRepository.save(
                        fridgeItem
                );


        return toResponse(
                saved
        );
    }


    /* =====================================================
       TẠO FOOD MỚI
    ===================================================== */

    private Food createFood(
            FridgeItemRequest request,
            String sourceKey
    ) {

        Food food =
                new Food();


        food.setSourceKey(
                sourceKey
        );


        food.setName(
                request.name()
        );


        food.setType(
                request.type() == null ||
                        request.type().isBlank()
                        ? "Nguyên liệu"
                        : request.type()
        );


        food.setKcal(
                valueOrZero(
                        request.kcal()
                )
        );


        food.setProtein(
                valueOrZero(
                        request.protein()
                )
        );


        food.setCarb(
                valueOrZero(
                        request.carb()
                )
        );


        food.setFat(
                valueOrZero(
                        request.fat()
                )
        );


        food.setComponents(
                request.components()
        );


        food.setBenefit(
                request.benefit()
        );


        food.setImageUrl(
                request.imageUrl()
        );


        food.setDefaultQuantity(
                request.quantity() == null
                        ? 1.0
                        : request.quantity()
        );


        food.setUnit(
                request.unit()
        );


        food.setCustomFood(
                Boolean.TRUE.equals(
                        request.customFood()
                )
        );


        return foodRepository.save(
                food
        );
    }


    /* =====================================================
       TĂNG / GIẢM SỐ LƯỢNG
    ===================================================== */

    @Transactional
    public Optional<FridgeItemResponse> changeQuantity(
            Long id,
            Double delta
    ) {

        FridgeItem item =
                findFridgeItem(
                        id
                );


        double current =
                item.getQuantity() == null
                        ? 0
                        : item.getQuantity();


        double change =
                delta == null
                        ? 0
                        : delta;


        double newQuantity =
                current +
                        change;


        /*
         * Nếu <= 0 thì xóa khỏi tủ.
         */
        if (
                newQuantity <= 0
        ) {

            fridgeItemRepository.delete(
                    item
            );

            return Optional.empty();
        }


        item.setQuantity(
                newQuantity
        );


        FridgeItem saved =
                fridgeItemRepository.save(
                        item
                );


        return Optional.of(
                toResponse(
                        saved
                )
        );
    }


    /* =====================================================
       SỬA HẠN
    ===================================================== */

    @Transactional
    public FridgeItemResponse updateExpiry(
            Long id,
            LocalDate expiresAt
    ) {

        if (
                expiresAt == null
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày hết hạn không được để trống"
            );
        }


        FridgeItem item =
                findFridgeItem(
                        id
                );


        item.setExpiresAt(
                expiresAt
        );


        return toResponse(
                fridgeItemRepository.save(
                        item
                )
        );
    }


    /* =====================================================
       XÓA
    ===================================================== */

    @Transactional
    public void delete(
            Long id
    ) {

        FridgeItem item =
                findFridgeItem(
                        id
                );


        fridgeItemRepository.delete(
                item
        );
    }


    /* =====================================================
       FIND
    ===================================================== */

    private FridgeItem findFridgeItem(
            Long id
    ) {

        return fridgeItemRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Không tìm thấy thực phẩm trong tủ lạnh"
                                )
                );
    }


    /* =====================================================
       ENTITY → JSON DTO
    ===================================================== */

    private FridgeItemResponse toResponse(
            FridgeItem item
    ) {

        Food food =
                item.getFood();


        return new FridgeItemResponse(

                item.getId(),

                food.getId(),

                food.getSourceKey(),

                food.getName(),

                food.getType(),

                item.getQuantity(),

                item.getUnit(),

                food.getKcal(),

                food.getProtein(),

                food.getCarb(),

                food.getFat(),

                food.getComponents(),

                food.getBenefit(),

                food.getImageUrl(),

                item.getExpiresAt(),

                item.getNote(),

                food.getCustomFood()
        );
    }


    private Double valueOrZero(
            Double value
    ) {

        return value == null
                ? 0.0
                : value;
    }
}