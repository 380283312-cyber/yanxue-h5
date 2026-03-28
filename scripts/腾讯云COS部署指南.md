# 腾讯云 COS 部署指南

## 一、腾讯云控制台操作（备案通过后）

### 1. 创建 COS Bucket
1. 进入 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos5)
2. 点击「创建 Bucket」
   - **名称**: `yanxue-h5`
   - **地域**: 选择离用户近的（如上海 `ap-shanghai`）
   - **访问权限**: **公有读私有写**（必须）
   - 点击创建

### 2. 开启静态网站功能
1. 进入 Bucket → 「基础配置」→「静态网站」
2. 点击「编辑」
   - **状态**: 开启
   - **索引文档**: `index.html`
   - **错误文档**: `404.html`
3. 保存

### 3. 配置自定义域名（绑定 woaiyanxue.cn）
1. 进入 Bucket → 「域名与传输管理」→「自定义域名」
2. 添加域名：`www.woaiyanxue.cn`
3. **强制 HTTPS**: 开启（微信要求 HTTPS）
4. 自动配置 CDN：开启
5. 按提示添加 CNAME 记录到腾讯云提供的地址

### 4. 获取密钥
1. 进入 [腾讯云访问密钥](https://console.cloud.tencent.com/cam/capi)
2. 创建密钥（或使用已有密钥）
3. 保存 **SecretId** 和 **SecretKey**

---

## 二、部署步骤

### 第一次部署
```bash
# 1. 确认 COS SDK 已安装
pip3 install cos-python-sdk-v5 --break-system-packages

# 2. 设置环境变量（替换为你的真实密钥）
export COS_SECRET_ID=AKIDxxxxxxxxxxxxx
export COS_SECRET_KEY=xxxxxxxxxxxxx

# 3. 如果域名已备案并绑定了 COS，也设置一下
export COS_BUCKET=yanxue-h5
export COS_REGION=ap-shanghai

# 4. 运行部署脚本
cd ~/Desktop/yanxue-h5/scripts
chmod +x deploy-cos.sh
./deploy-cos.sh
```

### 后续更新（只需一行命令）
```bash
cd ~/Desktop/yanxue-h5 && npm run build && python3 scripts/deploy-cos.py
```

---

## 三、微信公众平台配置

### JS 安全域名（支付/分享等 JSSDK 功能必需）
1. 登录微信公众平台 → 设置 → 公众号设置 → 功能设置
2. 「JS接口安全域名」→ 添加：`www.woaiyanxue.cn`

### 网页授权域名（OAuth 登录必需）
1. 设置 → 公众号设置 → 功能设置
2. 「网页授权域名」→ 添加：`www.woaiyanxue.cn`

### 业务域名（打开外部链接权限）
同上，添加到「业务域名」列表

---

## 四、腾讯云 COS Bucket 权限配置（重要）

确保 Bucket 权限允许公开访问：
1. Bucket → 权限管理 → 访问权限
2. 选择「公有读私有写」
3. 保存

---

## 五、快速检查清单

| 项目 | 状态 |
|------|------|
| COS Bucket 创建完成 | ☐ |
| 静态网站功能开启 | ☐ |
| 自定义域名绑定完成 | ☐ |
| HTTPS 已开启 | ☐ |
| SecretId/SecretKey 已获取 | ☐ |
| JS 安全域名已添加 | ☐ |
| 网页授权域名已添加 | ☐ |
| 部署脚本测试通过 | ☐ |
