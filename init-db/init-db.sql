-- 建立資料庫
CREATE DATABASE IF NOT EXISTS kuji_db;
USE kuji_db;

-- 1. 建立 kuji_orders 表 (欄位使用駝峰式)
CREATE TABLE IF NOT EXISTS `kuji_orders` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INT UNSIGNED NOT NULL,       -- 對應 Sequelize 的 userId
    `prizeName` VARCHAR(255) NOT NULL,    -- 對應 Sequelize 的 prizeName
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 建立 outboxes 表 (欄位使用駝峰式)
CREATE TABLE IF NOT EXISTS `outboxes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `topic` VARCHAR(255) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT '1', -- 預設為 EN_OUTBOX_STATUS.PENDING (字串 '1')
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- 3. 建立 index 在 outboxes 的 status 欄位上以提升查詢效能
CREATE INDEX outboxes_status_created_at ON outboxes (status, createdAt);
-- 4. 建立 index 在 kuji_orders 的 userId 欄位上以提升查詢效能
CREATE INDEX kuji_orders_user_id ON kuji_orders (userId);
-- 5. 建立 users 表 (欄位使用駝峰式)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenantId` INT UNSIGNED NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `type` TINYINT UNSIGNED NOT NULL,
  `secret` VARCHAR(255) NOT NULL,
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- 假設 ENUM_USER_STATUS.ENABLED 為 1
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `deletedAt` DATETIME DEFAULT NULL, -- 因為設定了 paranoid: true
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_tenant_id_username_unique` (`tenantId`, `username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
