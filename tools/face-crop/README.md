# face-crop — people 照片人脸定位与显示位置工具

`Fig/people` 里的照片尺寸、构图各不相同。网站通过 CSS `background-size: cover` /
`object-fit: cover` 显示照片，只露出一个窗口，因此需要给每张照片指定显示位置
（`--image-position` / `object-position`），保证人脸/主体落在窗口最佳处。

## 数据流

- **`focal-points.json`** — 每张照片的焦点（人脸/主体中心），单位为图片宽高的百分比。
  这是唯一的手动数据源，值已逐张人工核对过（自动检测不可信，见下）。
- **`faces.json`** — 由 `detect-faces.js` 生成，记录每张图片的像素尺寸（百分比换算用）。
- **`apply-positions.js`** — 根据焦点 + 图片尺寸 + 容器宽高比，算出每个容器的位置并写回：
  - `people.html` 卡片：方形 1/1 容器 → `--image-position`
  - `people/*.html` 个人主页：5/7 竖版容器 → `<img>` 的内联 `object-position`
  - 公式：`p = (焦点 - 目标点 × 可见窗口) / (图片 - 可见窗口) × 100`，裁剪不足 2% 的轴取 50%
- **`render-previews.js`** — 按 CSS 语义模拟裁剪，输出 `preview-cards.jpg` /
  `preview-profiles.jpg` 拼图，用于人工验证效果。

## 新增/更换照片后怎么做

1. 把照片放进 `Fig/people/`（用中文姓名命名，如 `张三.jpg`）。
2. 往 `focal-points.json` 加一条焦点记录：打开照片，估计人脸中心在图中的百分比位置。
3. 运行：
   ```bash
   node tools/face-crop/detect-faces.js        # 更新 faces.json（图片尺寸）
   node tools/face-crop/apply-positions.js     # 重算并写回所有位置
   node tools/face-crop/render-previews.js     # 生成预览拼图检查效果
   ```
4. 在 `people.html` 对应卡片的 `--image` 里引用新照片（个人主页模板
   `tools/build_people_pages.py` 里也有 `image_position` / `image_position_full`
   字段，重新生成时保持一致）。

## 为什么 focal-points.json 是手填的

`detect-faces.js` 用的是 jsfeat 的 BBF 人脸检测（纯 JS、无原生依赖），但对卡通头像、
侧脸、大合照基本不可用：24 张照片里 7 张漏检、多张误检（边角假脸）。所有焦点值都是
逐张人工查看后写入的，检测脚本目前只用来获取图片尺寸。
