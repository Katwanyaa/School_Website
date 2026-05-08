CREATE TABLE `staff_departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `headName` VARCHAR(255) NULL,
    `assistantHeadName` VARCHAR(255) NULL,
    `staffCount` INTEGER NOT NULL DEFAULT 0,
    `image` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `extra` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `staff_departments_category_idx`(`category`),
    INDEX `staff_departments_isActive_idx`(`isActive`),
    INDEX `staff_departments_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `staff_department_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffDepartmentId` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `publicId` VARCHAR(255) NULL,
    `altText` VARCHAR(255) NULL,
    `caption` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `staff_department_images_staffDepartmentId_idx`(`staffDepartmentId`),
    INDEX `staff_department_images_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `staff_department_images`
    ADD CONSTRAINT `staff_department_images_staffDepartmentId_fkey`
    FOREIGN KEY (`staffDepartmentId`)
    REFERENCES `staff_departments`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
