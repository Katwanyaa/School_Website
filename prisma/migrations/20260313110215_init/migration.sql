/*
  Warnings:

  - You are about to drop the column `kcpeIndex` on the `AdmissionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `kcpeMarks` on the `AdmissionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `kcpeYear` on the `AdmissionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `meanGrade` on the `AdmissionApplication` table. All the data in the column will be lost.
  - You are about to drop the `AdditionalDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AdditionalDocument` DROP FOREIGN KEY `AdditionalDocument_schoolDocumentId_fkey`;

-- DropIndex
DROP INDEX `AdmissionApplication_email_key` ON `AdmissionApplication`;

-- DropIndex
DROP INDEX `AdmissionApplication_kcpeMarks_idx` ON `AdmissionApplication`;

-- AlterTable
ALTER TABLE `AdmissionApplication` DROP COLUMN `kcpeIndex`,
    DROP COLUMN `kcpeMarks`,
    DROP COLUMN `kcpeYear`,
    DROP COLUMN `meanGrade`,
    ADD COLUMN `kjseaGrade` VARCHAR(191) NULL,
    ADD COLUMN `kpseaIndex` VARCHAR(191) NULL,
    ADD COLUMN `kpseaMarks` INTEGER NULL,
    ADD COLUMN `kpseaYear` INTEGER NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedByRole` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `News` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedByRole` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SchoolInfo` MODIFY `admissionOfficeHours` TEXT NULL;

-- DropTable
DROP TABLE `AdditionalDocument`;

-- CreateTable
CREATE TABLE `login_attempts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `deviceHash` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `attemptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_attempts_email_idx`(`email`),
    INDEX `login_attempts_attemptedAt_idx`(`attemptedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviceToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `deviceHash` VARCHAR(191) NOT NULL,
    `deviceName` VARCHAR(191) NULL,
    `lastUsed` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `isTrusted` BOOLEAN NOT NULL DEFAULT false,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `loginCount` INTEGER NOT NULL DEFAULT 1,
    `countsResetAt` DATETIME(3) NULL,
    `isCountsReset` BOOLEAN NOT NULL DEFAULT false,

    INDEX `DeviceToken_userId_idx`(`userId`),
    INDEX `DeviceToken_deviceHash_idx`(`deviceHash`),
    INDEX `DeviceToken_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `DeviceToken_userId_deviceHash_key`(`userId`, `deviceHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `recipients` VARCHAR(191) NOT NULL,
    `recipientType` VARCHAR(191) NULL DEFAULT 'all',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `sentAt` DATETIME(3) NULL,
    `sentCount` INTEGER NULL DEFAULT 0,
    `failedCount` INTEGER NULL DEFAULT 0,
    `lowCreditSaved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_logs` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `providerMessageId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `errorMessage` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AdmissionApplication_kpseaMarks_idx` ON `AdmissionApplication`(`kpseaMarks`);

-- AddForeignKey
ALTER TABLE `login_attempts` ADD CONSTRAINT `login_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviceToken` ADD CONSTRAINT `DeviceToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sms_logs` ADD CONSTRAINT `sms_logs_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `sms_campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
