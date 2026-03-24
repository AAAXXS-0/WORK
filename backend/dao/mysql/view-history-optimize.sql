-- 浏览历史表优化脚本
-- 执行此脚本以启用浏览记录的自动过期清理功能

-- 1. 启用MySQL事件调度器
SET GLOBAL event_scheduler = ON;

-- 2. 创建定时清理过期浏览记录的事件（30天过期）
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

-- 3. 查看事件是否创建成功
SELECT * FROM information_schema.EVENTS 
WHERE EVENT_NAME = 'clean_expired_view_history';

-- 4. 查看事件调度器状态
SHOW VARIABLES LIKE 'event_scheduler';
