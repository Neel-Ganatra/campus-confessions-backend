-- CreateTable
CREATE TABLE `confessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `college` VARCHAR(191) NULL,
    `isFlagged` BOOLEAN NOT NULL DEFAULT false,
    `fire` INTEGER NOT NULL DEFAULT 0,
    `heart` INTEGER NOT NULL DEFAULT 0,
    `skull` INTEGER NOT NULL DEFAULT 0,
    `cry` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `confessionId` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `reportedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_confessionId_fkey` FOREIGN KEY (`confessionId`) REFERENCES `confessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
