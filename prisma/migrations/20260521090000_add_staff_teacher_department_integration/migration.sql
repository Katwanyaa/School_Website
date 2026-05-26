ALTER TABLE `Staff`
    ADD COLUMN `staffType` VARCHAR(50) NULL DEFAULT 'Leadership',
    ADD COLUMN `subjectOffered` VARCHAR(191) NULL,
    ADD COLUMN `staffDepartmentId` INTEGER NULL;

CREATE INDEX `Staff_staffDepartmentId_idx` ON `Staff`(`staffDepartmentId`);
CREATE INDEX `Staff_role_idx` ON `Staff`(`role`);
CREATE INDEX `Staff_status_idx` ON `Staff`(`status`);

ALTER TABLE `Staff`
    ADD CONSTRAINT `Staff_staffDepartmentId_fkey`
    FOREIGN KEY (`staffDepartmentId`)
    REFERENCES `staff_departments`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
