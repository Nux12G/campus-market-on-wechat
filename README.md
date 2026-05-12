<p align="center">
  <img src="https://img.shields.io/badge/Platform-WeChat-07C160?logo=wechat&logoColor=white" alt="platform">
  <img src="https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs&logoColor=white" alt="backend">
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white" alt="orm">
  <img src="https://img.shields.io/badge/License-MIT-FFFFFF?color=white" alt="license">
</p>

<h1 align="center">🌊 海大集市本地端口版</h1>

<p align="center">
  <b>校园闲置物品交易平台小程序</b><br>
  连接校园 · 安全交易 · 让闲置流动起来
</p>

---

## 📖 项目简介

**海大集市2** 是一款面向高校的闲置物品信息交换小程序。  
我们致力于连接有闲置物品的学生与有购买需求的同学，让校内二手交易**更便捷、更安全**。

> 🎓 仅限校园生态内使用，打造可信、高效的二手交易微社区。

---

## ✨ 核心功能

| 模块 | 功能说明 |
| :---: | :--- |
| 🏠 **首页** | 热门商品推荐，快速浏览校园闲置好物 |
| 🔍 **集市大厅** | 全量商品搜索 + 关键词检索，精准查找 |
| 📦 **我的集市** | 个人闲置管理：上架、编辑、下架、查看 |
| 💬 **消息中心** | 接收购买申请、系统公告与违规处罚通知 |
| 👤 **个人设置** | 修改头像、昵称及联系方式等认证信息 |

---

## 🔄 交易流程

| 步骤 | 角色 | 操作 |
| :---: | :---: | :--- |
| 1️⃣ | 👨‍💻 **卖家** | 在「我的集市」发布闲置（价格、保质期、图片、简介） |
| 2️⃣ | 👩‍💻 **买家** | 在「集市大厅」搜索或浏览商品，点击「我想要」 |
| 3️⃣ | 👩‍💻 **买家** | 填写申请留言，发起联系方式互换申请 |
| 4️⃣ | 👨‍💻 **卖家** | 在「消息中心」查看申请，点击「同意」 |
| 5️⃣ | 🤖 **系统** | 自动向双方发送联系方式（微信/QQ/手机号） |
| 6️⃣ | 🤝 **双方** | 线下完成交易 |

---

## 👥 用户系统

| 功能 | 说明 |
| :--- | :--- |
| **登录方式** | 微信一键登录，自动分配唯一数字 ID |
| **昵称安全** | 脏话/敏感词自动屏蔽过滤 |
| **联系方式** | 可选微信 / QQ / 手机号（私密保护） |
| **访问权限** | 未注册用户仅可浏览，注册后方可发布与搜索 |


## 🛠️ 技术栈

| 分类 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端** | 微信小程序原生框架 | 无需额外编译，直接运行于微信环境 |
| **后端框架** | NestJS | 企业级 Node.js 框架，TS 支持友好 |
| **ORM** | Prisma | 类型安全的数据库工具，简化 SQL 操作 |
| **数据库** | MySQL | 关系型数据库，存储用户、商品、订单等数据 |
| **缓存（可选）** | Redis | 用于会话存储、接口限流、热点数据缓存 |
| **部署环境** | 云服务器 + 微信小程序云开发（可选） | 灵活部署，可根据需求选择云函数或独立后端 |

<br>

## 🚀 快速开始

### 1️⃣ 前置要求

确保本地已安装以下工具：

- [Node.js](https://nodejs.org/)（v16 或以上）
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [MySQL](https://www.mysql.com/downloads/)（本地或远程数据库）

### 2️⃣ 克隆项目

```bash
git clone https://github.com/Nux12G/miniprogram-beta.git
cd miniprogram-beta
```

### 3️⃣ 配置数据库

1. 创建 MySQL 数据库（例如 `campus_market`）
2. 修改后端项目中的 `.env` 文件：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/campus_market"
```

### 4️⃣ 启动后端服务

```bash
# 进入后端目录
cd campus-market-server

# 安装依赖
npm install

# 生成 Prisma 客户端
npm run prisma:generate

# 同步数据库表结构（可选，根据 prisma schema 自动建表）
npx prisma db push

# 启动开发服务（默认监听 3000 端口）
npm run dev
```

> ⚠️ 此终端窗口需保持运行，后端服务会持续监听 API 请求。

### 5️⃣ 启动前端小程序

1. 使用 **微信开发者工具** 打开项目根目录
2. **无需开启「云开发」模式**
3. 如需修改后端 API 地址，请编辑前端项目中的配置文件（如 `config.js` 或 `app.js`），将 `baseUrl` 改为 `http://localhost:3000` 或你的服务器 IP
4. 点击「编译」并预览小程序

### 6️⃣ 验证运行

- 后端健康检查：浏览器访问 `http://localhost:3000/health`（如有该接口）应返回正常状态
- 小程序端：尝试微信登录、浏览集市大厅，确认数据能正常加载

<br>

## 📁 项目结构（参考）

```
miniprogram-beta/
├── campus-market-server/     # 后端 NestJS 项目
│   ├── src/                  # 源代码
│   ├── prisma/               # Prisma schema 和数据迁移
│   └── .env                  # 环境变量（数据库连接等）
├── miniprogram/              # 小程序前端代码
│   ├── pages/                # 页面文件
│   ├── utils/                # 工具函数
│   └── app.js                # 小程序入口
└── README.md
```

<br>

## ❓ 常见问题

| 问题 | 解决方法 |
| :--- | :--- |
| 小程序无法登录 | 检查后端是否正常运行，确认 `baseUrl` 配置正确 |
| 数据库连接失败 | 检查 `.env` 中的 `DATABASE_URL` 是否正确，MySQL 服务是否启动 |
| Prisma 报错 | 重新执行 `npm run prisma:generate` 并确保数据库连接正常 |

<br>

> 💡 更多细节请查阅项目源码，或在 Issues 中提问。
