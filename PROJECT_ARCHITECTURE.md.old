# 校园墙项目架构文档

## 一、项目概述

校园墙是一个面向高校学生的校园信息发布平台，支持用户发帖、评论、点赞等功能，并集成了AI内容审核和人工审核双重机制，确保内容安全合规。

### 技术栈

| 层级 | 技术选型 |
|-----|---------|
| 前端 | Vue 3 + Vite + Vue Router |
| 后端 | Node.js + Express.js |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis |
| 对象存储 | 阿里云 OSS |
| AI审核 | 百度AI / 腾讯云AI |

---

## 二、项目目录结构

```
WORK/
├── README.md                    # 项目说明文档
├── UpdateLog.md                  # 更新日志
├── PROJECT_ARCHITECTURE.md       # 项目架构文档（本文件）
├── backend/                      # 后端服务
│   ├── app.js                    # 应用入口文件
│   ├── package.json              # 依赖配置
│   ├── Dockerfile                # Docker部署配置
│   │
│   ├── api-gateway/              # API网关层
│   │   ├── middleware/           # 中间件
│   │   │   ├── auth.js           # 认证中间件
│   │   │   └── limit.js          # 限流中间件
│   │   └── routes/               # 路由定义
│   │       ├── auth.js           # 认证相关接口
│   │       ├── post.js           # 帖子相关接口
│   │       ├── admin.js          # 管理员接口
│   │       ├── comment.js        # 评论相关接口
│   │       └── upload.js         # 文件上传接口
│   │
│   ├── common/                   # 公共模块
│   │   ├── config.js             # 配置管理
│   │   ├── constants.js          # 常量定义
│   │   ├── errorCode.js          # 错误码定义
│   │   ├── exception.js          # 异常处理
│   │   ├── logger.js             # 日志工具
│   │   ├── auth.js               # 认证工具
│   │   └── security.js           # 安全工具
│   │
│   ├── dao/                      # 数据访问层
│   │   ├── mysql/                # MySQL数据库
│   │   │   ├── index.js          # 数据库连接
│   │   │   └── schema.sql        # 表结构定义
│   │   ├── oss/                  # 阿里云OSS
│   │   │   └── index.js          # OSS操作封装
│   │   └── redis/                # Redis缓存
│   │       └── index.js          # Redis操作封装
│   │
│   ├── model/                    # 数据模型层
│   │   ├── post.js               # 帖子模型
│   │   └── user.js               # 用户模型
│   │
│   ├── service/                  # 业务逻辑层
│   │   ├── audit-service/        # 审核服务
│   │   │   └── index.js          # 审核业务逻辑
│   │   ├── notify-service/       # 通知服务
│   │   │   └── index.js          # 通知业务逻辑
│   │   ├── post-service/         # 帖子服务
│   │   │   └── index.js          # 帖子业务逻辑
│   │   └── user-service/         # 用户服务
│   │       └── index.js          # 用户业务逻辑
│   │
│   ├── ai-audit/                 # AI审核模块
│   │   ├── client.js             # AI客户端封装
│   │   └── service.js            # AI审核服务
│   │
│   ├── mq/                       # 消息队列（预留）
│   │
│   └── logs/                     # 日志文件目录
│       ├── 2026-03-16.log
│       └── 2026-03-17.log
│
├── frontend/                     # 前端应用
│   ├── index.html                # 入口HTML
│   ├── package.json              # 依赖配置
│   ├── vite.config.js            # Vite配置
│   ├── .env.development          # 开发环境变量
│   ├── .env.production           # 生产环境变量
│   │
│   └── src/
│       ├── main.js               # 应用入口
│       ├── app.vue               # 根组件
│       │
│       ├── api/                  # API请求模块
│       │   ├── admin.js          # 管理员API
│       │   ├── audit.js          # 审核API
│       │   ├── auth.js           # 认证API
│       │   ├── comment.js        # 评论API
│       │   └── post.js           # 帖子API
│       │
│       ├── components/           # 公共组件
│       │   ├── AuditStatus.vue   # 审核状态组件
│       │   ├── CommentList.vue   # 评论列表组件
│       │   ├── PostCard.vue      # 帖子卡片组件
│       │   └── UploadImg.vue     # 图片上传组件
│       │
│       ├── layouts/              # 布局组件
│       │   ├── AdminLayout.vue   # 管理员布局
│       │   └── UserLayout.vue    # 用户布局
│       │
│       ├── router/               # 路由配置
│       │   ├── index.js          # 路由入口
│       │   ├── admin.js          # 管理员路由
│       │   └── user.js           # 用户路由
│       │
│       ├── store/                # 状态管理
│       │
│       ├── utils/                # 工具函数
│       │   ├── auth.js           # 认证工具
│       │   └── request.js        # 请求封装
│       │
│       └── views/                # 页面视图
│           ├── admin/             # 管理员页面
│           │   ├── Dashboard.vue      # 仪表盘
│           │   ├── AuditList.vue      # 待审核列表
│           │   ├── AuditLog.vue       # 审核日志
│           │   ├── UserManage.vue     # 用户管理
│           │   └── SystemConfig.vue    # 系统配置
│           └── user/              # 用户页面
│               ├── Home.vue          # 首页
│               ├── Login.vue         # 登录页
│               ├── Publish.vue       # 发帖页
│               ├── MyPosts.vue       # 我的帖子
│               └── PostDetail.vue     # 帖子详情
│
└── docs/                         # 文档目录
```

