# 部署指南 - AI 水务机器人

本指南将帮助你将 AI 水务机器人部署到 Vercel。

## 前置要求

- ✅ GitHub 账号
- ✅ Vercel 账号
- ✅ Resend API Key

## 步骤一：获取 Resend API Key

1. 访问 https://resend.com/signup 注册账号
2. 登录后，访问 https://resend.com/api-keys
3. 点击 "Create API Key"
4. 输入 API Key 名称（如：AI Water Robot）
5. 复制生成的 API Key（格式：`re_xxxxxxxxxxxx`）

## 步骤二：准备 GitHub 仓库

### 2.1 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 输入仓库名称（如：`ai-water-robot`）
3. 选择 "Public" 或 "Private"
4. 点击 "Create repository"

### 2.2 推送代码到 GitHub

在项目根目录执行以下命令：

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: AI水务机器人初始版本"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

> **注意**: 将 `YOUR_USERNAME` 和 `YOUR_REPO` 替换为你的实际信息。

## 步骤三：部署到 Vercel

### 3.1 导入项目到 Vercel

1. 访问 https://vercel.com/new
2. 点击 "Import" 下的 "Continue with GitHub"
3. 授权 Vercel 访问你的 GitHub
4. 在仓库列表中找到 `ai-water-robot` 仓库
5. 点击 "Import"

### 3.2 配置项目

#### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `./` （默认）
- **Build Command**: `pnpm build`（自动填充）
- **Output Directory**: `.next`（自动填充）

#### Environment Variables（环境变量）

在 "Environment Variables" 部分添加以下变量：

| Name | Value | Environment |
|------|-------|-------------|
| `RESEND_API_KEY | `re_xxxxxxxxxxxx` | Production, Preview, Development |
| `CRON_SECRET` | `your-random-secret-here` | Production, Preview, Development |

> **生成 CRON_SECRET**:
> ```bash
> # macOS/Linux
> openssl rand -base64 32
> 
> # Windows (PowerShell)
> [Convert]::ToBase64String((1..32 | ForEach- {[byte](Get-Random -Maximum 256)}))
> ```

### 3.3 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，你会看到：
   - 🎉 "Congratulations!"
   - 一个可访问的 URL（如：`https://ai-water-robot.vercel.app`）

## 步骤四：配置 Gmail 邮件转发

### 4.1 登录 Gmail

访问 https://mail.google.com 并登录 `bluesterar@gmail.com`

### 4.2 设置转发

1. 点击右上角的齿轮图标 ⚙️
2. 选择 "查看所有设置" (See all settings)
3. 点击 "转发和 POP/IMAP" 标签
4. 在"转发"部分，点击"添加转发地址"
5. 输入目标邮箱：`bihui.jin@outlook.com`
6. 点击"下一步"，然后点击"继续"
7. Gmail 会发送一封验证邮件到 `bihui.jin@outlook.com`

### 4.3 确认转发

1. 登录 Outlook 邮箱：`bihui.jin@outlook.com`
2. 找到来自 Gmail 的验证邮件
3. 打开邮件，点击验证链接
4. 返回 Gmail 设置页面
5. 在转发选项中选择：
   - ✅ 转发传入邮件的副本到 `bihui.jin@outlook.com`
   - ✅ 保留 Gmail 副本
6. 滚动到底部，点击"保存更改"

## 步骤五：验证部署

### 5.1 访问部署的网站

打开浏览器，访问你的 Vercel URL（如：https://ai-water-robot.vercel.app）

### 5.2 测试搜索功能

1. 点击"手动搜索测试"按钮
2. 等待搜索完成（约 10-20 秒）
3. 查看是否显示搜索结果

### 5.3 测试完整流程

1. 点击"手动执行完整流程"按钮
2. 等待执行完成（约 20-30 秒）
3. 检查邮箱 `bluesterar@gmail.com` 是否收到邮件
4. 检查 `bihui.jin@outlook.com` 是否收到转发的邮件

### 5.4 查看 Vercel 日志

1. 访问 Vercel 控制台：https://vercel.com/dashboard
2. 进入 `ai-water-robot` 项目
3. 点击 "Logs" 标签
4. 选择对应的部署记录查看日志

## 步骤六：配置定时任务

定时任务已通过 `vercel.json` 自动配置，每天北京时间上午 10:00 自动执行。

### 查看定时任务状态

1. 访问 Vercel 项目页面
2. 点击 "Cron Jobs" 标签
3. 你会看到：
   - **Cron**: `0 2 * * *` (UTC时间02:00 = 北京时间10:00)
   - **Path**: `/api/cron/daily-water-news`
   - **Status**: Enabled

### 测试定时任务

在 Vercel 的 Cron Jobs 页面中，你可以：
- 查看执行历史
- 手动触发测试
- 查看执行日志

## 环境变量配置说明

### Resend API Key

- **用途**: 发送邮件
- **获取方式**: https://resend.com/api-keys
- **示例**: `re_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456`

### CRON_SECRET

- **用途**: 保护定时任务端点，防止未授权访问
- **生成方式**: 随机字符串，至少32位
- **示例**: `abc123xyz456...` (Base64编码)

## 故障排除

### 问题1: 部署失败

**原因**: 依赖安装失败或构建错误

**解决方案**:
```bash
# 检查本地是否能构建成功
pnpm build

# 查看详细错误日志
vercel logs --build
```

### 问题2: 邮件未发送

**原因**: Resend API Key 错误或未配置

**解决方案**:
1. 检查 Vercel 环境变量中 `RESEND_API_KEY` 是否正确
2. 访问 https://resend.com/dashboard 查看API使用情况
3. 查看 Vercel Logs 中的错误信息

### 问题3: 搜索功能失败

**原因**: Coze SDK 配置问题或网络问题

**解决方案**:
1. 查看 Vercel Logs 获取详细错误信息
2. 检查网络连接
3. 尝试重新部署

### 问题4: 定时任务未执行

**原因**: Vercel Cron Jobs 未启用或配置错误

**解决方案**:
1. 检查 `vercel.json` 文件是否存在
2. 在 Vercel 项目设置中确认 Cron Jobs 已启用
3. 查看 Cron Jobs 执行历史

### 问题5: 邮件未转发

**原因**: Gmail 转发设置未配置或验证失败

**解决方案**:
1. 检查 Gmail 转发设置是否正确
2. 确认 Outlook 邮箱已验证转发请求
3. 检查垃圾邮件文件夹

## 更新和维护

### 更新代码

```bash
# 修改代码后
git add .
git commit -m "feat: 更新描述"
git push
```

Vercel 会自动检测到推送并重新部署。

### 修改定时时间

编辑 `vercel.json` 文件：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-water-news",
      "schedule": "0 3 * * *"  // 修改为你需要的时间
    }
  ]
}
```

提交并推送，Vercel 会自动更新定时任务配置。

### 修改搜索关键词

编辑 `src/app/api/search-water-news/route.ts` 中的 `keywords` 数组。

## 下一步

部署完成后，你可以：

1. ✅ 等待每天北京时间 10:00 自动接收水务资讯邮件
2. ✅ 通过网页手动触发搜索和发送
3. ✅ 查看 Vercel Dashboard 监控运行状态
4. ✅ 根据需要调整搜索关键词和邮件内容

## 需要帮助？

- 📖 查看 [README.md](./README.md) 获取完整文档
- 🐛 提交 [GitHub Issue](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
- 💬 访问 [Vercel 文档](https://vercel.com/docs)
