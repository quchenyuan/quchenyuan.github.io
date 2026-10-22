# 笔记

<https://quchenyuan.github.io/>

一个极简静态博客：仓库里的 Markdown 是唯一内容来源，Astro 在 GitHub
Actions 里构建，GitHub Pages 托管。没有后台，没有数据库，没有自定义编辑器。

- 首页：文章列表
- 文章：`/posts/<slug>/`
- RSS：`/rss.xml`
- 404：`/404.html`

读者面没有 JavaScript、评论、搜索、标签、分区或门禁。

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
./scripts/new-post.sh my-slug "标题" "一句话摘要"
```

脚本会创建 `src/content/posts/my-slug.md` 和 `public/images/my-slug/`。
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
---

正文
```

`description` 必填，首页和 RSS 都用它。`updated` 可选：

```yaml
updated: 2026-10-23
```

- 日期按 UTC 展示，新建文章时脚本用 `Asia/Shanghai` 取当天日期，所以不会差一天。
- 没有 `draft` 字段。未提交的文件就是草稿；不要把草稿 commit 到公开仓库。
- 文件平铺在 `src/content/posts/`，文件名就是 URL 里的 slug。

## 图片

放在 `public/images/<slug>/`，正文用根绝对路径：

```md
![说明](/images/my-slug/diagram.png)
```

站点在 `https://quchenyuan.github.io/` 根路径，所以不需要 base；不要改成子路径部署，
否则这些链接和字体路径都会失效。

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
再单独决定归档或下线。旧内容（尤其原来的 gated 笔记）不要复制进这个公开仓库。

## 规则

- Node 26（`.nvmrc`）；依赖版本钉死，lockfile 入库，不随手升级。
- push 前跑一次 `npm run build`。
- 读者面不加客户端脚本；能用 CSS 做的不要用 JS。
- 字体自托管，不引 Google Fonts 或其他 CDN。
- 发布过的 slug 视为永久地址。
