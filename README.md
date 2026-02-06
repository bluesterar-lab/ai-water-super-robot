# AI 水务机器人 🌊

每天自动搜索国内外关于水务的最新消息，并通过邮件发送到指定邮箱。

## 功能特性

- ✅ 自动搜索水务行业最新资讯（国内外）
- ✅ 搜索范围：全流程和自动投加、曝气系统、二次供水、分组节能、故障诊断、水务系统大模型
- ✅ 每天北京时间上午10:00自动执行
- ✅ 精美的HTML邮件格式
- ✅ 自动邮件转发功能
- ✅ 支持手动触发测试

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **UI组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS 4
- **搜索**: Coze Web Search SDK
- **邮件**: Resend
- **部署**: Vercel + GitHub

## 本地开发

### 1. 环境准备

确保你已经安装了：
- Node.js 18+ 
- pnpm 包管理器

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置：

```env
# Resend API Key（必填）
RESEND_API_KEY=your_resend_api_key_here

# Cron Secret（必填 - 用于保护定时任务）
CRON_SECRET=your_random_secret_here

# 本地开发基础URL
NEXT_PUBLIC_BASE_URL=http://localhost:5000
```

#### 获取 Resend API Key

1. 访问 [Resend](https://resend.com)
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到环境变量

#### 生成 Cron Secret

```bash
# macOS/Linux
openssl rand -base64 32

# 或者使用在线工具生成随机字符串
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:5000](http://localhost:5000)

### 5. 测试功能

在网页上你可以：
- 点击"手动搜索测试" - 测试搜索功能（不发送邮件）
- 点击"手动执行完整流程" - 搜索并发送邮件

## Vercel 部署

### 方式一：通过 Vercel 控制台部署

#### 1. 准备 GitHub 仓库

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化AI水务机器人"

# 推送到 GitHub
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 2. 部署到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New" -> "Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量（在 Environment Variables 部分）：

| 变量名 | 值 | 说明 |
|--------|------|------|
| `RESEND_API_KEY` | 你的Resend API Key | 用于发送邮件 |
| `CRON_SECRET` | 随机密钥 | 用于保护定时任务 |
| `NEXT_PUBLIC_BASE_URL` | 自动填充 | 部署后的URL |

5. 点击 "Deploy"
6. 等待部署完成（通常2-3分钟）

### 方式二：使用 Vercel CLI 部署

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod

# 按提示配置环境变量
```

### 验证部署

1. 访问部署后的 URL
2. 点击"手动执行完整流程"测试
3. 检查邮箱是否收到邮件

## 定时任务配置

定时任务通过 `vercel.json` 配置，每天北京时间上午10:00自动执行：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-water-news",
      "schedule": "0 2 * * *"
    }
  ]
}
```

- `path`: Cron 任务触发的 API 路径
- `schedule`: Cron 表达式（UTC时间02:00 = 北京时间10:00）

### Cron 表达式说明

```
┌───────────── 分钟 (0 - 59)
│ ┌─────────── 小时 (0 - 23)
│ │ ┌───────── 日期 (1 - 31)
│ │ │ ┌─────── 月份 (1 - 12)
│ │ │ │ ┌───── 星期 (0 - 7, 0和7都表示周日)
│ │ │ │ │
* * * * *
```

### 修改定时时间

如果需要修改执行时间，编辑 `vercel.json` 中的 `schedule` 字段：

**北京时间** → **UTC时间** 转换：

| 北京时间 | UTC时间 | Cron表达式 |
|---------|---------|-----------|
| 10:00 | 02:00 | `0 2 * * *` |
| 09:00 | 01:00 | `0 1 * * *` |
| 08:00 | 00:00 | `0 0 * * *` |
| 14:00 | 06:00 | `0 6 * * *` |

## 邮件转发配置

### 在 Gmail 中设置转发

1. 登录 [Gmail](https://mail.google.com)
2. 点击右上角设置图标（齿轮）
3. 选择 "查看所有设置"
4. 找到 "转发和 POP/IMAP" 标签
5. 点击 "添加转发地址"
6. 输入目标邮箱：`bihui.jin@outlook.com`
7. Gmail 会发送验证码到目标邮箱
8. 登录 Outlook 邮箱获取验证码并确认
9. 在 Gmail 中确认并保存设置

### 自动转发规则（可选）

如果只想转发特定主题的邮件，可以在 Gmail 中设置过滤器：

1. 在 Gmail 搜索框输入：`subject:水务每日资讯`
2. 点击右侧的 "创建筛选器"
3. 选择操作：
   - 标记为已读
   - 应用标签：水务资讯
   - 转发至：bihui.jin@outlook.com

## API 端点

### 搜索水务新闻

```bash
POST /api/search-water-news
Content-Type: application/json
```

返回示例：

```json
{
  "success": true,
  "count": 30,
  "results": [
    {
      "title": "智能曝气系统优化研究",
      "url": "https://...",
      "snippet": "...",
      "siteName": "Water Tech",
      "publishTime": "2024-01-15",
      "keyword": "曝气系统优化"
    }
  ]
}
```

### 发送邮件

```bash
POST /api/send-email
Content-Type: application/json

{
  "newsData": {
    "results": [...]
  }
}
```

### 定时任务端点

```bash
GET /api/cron/daily-water-news
Authorization: Bearer YOUR_CRON_SECRET
```

## 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── search-water-news/
│   │   │   │   └── route.ts          # 搜索水务新闻API
│   │   │   ├── send-email/
│   │   │   │   └── route.ts          # 发送邮件API
│   │   │   └── cron/
│   │   │       └── daily-water-news/
│   │   │           └── route.ts      # 定时任务API
│   │   ├── layout.tsx                # 根布局
│   │   └── page.tsx                  # 首页（管理界面）
│   └── components/
│       └── ui/                       # shadcn/ui 组件
├── .env.example                      # 环境变量示例
├── vercel.json                       # Vercel 配置
├── package.json
└── README.md
```

## 常见问题

### Q: 邮件没有收到？

A: 检查以下几点：
1. Resend API Key 是否正确配置
2. Vercel 环境变量是否正确设置
3. 垃圾邮件文件夹
4. 查看 Vercel 日志确认是否有错误

### Q: 定时任务没有执行？

A: 检查：
1. `vercel.json` 中的 cron 配置
2. Vercel 项目中是否启用了 Cron Jobs
3. 查看 Vercel Logs 中的 Cron Job 执行记录

### Q: 如何修改搜索关键词？

A: 编辑 `src/app/api/search-water-news/route.ts` 中的 `keywords` 数组：

```typescript
const keywords = [
  "你的关键词1",
  "你的关键词2",
  // ...
];
```

### Q: 如何修改发送邮箱？

A: 编辑 `src/app/api/send-email/route.ts` 中的 `to` 字段：

```typescript
to: ['your-email@example.com'],
```

### Q: 如何查看执行日志？

A: 访问 Vercel 控制台：
1. 进入你的项目
2. 点击 "Logs" 标签
3. 选择对应的 API 端点查看日志

## 开发工具

- **pnpm**: 包管理器
- **TypeScript**: 类型检查
- **ESLint**: 代码规范
- **Vercel**: 部署平台

## 许可证

MIT

## 支持

如有问题，请提交 Issue 或联系开发者。
