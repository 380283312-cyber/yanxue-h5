#!/bin/bash
# =============================================================================
# 腾讯云 COS 部署脚本（静态网站）
# =============================================================================
# 使用前提：
#   1. Mac: brew install tccli    或    pip3 install cos-python-sdk-v5
#   2. 配置环境变量: export COS_SECRET_ID=你的SecretId
#                           export COS_SECRET_KEY=你的SecretKey
#   3. 腾讯云控制台创建 COS Bucket，开启"静态网站"
# =============================================================================

set -e

# ── 配置（修改这里）────────────────────────────────────────────────────────────
BUCKET_NAME="yanxue-h5"           # COS Bucket 名称（不含 appid 后缀）
REGION="ap-shanghai"               # 区域：ap-shanghai / ap-beijing / ap-guangzhou
DIST_DIR="$HOME/Desktop/yanxue-h5/out"   # Next.js 输出目录
CDN_URL="https://www.woaiyanxue.cn"     # 访问地址
# ──────────────────────────────────────────────────────────────────────────────

# 检查 python3 cos sdk
if ! python3 -c "import qcloud_cos" 2>/dev/null; then
    echo "❌ 缺少 COS SDK，正在安装..."
    pip3 install cos-python-sdk-v5 --break-system-packages
fi

echo "📦 开始部署到腾讯云 COS..."
echo "   Bucket: $BUCKET_NAME ($REGION)"
echo "   来源: $DIST_DIR"
echo ""

# 检查构建产物
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ 错误：构建目录不存在"
    echo "   请先运行：cd ~/Desktop/yanxue-h5 && npm run build"
    exit 1
fi

# 上传文件
echo "🚀 正在上传文件..."
upload_count=0
skip_count=0

# 使用 python 上传（更可靠）
python3 << 'PYEOF'
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
from qcloud_cos import CosConfig, CosS3Client

BUCKET = os.environ.get("COS_BUCKET", "yanxue-h5")
REGION = os.environ.get("COS_REGION", "ap-shanghai")
SECRET_ID = os.environ.get("COS_SECRET_ID", "")
SECRET_KEY = os.environ.get("COS_SECRET_KEY", "")
DIST = os.environ.get("COS_DIST", os.path.join(os.path.expanduser("~"), "Desktop/yanxue-h5/out"))

if not SECRET_ID or not SECRET_KEY:
    print("❌ 未设置 COS_SECRET_ID 或 COS_SECRET_KEY 环境变量")
    print("   请运行：")
    print("   export COS_SECRET_ID=你的SecretId")
    print("   export COS_SECRET_KEY=你的SecretKey")
    sys.exit(1)

config = CosConfig(Region=REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY)
client = CosS3Client(config)

for root, dirs, files in os.walk(DIST):
    for filename in files:
        local_path = os.path.join(root, filename)
        key = os.path.relpath(local_path, DIST).replace("\\", "/")
        try:
            with open(local_path, "rb") as f:
                client.put_object(Bucket=BUCKET, Body=f, Key=key, StorageClass="STANDARD")
            print(f"  ✅ {key}")
        except Exception as e:
            print(f"  ❌ {key}: {e}")

print("\n✅ 部署完成！")
print(f"🌐 访问地址: {os.environ.get('COS_URL', 'https://www.woaiyanxue.cn')}")
PYEOF

echo ""
echo "📝 后续操作："
echo "   1. 微信公众平台 → 设置 → 公众号设置 → JS安全域名 → 添加 $CDN_URL"
echo "   2. 微信公众平台 → 设置 → 公众号设置 → 网页授权域名 → 添加 $CDN_URL"
echo "   3. COS控制台 → 域名管理 → 开启 HTTPS（必须，微信要求）"
