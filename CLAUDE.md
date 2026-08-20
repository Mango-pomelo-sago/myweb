# 项目开发规范（Claude Code 指南）

Vue 3 + Vite 个人作品集。修改页面布局时先读本文件，遵守以下约定。

## 布局骨架

- 顶部固定导航栏 [TopNav.vue](src/components/TopNav.vue)：`position: fixed; top: 0; height: 88px; z-index: 100`。
- 内容区 [MainLayout.vue](src/layouts/MainLayout.vue)：`padding: 100px 80px 60px`，顶部 100px 为导航栏留位。
- 不要再做侧边栏/侧滑导航。导航必须是顶部通栏。

## 页面垂直居中（重要：防止被导航栏遮挡）

用 `margin: auto` 方案实现整页垂直居中，**不要**用 `justify-content: center` + `overflow: hidden`。

理由：`justify-content: center` 且内容溢出时，顶部内容会超出容器上边缘、被 `overflow: hidden` 裁掉，或被 `position: fixed` 的导航栏遮挡（例如"联系我"+英文 "Contact" 标题曾因此消失）。

正确写法（参考 [ContactView.vue](src/views/ContactView.vue)）：

```css
.page-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);  /* 一屏高，减去内容区上下 padding */
  width: 100%;
  overflow-y: auto;             /* 矮屏时滚动而非裁切 */
}

/* 标题区：固定在最顶部，不会被导航栏遮挡 */
.title-area {
  flex-shrink: 0;
  margin-top: auto;             /* 与其下区块的 margin-bottom: auto 均分留白 → 垂直居中 */
}

/* 内容区：不压缩，溢出时顶部排布 */
.main-content {
  flex-shrink: 0;
  margin-bottom: auto;
}
```

效果：

- 内容不溢出：上下 `margin: auto` 均分留白 → 整块垂直居中。
- 内容溢出（矮屏/小窗）：auto 外边距归零，内容从顶部排布，配合 `overflow-y: auto` 可滚动，标题永远在导航栏下方可见。

禁止事项：

- ❌ 在同一容器上用 `justify-content: center` + `overflow: hidden` 强制一屏。
- ❌ 给标题区加 `position: fixed` 或负 margin 去躲导航栏 —— 用上面的弹性方案。

## 其他页面约定

- 作品集图片必须先压缩优化（webp/缩放）：`npm run optimize:images`。
- 作品集相册是 grid 瀑布流，`WIDE_NAMES` 数组控制跨两列的宽图。
- 新媒体运营页有 5 分区 + 左侧目录导航。
- 菜单样式：Codrops MenuHoverEffects #6（Dustu）—— 上中文粗体 + 下英文小字，hover/active 绿色衬底左滑 + 黄色横线中位。