---

## 三、后端架构设计

### 3.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway Layer                     │
│         (路由、中间件、请求验证、响应格式化)                  │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                         │
│              (业务逻辑、事务管理、服务编排)                   │
├─────────────────────────────────────────────────────────┤
│                    Model Layer                           │
│              (数据模型、业务实体、数据校验)                   │
├─────────────────────────────────────────────────────────┤
│                    DAO Layer                             │
│         (数据库访问、缓存操作、外部服务调用)                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 核心模块说明

#### API网关层 (api-gateway/)

| 文件 | 作用 | 主要接口 |
|-----|------|---------|
| `routes/auth.js` | 认证路由 | 学生认证、登录、退出 |
| `routes/post.js` | 帖子路由 | 发帖、我的帖子、帖子详情 |
| `routes/admin.js` | 管理路由 | 待审核列表、人工审核、审核日志、用户管理 |
| `routes/comment.js` | 评论路由 | 添加评论、评论列表 |
| `routes/upload.js` | 上传路由 | 图片上传 |
| `middleware/auth.js` | 认证中间件 | Token验证、权限校验 |
| `middleware/limit.js` | 限流中间件 | 请求频率限制 |

#### 业务服务层 (service/)

| 服务 | 作用 | 核心方法 |
|-----|------|---------|
| `user-service` | 用户服务 | studentAuth(认证)、login(登录)、userManage(用户管理) |
| `post-service` | 帖子服务 | createPost(发帖)、getPostList(列表)、getPostDetail(详情) |
| `audit-service` | 审核服务 | aiAuditDispatch(AI审核调度)、manualAudit(人工审核) |
| `notify-service` | 通知服务 | 发送通知、通知列表、标记已读 |

#### 数据访问层 (dao/)

| 模块 | 作用 |
|-----|------|
| `mysql/` | MySQL数据库连接和操作封装 |
| `redis/` | Redis缓存操作封装（Token存储、限流计数） |
| `oss/` | 阿里云OSS文件上传封装 |

#### 公共模块 (common/)

| 文件 | 作用 |
|-----|------|
| `config.js` | 集中管理配置（服务器、数据库、Redis、OSS、AI） |
| `constants.js` | 状态常量定义（用户状态、帖子状态、审核类型等） |
| `errorCode.js` | 统一错误码定义 |
| `exception.js` | 异常类和全局异常处理中间件 |
| `logger.js` | 日志记录工具 |
| `auth.js` | JWT Token生成和验证 |
| `security.js` | 安全工具（密码加密、XSS过滤） |

---

## 四、数据库设计

### 4.1 数据库表结构

#### 用户表 (user)

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键，自增 |
| student_id | VARCHAR(20) | 学号，唯一索引 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(100) | 密码（加密存储） |
| status | TINYINT | 状态：0-封禁，1-正常 |
| role | TINYINT | 角色：0-普通用户，1-管理员 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

#### 帖子表 (post)

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID，外键 |
| content | TEXT | 帖子内容 |
| images | TEXT | 图片URL列表(JSON) |
| status | TINYINT | 状态：0-草稿，1-AI审核中，2-待人工审核，3-已发布，4-已驳回，5-已删除 |
| ai_result | VARCHAR(50) | AI审核结果 |
| audit_user_id | INT | 审核人ID |
| reject_reason | VARCHAR(255) | 驳回原因 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

