#!/usr/bin/env python3
"""
腾讯云 COS 部署脚本
用法: python3 deploy-cos.py

部署前请确保：
1. 项目已构建: cd ~/Desktop/yanxue-h5 && npm run build
2. 已配置环境变量或直接修改下方配置
"""

import os
import sys
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from qcloud_cos.cos_util import get_file_md5
import glob

# ── 配置 ──────────────────────────────────────────────────────────────────────
# 请填写你的腾讯云配置
REGION = "ap-shanghai"          # COS 区域：ap-shanghai（上海）, ap-beijing（北京）
BUCKET = "yanxue-h5"            # Bucket 名称（不带 -APPID 后缀）
SECRET_ID = os.environ.get("COS_SECRET_ID", "your-secret-id")
SECRET_KEY = os.environ.get("COS_SECRET_KEY", "your-secret-key")

# 部署目录（Next.js 静态导出目录）
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "out")

# CDN 加速域名（已在 COS 绑定的自定义域名）
CDN_DOMAIN = "https://www.woaiyanxue.cn"
# ─────────────────────────────────────────────────────────────────────────────

def get_local_files(dist_dir):
    """获取所有待上传文件"""
    files = []
    for root, dirs, filenames in os.walk(dist_dir):
        for filename in filenames:
            filepath = os.path.join(root, filename)
            key = os.path.relpath(filepath, dist_dir).replace("\\", "/")
            files.append((filepath, key))
    return files

def upload_file(client, bucket, local_path, cos_key):
    """上传单个文件"""
    with open(local_path, "rb") as f:
        client.put_object(
            Bucket=bucket,
            Body=f,
            Key=cos_key,
            StorageClass="STANDARD",
        )
    print(f"  ✅ {cos_key}")

def main():
    print(f"📦 部署目录: {DIST_DIR}")
    print(f"🪣 Bucket: {BUCKET}")
    print(f"🌏 区域: {REGION}")
    print()

    # 检查目录
    if not os.path.exists(DIST_DIR):
        print(f"❌ 错误：部署目录不存在: {DIST_DIR}")
        print(f"   请先运行: cd ~/Desktop/yanxue-h5 && npm run build")
        sys.exit(1)

    # 初始化 COS 客户端
    config = CosConfig(
        Region=REGION,
        SecretId=SECRET_ID,
        SecretKey=SECRET_KEY,
    )
    client = CosS3Client(config)

    # 获取文件列表
    files = get_local_files(DIST_DIR)
    print(f"📂 待上传文件: {len(files)} 个\n")

    # 上传
    print("🚀 开始上传...")
    for local_path, key in files:
        try:
            upload_file(client, BUCKET, local_path, key)
        except Exception as e:
            print(f"  ❌ {key}: {e}")

    print(f"\n✅ 部署完成！")
    print(f"🌐 访问地址: {CDN_DOMAIN}")
    print(f"\n📝 下一步：")
    print(f"   1. 确认 COS bucket 已开启静态网站功能（默认域名 or 自定义域名）")
    print(f"   2. 微信公众平台 → 设置 → 公众号设置 → JS安全域名 → 添加 {CDN_DOMAIN}")
    print(f"   3. 微信公众平台 → 设置 → 公众号设置 → 网页授权域名 → 添加 {CDN_DOMAIN}")

if __name__ == "__main__":
    main()
