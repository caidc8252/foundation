# 图形化修改与视觉审查

> **定位**: 图形化入口的现行分工。`pnpm admin` 用于隔离组件实验室；完整页面上下文的视觉审查
> 已迁至独立仓库 [`foundation-maintain`](https://github.com/Newland-Payment-Technology-US-Co-Ltd/foundation-maintain)
> （静态站点，`pnpm serve`），审查可见对象的全局组件样式。

---

## `pnpm admin`: isolated component lab

`pnpm admin` 启动的是隔离组件实验室。它面向维护者，用来逐项查看 catalog 中的 token、
primitive、composite，检查它们解析到的 token，并在独立预览里形成视觉草稿。

Admin 的编辑不直接写入受管 source。草稿只用于确认设计事实，真实落地仍按维护流程修改
`tokens/*.css`、`primitives/primitives.css`、`composites/composites.css` 和对应契约，然后运行
`pnpm build` 与 `pnpm check:all`。

## foundation-maintain: full-page visual review

完整页面 prototype 现在住在 `foundation-maintain` 仓库（`pnpm serve` 打开静态站点）。它不是让审核人员先认识
`composite data-table` 这类内部名字，而是让审核人员直接点击页面上看得到的对象：表格、按钮、
页头、卡片、筛选区、分页等。

进入 **视觉审查** 后：

1. 点击页面中的可见对象。
2. 面板显示这个对象的可编辑声明。
3. 每一次声明修改都是全局组件样式修改，不提供局部影响范围选择。
4. 当前页面所有匹配 selector 的真实实例同步变化。
5. 草稿保存在 `tomsreview:*` localStorage 命名空间，页面跳转后继续生效。

面板必须明确展示：

- 这是一个全局组件样式修改。
- 会写入的候选源文件：`composites/composites.css` 或 `primitives/primitives.css`。
- 会影响所有使用该可见对象的地方。

## 保存与提升

在 foundation-maintain 里保存会**下载一个 `manifest.json`**，记录本次审查对象
`reviewSubject`，以及 `tokenOverrides`、`classOverrides`、`classOverrideMeta`。

这些 override 是即将进入源 CSS 的 governed candidate，不是局部页面补丁。把下载的 manifest 放进
foundation 的 `versions/vN/manifest.json`，再走维护流程（详见
[`governance/release-workflow.md`](../../governance/release-workflow.md)）：
`pnpm apply-draft vN` 重建草稿 → `pnpm promote vN` 生成 handoff，将同一设计事实提升到
`tokens/`、`primitives/`、`composites/` 和必要契约 → `pnpm finalize vN` → `pnpm release vN`，
其间运行 `pnpm build` 与 `pnpm check:all`。
