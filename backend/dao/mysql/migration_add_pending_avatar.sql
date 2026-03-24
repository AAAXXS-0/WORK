-- 添加待审核头像字段迁移脚本
-- 执行时间：2026-03-23
-- 说明：为user表添加pending_avatar字段，用于存储待审核的头像URL

-- 1. 添加pending_avatar字段
ALTER TABLE `user`
ADD COLUMN `pending_avatar` VARCHAR(255) DEFAULT '' COMMENT '待审核的头像URL' AFTER `avatar`;

-- 2. 验证表结构修改
DESCRIBE `user`;
