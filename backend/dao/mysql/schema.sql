-- 校园墙数据库表结构
-- 状态码说明：使用数字替代中文字符串，便于维护和扩展

-- 库创建
CREATE DATABASE IF NOT EXISTS `web_databases_wall`;
USE `web_databases_wall`;

-- 学生花名册表（用于学生注册验证）
CREATE TABLE IF NOT EXISTS `student_roster` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `student_id` VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
  `verify_code` VARCHAR(20) NOT NULL COMMENT '统一验证码',
  `is_registered` TINYINT DEFAULT 0 COMMENT '是否已注册：0-未注册，1-已注册',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_verify_code` (`verify_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生花名册表';

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `student_id` VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像URL',
  `pending_avatar` VARCHAR(255) DEFAULT '' COMMENT '待审核的头像URL',
  `avatar_status` TINYINT DEFAULT 0 COMMENT '头像状态：0-未上传，1-审核中，2-已通过，3-已驳回',
  `avatar_audit_user_id` INT DEFAULT NULL COMMENT '头像审核人ID',
  `avatar_reject_reason` VARCHAR(255) DEFAULT '' COMMENT '头像驳回原因',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-封禁，1-正常',
  `role` TINYINT DEFAULT 0 COMMENT '角色：0-普通用户，1-管理员',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_avatar_status` (`avatar_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 帖子表
CREATE TABLE IF NOT EXISTS `post` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `content` TEXT NOT NULL COMMENT '帖子内容',
  `images` TEXT COMMENT '图片URL列表(JSON)',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-草稿，1-AI审核中，2-待人工审核，3-已发布，4-已驳回，5-已删除',
  `ai_result` VARCHAR(50) DEFAULT '' COMMENT 'AI审核结果',
  `audit_user_id` INT DEFAULT NULL COMMENT '审核人ID',
  `reject_reason` VARCHAR(255) DEFAULT '' COMMENT '驳回原因',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_create_time` (`create_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';

-- 审核日志表
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `type` TINYINT NOT NULL COMMENT '审核类型：1-AI审核，2-人工审核',
  `result` TINYINT NOT NULL COMMENT '审核结果：1-通过，2-驳回，3-合规，4-违规，5-不确定',
  `operator_id` INT DEFAULT 0 COMMENT '操作人ID（AI审核为0）',
  `reason` VARCHAR(255) DEFAULT '' COMMENT '原因说明',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_create_time` (`create_time`),
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审核日志表';

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `parent_id` INT DEFAULT 0 COMMENT '父评论ID（0为一级评论）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-已删除，1-正常，2-AI审核中，3-待人工审核，4-已驳回',
  `ai_result` VARCHAR(50) DEFAULT '' COMMENT 'AI审核结果',
  `audit_user_id` INT DEFAULT NULL COMMENT '审核人ID',
  `reject_reason` VARCHAR(255) DEFAULT '' COMMENT '驳回原因',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 点赞表
CREATE TABLE IF NOT EXISTS `like` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- 通知表
CREATE TABLE IF NOT EXISTS `notification` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
  `user_id` INT NOT NULL COMMENT '接收用户ID',
  `type` TINYINT NOT NULL COMMENT '通知类型：1-系统通知，2-审核结果，3-评论通知，4-点赞通知',
  `title` VARCHAR(100) NOT NULL COMMENT '通知标题',
  `content` VARCHAR(500) DEFAULT '' COMMENT '通知内容',
  `related_id` INT DEFAULT 0 COMMENT '关联ID（帖子ID/评论ID等）',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 敏感词表
CREATE TABLE IF NOT EXISTS `sensitive_word` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '敏感词ID',
  `word` VARCHAR(50) NOT NULL UNIQUE COMMENT '敏感词内容',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_word` (`word`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='敏感词表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(20) DEFAULT 'string' COMMENT '配置类型：string-字符串，number-数字，boolean-布尔，json-JSON对象',
  `description` VARCHAR(200) DEFAULT '' COMMENT '配置说明',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 初始化系统配置数据
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('ai_audit_level', 'medium', 'string', 'AI审核严格度：low-宽松，medium-中等，high-严格'),
('ai_check_image', 'true', 'boolean', '是否开启图片审核'),
('ai_timeout_to_manual', 'true', 'boolean', 'AI审核超时是否自动转人工'),
('ai_timeout', '3000', 'number', 'AI审核超时时间（毫秒）');

-- 浏览历史表
CREATE TABLE IF NOT EXISTS `view_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '浏览记录ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `view_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_view_time` (`view_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';

-- 创建定时清理过期浏览记录的事件（30天过期）
DELIMITER //
CREATE EVENT IF NOT EXISTS `clean_expired_view_history`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
  DELETE FROM view_history 
  WHERE view_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
END//
DELIMITER ;

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;