# 研学AI助手 H5

智能研学旅行助手，支持微信内分享的 H5 应用。基于 Next.js 14 + MiniMax AI API 构建。

## 功能特性

- 💬 **AI 对话**：与研学顾问小智实时对话，获取专业研学建议
- 🗺️ **行程规划**：输入目的地、天数、年级和兴趣，AI 生成完整研学方案
- 📄 **报告生成**：填写基本信息，AI 生成结构化研学报告
- 📤 **微信分享**：支持微信 JSSDK 分享到好友和朋友圈
- 📱 **移动端优化**：适配 iOS Safari 和微信浏览器

## 技术栈

- **框架**：Next.js 14 (App Router)
- **AI**：MiniMax API (MiniMax-M2.7 模型)
- **样式**：纯 CSS (CSS Variables, Flexbox)
- **部署**：Vercel

## 项目结构

```
yanxue-h5/
├── app/
│   ├── page.tsx          # 主页面（对话、行程规划、报告生成）
│   ├── layout.tsx        # 根布局
│   ├── globals.css       # 全局样式
│   └── api/
│       └── chat/
│           └── route.ts  # 流式聊天 API
├── components/
│   ├── Header.tsx        # 顶部导航栏
│   ├── ChatBubble.tsx    # 聊天消息气泡
│   ├── ChatInput.tsx     # 聊天输入框
│   └── ShareModal.tsx    # 分享弹窗
├── lib/
│   └── minimax.ts       # MiniMax API 客户端
├── types/
│   └── jssdk.d.ts        # JSSDK 类型声明
└── public/
    └── icon.png          # 应用图标
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MINIMAX_API_KEY` | MiniMax API 密钥 | 内置测试密钥 |
| `MINIMAX_MODEL` | AI 模型名称 | MiniMax-M2.7 |

## 微信 JSSDK 配置

在微信环境中分享需要后端提供签名服务。生产环境需要：
1. 在 Vercel 环境变量中配置微信 AppID 和 AppSecret
2. 部署签名服务接口
3. 在 `ShareModal.tsx` 中调用签名接口获取 signature

## 部署到 Vercel

```bash
npm run build
# push 到 GitHub 后，Vercel 会自动部署
```

## 设计说明

- **设计基准**：375px (iPhone SE/8 宽度)
- **主色调**：#01C3A3 (青绿色)
- **次色调**：#0A2463 (深蓝色)
- **字体**：系统字体栈（-apple-system, PingFang SC, Microsoft YaHei）
- **圆角**：8px / 12px / 16px / 24px
- **阴影**：轻量级投影增强层次感

## 许可证

MIT
