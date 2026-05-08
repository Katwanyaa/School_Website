CREATE TABLE IF NOT EXISTS `school_hub_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `shortDescription` TEXT NULL,
    `description` TEXT NULL,
    `image` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `established` VARCHAR(100) NULL,
    `website` TEXT NULL,
    `socialMedia` JSON NULL,
    `contactName` VARCHAR(255) NULL,
    `contactPhone` VARCHAR(50) NULL,
    `contactEmail` VARCHAR(255) NULL,
    `details` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `school_hub_items_type_idx`(`type`),
    INDEX `school_hub_items_isActive_idx`(`isActive`),
    INDEX `school_hub_items_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `school_hub_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schoolHubItemId` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `publicId` VARCHAR(255) NULL,
    `altText` VARCHAR(255) NULL,
    `caption` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `school_hub_images_schoolHubItemId_idx`(`schoolHubItemId`),
    INDEX `school_hub_images_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`),
    CONSTRAINT `school_hub_images_schoolHubItemId_fkey`
        FOREIGN KEY (`schoolHubItemId`)
        REFERENCES `school_hub_items`(`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
