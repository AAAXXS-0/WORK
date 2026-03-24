-- 为user表添加avatar字段的迁移脚本
-- 执行时间：2024-01-XX
-- 说明：为用户表添加头像字段，支持用户上传和显示头像

ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像URL' AFTER `password`;
