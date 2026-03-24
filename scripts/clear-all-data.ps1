# ============================================================================
# 危险操作：清空数据库和上传的图片
# ============================================================================
# 警告：此脚本将删除所有数据库数据和上传的图片文件
# 执行前请确保已备份重要数据！
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Red
Write-Host "  警告：危险操作 - 清空数据库和上传的图片" -ForegroundColor Red
Write-Host "============================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "此脚本将执行以下操作：" -ForegroundColor Yellow
Write-Host "  1. 清空所有数据库表（删除所有数据）" -ForegroundColor Yellow
Write-Host "  2. 删除 uploads 目录下的所有图片文件" -ForegroundColor Yellow
Write-Host ""
Write-Host "警告：此操作不可逆！请确保已备份重要数据！" -ForegroundColor Red
Write-Host ""

# 第一次确认
$confirm1 = Read-Host "请输入 'YES' 确认执行此危险操作 (输入其他任何内容将取消): "
if ($confirm1 -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "第二次确认..." -ForegroundColor Yellow
Write-Host "您确定要清空所有数据库数据和上传的图片吗？" -ForegroundColor Red
Write-Host ""

# 第二次确认
$confirm2 = Read-Host "请再次输入 'YES' 确认执行此危险操作 (输入其他任何内容将取消): "
if ($confirm2 -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "最后一次确认..." -ForegroundColor Yellow
Write-Host "此操作将永久删除所有数据，无法恢复！" -ForegroundColor Red
Write-Host ""

# 第三次确认
$confirm3 = Read-Host "请最后输入 'YES' 确认执行此危险操作 (输入其他任何内容将取消): "
if ($confirm3 -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  开始执行清空操作..." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

# 获取项目根目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# 数据库配置（请根据实际情况修改）
$dbHost = "localhost"
$dbPort = 3306
$dbName = "campus_wall"
$dbUser = "root"
$dbPassword = Read-Host "请输入数据库密码: "

# 上传文件目录
$uploadsDir = Join-Path $projectRoot "uploads"

try {
    # 步骤1：清空数据库
    Write-Host "[1/3] 清空数据库..." -ForegroundColor Cyan
    
    # 数据库清空SQL语句
    $clearSql = @"
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `audit_log`;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `like`;
TRUNCATE TABLE `notification`;
TRUNCATE TABLE `post`;
TRUNCATE TABLE `view_history`;
TRUNCATE TABLE `student_roster`;
TRUNCATE TABLE `sensitive_word`;
TRUNCATE TABLE `system_config`;

-- 重置用户表（保留管理员账号）
UPDATE `user` SET 
    `avatar` = '',
    `pending_avatar` = '',
    `avatar_status` = 0,
    `avatar_audit_user_id` = NULL,
    `avatar_reject_reason` = ''
WHERE `role` = 0;

-- 重新初始化系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('ai_audit_level', 'medium', 'string', 'AI审核严格度：low-宽松，medium-中等，high-严格'),
('ai_check_image', 'true', 'boolean', '是否开启图片审核'),
('ai_timeout_to_manual', 'true', 'boolean', 'AI审核超时是否自动转人工'),
('ai_timeout', '3000', 'number', 'AI审核超时时间（毫秒）');

SET FOREIGN_KEY_CHECKS = 1;
"@

    # 执行SQL
    $mysqlCommand = "mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword $dbName"
    $clearSql | & $mysqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 数据库清空完成" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 数据库清空失败，退出码: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # 步骤2：删除上传的图片文件
    Write-Host "[2/3] 删除上传的图片文件..." -ForegroundColor Cyan
    
    if (Test-Path $uploadsDir) {
        # 删除uploads目录下的所有文件
        Get-ChildItem -Path $uploadsDir -Recurse -File | Remove-Item -Force
        
        Write-Host "  ✓ 图片文件删除完成" -ForegroundColor Green
    } else {
        Write-Host "  ! uploads 目录不存在，跳过" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # 步骤3：验证清理结果
    Write-Host "[3/3] 验证清理结果..." -ForegroundColor Cyan
    
    # 检查uploads目录
    $remainingFiles = Get-ChildItem -Path $uploadsDir -Recurse -File -ErrorAction SilentlyContinue
    if ($remainingFiles.Count -eq 0) {
        Write-Host "  ✓ uploads 目录已清空" -ForegroundColor Green
    } else {
        Write-Host "  ! uploads 目录仍有 $($remainingFiles.Count) 个文件" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "  清空操作完成！" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "提示：请重启后端服务以使更改生效" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "  错误：执行过程中发生异常" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
