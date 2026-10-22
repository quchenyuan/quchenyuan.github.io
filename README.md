# 笔记

<https://quchenyuan.github.io/>

一个极简静态博客：仓库里的 Markdown 和归档 HTML 就是内容，Astro 在 GitHub
Actions 里构建，GitHub Pages 托管。没有后台，没有数据库，没有自定义编辑器。

- 首页：文章列表 + 分类入口
- 分类：`/categories/<slug>/`，同时汇总 Markdown 和 HTML 文档
- 文章：`/posts/<slug>/`
- HTML 页面：`/html/<slug>/`
- RSS：`/rss.xml`
- 404：`/404.html`

Markdown 页面没有 JavaScript、评论、搜索、标签或门禁。HTML 页面是原样托管的
完整文档，导入前需要自己清理干净。

## 写作（全部在服务器上）

工作区是服务器上的 `/srv/blog-next`。文件、Node、`astro dev` 和 git 都在盒内；
**不要**在 Mac 上 clone 一份再推，旧站的 EDR 会杀 ssh git transport。

### 第一次

```bash
git clone git@github.com:quchenyuan/quchenyuan.github.io.git /srv/blog-next
cd /srv/blog-next
npm ci
```

用 VS Code 的 Remote-SSH 打开 `/srv/blog-next`。本地只跑编辑器 UI，文件、终端和
git 都在服务器上。

### 新文章

```bash
./scripts/new-post.sh my-slug "标题" "一句话摘要" notes
```

脚本会创建 `src/content/posts/my-slug.md` 和 `public/images/my-slug/`。
第 4 个参数是可选的分类 slug，必须已经在 `src/categories.ts` 里；省略就不进分类页。
slug 只能是小写 ASCII、用连字符分隔；中文放在 `title` 里。发布后不要改 slug，
旧地址没有重定向层。

### 预览

```bash
npm run dev          # 127.0.0.1:4400
```

VS Code Remote-SSH 会自动转发 4400；命令行兜底：

```bash
ssh -N -L 4400:127.0.0.1:4400 <server>
```

然后打开 <http://localhost:4400/>。这是真实的 Astro 开发服务器，正文、KaTeX、
代码和样式与线上走同一套管线。预览进程只在写作时开着，不要绑 `0.0.0.0`。

想看构建产物时：

```bash
npm run build
npm run preview      # 127.0.0.1:4401
```

### 发布

```bash
git status
git add src/content/posts/my-slug.md public/images/my-slug/
git commit -m "post: 标题"
git push
gh run watch
```

导入完整 HTML 页面时：

```bash
git add public/html/my-page/
git commit -m "html: 标题"
git push
```

push 后 GitHub Actions 会自动构建并部署，通常 1–2 分钟。部署失败时线上仍是上一个
版本，不会变成空白。

**不要用 `git add -A`。** 按文章和图片目录显式 stage；公开仓库里 commit 就是公开，
历史是永久的，fork 和缓存不会因为以后删除而消失。

## Frontmatter

```md
---
title: 标题
description: 一句话摘要
date: 2026-10-22
category: notes
---

正文
```

`description` 必填，首页和 RSS 都用它。`category` 可选，必须是
`src/categories.ts` 里的 slug。`updated` 可选：

```yaml
updated: 2026-10-23
```

- 日期按 UTC 展示，新建文章时脚本用 `Asia/Shanghai` 取当天日期，所以不会差一天。
- 没有 `draft` 字段。未提交的文件就是草稿；不要把草稿 commit 到公开仓库。
- 文件平铺在 `src/content/posts/`，文件名就是 URL 里的 slug。

## 分类

分类不是目录，而是一份维护的列表：`src/categories.ts`。

```ts
{
  slug: 'notes',
  title: '笔记',
  description: '日常记录与整理。',
}
```

- 数组顺序就是首页分类卡片的顺序；分类 `slug` 也是 URL 的一部分，发布后不要改。
- Markdown 在 frontmatter 写 `category: notes`；HTML 在 `meta.json` 写
  `"category": "notes"`。两种文档会合并出现在 `/categories/notes/`。