#### 审核日志表 (audit_log)

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键，自增 |
| post_id | INT | 帖子ID，外键 |
| type | TINYINT | 审核类型：1-AI审核，2-人工审核 |
| result | TINYINT | 审核结果：1-通过，2-驳回，3-合规，4-违规，5-不确定 |
| operator_id | INT | 操作人ID（AI审核为0） |
| reason | VARCHAR(255) | 原因说明 |
| create_time | DATETIME | 创建时间 |

#### 评论表 (comment)

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键，自增 |
| post_id | INT | 帖子ID，外键 |
| user_id | INT | 用户ID，外键 |
| content | VARCHAR(500) | 评论内容 |
| parent_id | INT | 父评论ID（0为一级评论） |
| status | TINYINT | 状态：0-已删除，1-正常 |
| create_time | DATETIME | 创建时间 |

#### 点赞表 (like)

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键，自增 |
| post_id | INT | 帖子ID，外键 |
| user_id | INT | 用户ID，外键 |
| create_time | DATETIME | 创建时间 |

#### 通知表 (notification)

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 接收用户ID，外键 |
| type | TINYINT | 通知类型：1-系统通知，2-审核结果，3-评论通知，4-点赞通知 |
| title | VARCHAR(100) | 通知标题 |
| content | VARCHAR(500) | 通知内容 |
| related_id | INT | 关联ID |
| is_read | TINYINT | 是否已读：0-未读，1-已读 |
| create_time | DATETIME | 创建时间 |

### 4.2 状态码设计

#### 用户状态 (USER_STATUS)

| 值 | 常量 | 说明 |
|---|------|------|
| 0 | BANNED | 封禁 |
| 1 | ACTIVE | 正常 |

#### 帖子状态 (POST_STATUS)

| 值 | 常量 | 说明 |
|---|------|------|
| 0 | DRAFT | 草稿 |
| 1 | AI_AUDITING | AI审核中 |
| 2 | WAIT_AUDIT | 待人工审核 |
| 3 | PUBLISHED | 已发布 |
| 4 | REJECTED | 已驳回 |
| 5 | DELETED | 已删除 |

#### 审核类型 (AUDIT_TYPE)

| 值 | 常量 | 说明 |
|---|------|------|
| 1 | AI | AI审核 |
| 2 | MANUAL | 人工审核 |

#### 审核结果 (AUDIT_RESULT)

| 值 | 常量 | 说明 |
|---|------|------|
| 1 | PASS | 通过 |
| 2 | REJECT | 驳回 |
| 3 | COMPLIANT | 合规（AI审核） |
| 4 | VIOLATION | 违规（AI审核） |
| 5 | UNCERTAIN | 不确定（需人工复审） |

#### 评论状态 (COMMENT_STATUS)

| 值 | 常量 | 说明 |
|---|------|------|
| 0 | DELETED | 已删除 |
| 1 | NORMAL | 正常 |

#### 通知类型 (NOTIFY_TYPE)

| 值 | 常量 | 说明 |
|---|------|------|
| 1 | SYSTEM | 系统通知 |
| 2 | AUDIT | 审核结果 |
| 3 | COMMENT | 评论通知 |
| 4 | LIKE | 点赞通知 |

### 4.3 数据库索引设计

| 表名 | 索引名 | 字段 | 类型 |
|-----|-------|------|------|
| user | idx_student_id | student_id | 普通索引 |
| user | idx_status | status | 普通索引 |
| post | idx_user_id | user_id | 普通索引 |
| post | idx_status | status | 普通索引 |
| post | idx_create_time | create_time | 普通索引 |
| audit_log | idx_post_id | post_id | 普通索引 |
| audit_log | idx_type | type | 普通索引 |
| comment | idx_post_id | post_id | 普通索引 |
| comment | idx_user_id | user_id | 普通索引 |
| like | uk_post_user | post_id, user_id | 唯一索引 |
| notification | idx_user_id | user_id | 普通索引 |

---

## 五、错误码规范

### 5.1 错误码格式

```
格式: B[模块][类型][序号]
模块: 1-通用，2-用户，3-帖子，4-评论，5-上传，6-审核，7-系统
类型: 0-参数错误，1-认证错误，2-权限错误，3-业务错误，4-数据错误
```

### 5.2 错误码分类

