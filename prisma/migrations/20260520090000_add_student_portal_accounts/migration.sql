-- CreateTable
CREATE TABLE `student_portal_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `admissionNumber` VARCHAR(50) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(100) NULL,
    `middleName` VARCHAR(100) NULL,
    `lastName` VARCHAR(100) NULL,
    `fullName` VARCHAR(255) NULL,
    `form` VARCHAR(20) NULL,
    `stream` VARCHAR(50) NULL,
    `email` VARCHAR(100) NULL,
    `parentPhone` VARCHAR(20) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'active',
    `passwordSetAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_portal_accounts_admissionNumber_key`(`admissionNumber`),
    INDEX `student_portal_accounts_admissionNumber_idx`(`admissionNumber`),
    INDEX `student_portal_accounts_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_password_reset_requests` (
    `id` VARCHAR(191) NOT NULL,
    `admissionNumber` VARCHAR(50) NOT NULL,
    `requestType` VARCHAR(50) NOT NULL DEFAULT 'forgot',
    `fullName` VARCHAR(255) NULL,
    `email` VARCHAR(100) NULL,
    `parentEmail` VARCHAR(100) NULL,
    `parentPhone` VARCHAR(20) NULL,
    `message` TEXT NULL,
    `tokenHash` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `usedAt` DATETIME(3) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `adminNote` TEXT NULL,
    `requestedByIp` VARCHAR(100) NULL,
    `requestedByUserAgent` VARCHAR(255) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `student_password_reset_requests_admissionNumber_idx`(`admissionNumber`),
    INDEX `student_password_reset_requests_requestType_idx`(`requestType`),
    INDEX `student_password_reset_requests_status_idx`(`status`),
    INDEX `student_password_reset_requests_tokenHash_idx`(`tokenHash`),
    INDEX `student_password_reset_requests_expiresAt_idx`(`expiresAt`),
    INDEX `student_password_reset_requests_requestedAt_idx`(`requestedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
