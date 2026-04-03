/**
 * postbuild.js - Next.js 构建后处理
 * 修复静态导出时子路由（如 /biz）生成 biz.html 而非 biz/index.html 的问题
 */
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "out");

// 如果 out 目录不存在（说明没有用 static export），跳过
if (!fs.existsSync(outDir)) {
  console.log("📦 Post-build 完成：未使用静态导出，跳过子路由处理");
  return;
}

// 查找所有 .html 文件（但不是 index.html 本身）
const htmlFiles = fs.readdirSync(outDir).filter(
  (f) => f.endsWith(".html") && f !== "index.html" && f !== "404.html" && f !== "_not-found.html"
);

// 对于每个 xxx.html，在 out/xxx/ 下创建 index.html
htmlFiles.forEach((file) => {
  const route = file.replace(/\.html$/, "");
  const dir = path.join(outDir, route);

  // 如果对应的目录已存在（Next.js 生成的），在其下创建 index.html
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    fs.copyFileSync(path.join(outDir, file), path.join(dir, "index.html"));
    console.log(`✅ ${file} → ${route}/index.html`);
  }
});

console.log(`\n📦 Post-build 完成：处理了 ${htmlFiles.length} 个子路由文件`);