| 模块 | 错误码范围 | 示例 |
|-----|----------|------|
| 通用错误 | 10001-19999 | PARAM_EMPTY(10001) |
| 用户模块 | 20001-29999 | USER_NOT_FOUND(20001) |
| 认证错误 | 21001-21999 | AUTH_TOKEN_INVALID(21002) |
| 帖子模块 | 30001-39999 | POST_NOT_FOUND(30001) |
| 评论模块 | 40001-49999 | COMMENT_NOT_FOUND(40001) |
| 上传模块 | 50001-59999 | UPLOAD_FILE_EMPTY(50001) |
| 审核模块 | 60001-69999 | AUDIT_ACTION_INVALID(60001) |
| 系统错误 | 70001-79999 | SYSTEM_ERROR(70001) |

### 5.3 异常处理机制

```javascript
// 异常类
BusinessException    // 通用业务异常
AuthException         // 认证异常（401）
PermissionException   // 权限异常（403）
ParamException        // 参数异常（400）

// 全局异常处理中间件
exceptionHandler      // 统一返回格式: { code, msg, data }

// 异步路由包装器
asyncHandler          // 自动捕获异步错误
```

---

## 六、API接口规范

### 6.1 接口格式

- 基础路径: `/api`
- 请求方式: RESTful风格
- 响应格式: JSON

```json
{
  "code": 0,        // 0表示成功，其他为错误码
  "msg": "操作成功",
  "data": {}        // 返回数据
}
```

### 6.2 接口列表

#### 认证模块 (/api/auth)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /verify | 学生认证 |
| POST | /login | 用户登录 |
| POST | /logout | 退出登录 |

#### 帖子模块 (/api/post)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /create | 发帖 |
| GET | /my | 我的帖子 |
| GET | /detail/:id | 帖子详情 |

#### 管理模块 (/api/admin)

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /audit/list | 待审核列表 |
| POST | /audit/handle | 人工审核 |
| GET | /audit/log | 审核日志 |
| GET | /user/list | 用户列表 |
| POST | /user/manage | 封禁/解封用户 |

#### 评论模块 (/api/comment)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /add | 添加评论 |
| GET | /list | 评论列表 |

#### 上传模块 (/api/upload)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /img | 图片上传 |

---

## 七、审核流程

### 7.1 审核流程图

```
用户发帖
    │
    ▼
┌─────────────┐
│  AI审核中   │ (status=1)
└─────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│           AI审核结果判断              │
├─────────────────────────────────────┤
│  合规 ──────────────────► 已发布 (status=3)
│  违规 ──────────────────► 已驳回 (status=4)
│  不确定 ────────────────► 待人工审核 (status=2)
└─────────────────────────────────────┘
    │
    ▼ (待人工审核)
┌─────────────┐
│  人工审核   │
└─────────────┘
    │
    ├─ 通过 ──► 已发布 (status=3)
    └─ 驳回 ──► 已驳回 (status=4)
```

### 7.2 审核日志记录

每次审核操作都会记录到 `audit_log` 表，包含：
- 帖子ID
- 审核类型（AI/人工）
- 审核结果
- 操作人ID
- 原因说明

---

## 八、安全机制

### 8.1 认证授权

- JWT Token认证
- Token存储在Redis中，支持主动失效
- 管理员权限校验中间件

### 8.2 安全措施

| 措施 | 说明 |
|-----|------|
| 密码加密 | bcrypt加密存储 |
| XSS过滤 | 使用xss库过滤用户输入 |
| 限流保护 | 基于Redis的请求频率限制 |
| CORS | 跨域请求控制 |

---

## 九、部署说明

### 9.1 环境要求

- Node.js >= 16.x
- MySQL >= 8.0
- Redis >= 6.x
- 阿里云OSS账号
- AI服务账号（百度/腾讯云）

### 9.2 配置文件

修改 `backend/common/config.js` 配置：

```javascript
{
  server: { port: 3000, host: 'localhost' },
  mysql: { host, port, user, password, database },
  redis: { host, port, password, db },
  oss: { accessKeyId, accessKeySecret, bucket, region },
  ai: { baidu, tencent, level, timeout }
}
```

### 9.3 启动命令

```bash
# 后端
cd backend
npm install
npm start

# 前端
cd frontend
npm install
npm run dev    # 开发环境
npm run build  # 生产构建
```

---

## 十、更新日志

详见 [UpdateLog.md](./UpdateLog.md)

---

*文档最后更新时间：2024年*