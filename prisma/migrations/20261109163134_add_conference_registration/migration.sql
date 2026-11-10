-- CreateTable
CREATE TABLE `ConferenceRegistration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regNumber` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `workplace` VARCHAR(191) NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `subSpecialty` VARCHAR(191) NOT NULL DEFAULT '',
    `invitedCategory` VARCHAR(191) NOT NULL DEFAULT '',
    `notes` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `adminNote` VARCHAR(191) NOT NULL DEFAULT '',
    `reviewedBy` VARCHAR(191) NOT NULL DEFAULT '',
    `reviewedAt` DATETIME(3) NULL,
    `emailSent` BOOLEAN NOT NULL DEFAULT false,
    `emailSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConferenceRegistration_regNumber_key`(`regNumber`),
    UNIQUE INDEX `ConferenceRegistration_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