- 首页顶部展示全部分类（含「N 篇」计数），点进去是分类页，页内可返回全部分类或首页。
- 没写分类的 Markdown 仍会出现在首页文章列表；没写分类的 HTML 仍会出现在 `/html/`，
  只是不进分类页。
- 写错分类 slug 会让 `npm run build` 失败，不会静默丢内容。新增分类先改
  `src/categories.ts`，再给文档填 slug。
- 分类只有一层；不做标签、多级分类或按目录自动归类。

## 图片

放在 `public/images/<slug>/`，正文用根绝对路径：

```md
![说明](/images/my-slug/diagram.png)
```

站点在 `https://quchenyuan.github.io/` 根路径，所以不需要 base；不要改成子路径部署，
否则这些链接和字体路径都会失效。

## 已渲染的 HTML

完整的 HTML 文档不要放进 `src/content/posts/`。放到 `public/html/<slug>/`，构建时原样
复制，发布到 `/html/<slug>/`：

```text
public/html/my-page/
├─ index.html      # 完整文档，原样发布
├─ meta.json       # 可选：标题、摘要、日期
└─ ...             # 该页面自己的 CSS、图片等，用相对路径引用
```

`meta.json`：

```json
{
  "title": "标题",
  "description": "一句话摘要",
  "date": "2026-07-30",
  "category": "notes"
}
```

- 缺少 `meta.json` 时，列表标题取 `<title>`，摘要取 `<meta name="description">`，
  日期取 `<meta property="article:published_time">`；都没有也能发布，只是列表信息更少。
- `/html/` 的列表由构建时扫描目录生成。`_` 或 `.` 开头的目录不列出，可用来放
  `public/html/_shared/` 这类共享资源，页面里用 `/html/_shared/...` 引用。
- 页面内资源尽量用相对路径（`./base.css`），不要依赖旧站 `/_astro/` 下的哈希文件。
- HTML 页面不套新站模板，也不进 RSS；首页只列 Markdown 文章。HTML 通过 `/html/`
  和分类页进入。
- `meta.json.category` 可选，取值必须是 `src/categories.ts` 里的 slug。分类页会把
  HTML 和 Markdown 按日期混排，HTML 条目带一个小标记。
- **导入前必须清理**：admin/login、评论、统计、旧编辑器入口、门禁或私人链接，
  以及带旧域名/IP 的 canonical 和 OG 标签。仓库是公开的，页面里的脚本会真实执行。
- 只有正文片段、没有 `<html>` 的 HTML：直接粘进 `.md` 正文，Markdown 管线会原样输出，
  并套用站点排版；不必走 `public/html/`。
- GitHub Pages 有 1 GB 站点上限、单文件 100 MB 上限；大量归档要压缩图片，不要放视频。

## 数学与代码

- 行内公式 `$E = mc^2$`，块级公式用 `$$ ... $$`。
- 代码块正常写 fenced code，构建时由 Shiki 生成静态 HTML。
- 没有客户端 JS；KaTeX 的 CSS 和字体随文章页打包。

## 部署

`.github/workflows/pages.yml`：

1. push `main` 或手动 `workflow_dispatch`
2. `npm ci && npm run build`
3. 上传 `dist` 到 Pages artifact
4. `actions/deploy-pages` 发布

仓库 Settings → Pages → Source 必须是 **GitHub Actions**，不是 branch。

## 兜底

手机或没有 VS Code 时，直接在 GitHub 网页里编辑或新建 `.md`，commit 到 `main`，
Actions 会部署。公开仓库的 Rules 相同：不要提交私人内容或密钥。

## 旧站

`quchenyuan/blog` 和旧服务器上的 SSR 站保持原样，不迁移、不停机。新站验证通过后
再单独决定归档或下线。旧内容里的 gated 笔记、私人地址和密钥不要复制进这个公开仓库；
导入 HTML 前按上面的清理清单检查。

## 规则

- Node 26（`.nvmrc`）；依赖版本钉死，lockfile 入库，不随手升级。
- push 前跑一次 `npm run build`。
- 读者面不加客户端脚本；能用 CSS 做的不要用 JS。HTML 页面导入前清掉脚本。
- 字体自托管，不引 Google Fonts 或其他 CDN。
- 发布过的文章和分类 slug 视为永久地址。
