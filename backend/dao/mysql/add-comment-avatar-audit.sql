-- 评论和头像审核功能数据库更新脚本
-- 执行此脚本以添加评论和头像审核功能

-- 1. 为comment表添加审核相关字段
ALTER TABLE `comment`
ADD COLUMN `ai_result` VARCHAR(50) DEFAULT '' COMMENT 'AI审核结果' AFTER `status`,
ADD COLUMN `audit_user_id` INT DEFAULT NULL COMMENT '审核人ID' AFTER `ai_result`,
ADD COLUMN `reject_reason` VARCHAR(255) DEFAULT '' COMMENT '驳回原因' AFTER `audit_user_id`,
ADD COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `create_time`,
ADD INDEX `idx_status` (`status`);

-- 2. 修改comment表的status字段，添加审核状态
ALTER TABLE `comment`
MODIFY COLUMN `status` TINYINT DEFAULT 1 COMMENT '状态：0-已删除，1-正常，2-AI审核中，3-待人工审核，4-已驳回';

-- 3. 为user表添加头像审核相关字段
ALTER TABLE `user`
ADD COLUMN `avatar_status` TINYINT DEFAULT 0 COMMENT '头像状态：0-未上传，1-审核中，2-已通过，3-已驳回' AFTER `avatar`,
ADD COLUMN `avatar_audit_user_id` INT DEFAULT NULL COMMENT '头像审核人ID' AFTER `avatar_status`,
ADD COLUMN `avatar_reject_reason` VARCHAR(255) DEFAULT '' COMMENT '头像驳回原因' AFTER `avatar_audit_user_id`,
ADD INDEX `idx_avatar_status` (`avatar_status`);

-- 4. 更新现有用户的头像状态
UPDATE `user` SET `avatar_status` = 2 WHERE `avatar` != '' AND `avatar` IS NOT NULL;

-- 5. 验证表结构修改
DESCRIBE `comment`;
DESCRIBE `user`;
