-- CreateTable
CREATE TABLE `bronchoscopy_registrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullNameAr` VARCHAR(191) NOT NULL,
    `fullNameEn` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `workplace` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
