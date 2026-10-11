# TherMAX-IC 内容后台

官网：https://thermax-ic.github.io/

管理入口：https://thermax-ic.github.io/admin/

编辑后台：https://app.pagescms.org/thermax-ic/thermax-ic.github.io

使用说明：https://thermax-ic.github.io/admin/guide.html

## 首次连接

1. 仓库管理员使用 GitHub 登录 Pages CMS。
2. 在 thermax-ic 组织安装 Pages CMS GitHub App，仅选择 thermax-ic.github.io 仓库。
3. 选择 main 分支，后台自动读取 `.pages.yml`。
4. 在后台邀请导师邮箱；导师无需操作 Git，也无需 GitHub 账号。
5. 修改一小段文案并保存，核对 Actions 成功以及中英文官网更新。

导师通过后台编辑内容。保存直接提交 main，自动触发检查和 GitHub Pages 发布。研究方向、成员、论文、设备与新闻可用 published 开关隐藏；固定页面文案保存即发布。多人修改同一条内容前应先刷新，避免用旧表单覆盖新值。

## 研究方向维护

- “研究方向页面介绍”：编辑页面标题、引言、研究愿景与目录标题。
- “研究方向管理”：每个方向是一个独立条目，可新增、编辑、删除或隐藏。填写中英文标题、富文本介绍与研究要点；配图字段可以选择或上传图片，正文编辑器也支持插入图片。
- 修改“排列顺序”即可调整展示顺序，数字小的在前；目录、锚点链接、方向编号和搜索内容自动同步。新增方向的文件名自动生成，无需填写代码或拼音标识。
- 配图可留空；有图片时可编辑中英文图片说明，并选择“完整显示”或“填满区域”。未完成翻译时可以先填写中文，英文页面暂时显示已有文案，之后补充英文。
- 本次只把原有三个方向及配图迁入集合，没有新增或改写研究方向。

## 内容来源与本地开发

- `content/`：后台维护的唯一内容来源；`.pages.yml` 定义中文表单。
- `content/research/`：独立研究方向条目；`content/pages/research.json` 仅保存页面介绍。
- `templates/`：固定布局模板；文案绑定由构建工具替换，教师个人页使用原有布局。
- `dist/`：生成的官网文件，不提交 Git；GitHub Pages 只部署这个目录。
- 根目录原有 HTML、publication-data.js、equipment-data-v2.js 和 lang.js 保留为迁移前的快照；自动部署不读取这些旧内容文件。后续改内容使用后台或 content/，改布局使用 templates/。原有手工维护的 people/zhe-cheng.html 保留，发布版本由对应 CMS 内容生成。
- `images/`、`Fig/`、`pdfs/`：现有公开媒体。上传的文件仍保存在仓库中。
- `.github/workflows/pages.yml`：生成、校验、上传和发布；失败时不会替换已发布的网站。

```powershell
npm ci
npm run build
npm run check
npm start
```

打开 http://localhost:8000/。内容修改后重新 build。只有 dist/ 中的公开资源会部署，开发工具、原始来稿目录和内容后台配置不随网站部署。

## 发布与恢复

发布仓库是 `thermax-ic/thermax-ic.github.io`，不是另一个开发远程 `JerryJQ/lab-website`。GitHub Pages 的 Source 使用 GitHub Actions。后台保存产生的提交会运行 Publish website 工作流。

build-info.json 提供部署提交和公开条目数量，用于确认实际发布版本。普通撤销可在后台改回并保存；批量恢复由管理员恢复 content/ 对应文件的旧版本后提交。无需回退整个网站代码。

## 迁移与校验

原始资料迁移为 25 位成员、83 条论文、25 台设备、4 条新闻，以及公共信息和 9 个固定页面表单。tools/migrate-cms-content.mjs 是一次性迁移脚本，不能在日常维护时重新运行。tools/cms-migration-baseline.json 记录初始资料用于迁移完整性核对。

工作流检查合法字段、生成内容、个人页面同步、站内链接和资源。测试使用临时内容验证修改文案、新增成员、隐藏新闻、研究方向新增与排序、图片替换、隐藏方向及搜索同步，不会修改真实 CMS 数据。tools/migrate-research-collection.mjs 是本次研究方向的单次迁移脚本，运行后拒绝再次覆盖人工修改的内容。
