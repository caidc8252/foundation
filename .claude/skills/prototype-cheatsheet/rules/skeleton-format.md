# 规则：骨架蒸馏契约（skeleton-format）

> 本文件是骨架文件格式 + 蒸馏方法的**唯一主家**。`prototype-cheatsheet` skill 蒸馏时遵它;人手改 `skeletons/*.md` 时也遵它。**目的:任何人/任何一次蒸馏都产出一致的骨架**,refresh 才能稳定拼装。

## 一、骨架是什么、给谁用
一个骨架 = 一个 foundation 组件的**最小 markup 示范**(HTML 结构 + class,占位、无 CSS、无真数据),从该组件的源范例 `primitives|composites/<name>.html` 蒸馏而来。
- 它是 `refresh.mjs` 的输入,被**原样烘进**三档速查(`release/prototype-cheatsheet/cheatsheet-*.md`)。
- 下游写手**照抄这段 markup**、把占位换成真数据;样式由壳里的 foundation CSS 自动套。
- 一个组件一个文件:`prototype-cheatsheet/skeletons/<name>.md`。

## 二、文件格式（严格）
每个 `<name>.md` 恰好这三部分,顺序固定:

```
### <name> — <一句用途(英文, ≤ 一行)>
Modifiers/Slots: `.主类` `.关键修饰类` `.__子元素` …（只列常用/承重的,不抄全量）
​```html
<最小规范 markup, 5–15 行>
​```
```

- **恰好一个** ` ```html ` 代码块。
- 标题行必须 `### <name> — …`(name 与文件名、与 `component-registry.md` 一致)。
- Modifiers/Slots 行:点名该组件的关键 class(变体 `--x`、子元素 `__x`),让写手知道有哪些档位可选;不必穷举。

## 三、铁律
1. **只一个规范实例**:选组件最典型的一种用法,**不摆变体**(sm/lg/danger/各 tone 各状态不各写一遍——在 Modifiers 行点名即可)。
2. **markup 与源范例逐字一致**:标签嵌套层级、class 名**逐字对**源范例,不改写、不臆造。这是写手照抄的依据,错一个 class 下游就错。
3. **保留承重结构/class**:凡是"少了就散架/语义丢失"的都留——
   - 表格:`.table-frame`/`.table-scroll`/`.data-table` + 单元格类(`.cell-2line __main/__sub`、`.cell-num`、`.cell-right`、`.row-actions`、`.cell-chevron` 等);
   - composite 的 slot 结构(`.page-header__bar/__title/__actions`、`.stepper` 的步骤节点、`.kv-grid` 的 `<dl>/<dt>/<dd>` 等);
   - primitive 的必需嵌套(`.field > label + .input + .field__hint`、`.input-group > __addon + __control` 等)。
4. **内联 SVG 折叠**:图标一律折成 `<svg data-lucide="<图标名>">…</svg>`,不抄整段 path。
5. **占位用 `…`**:文字内容、URL、数值等用 `…`(或语义占位如 `Aurora Robotics`)——不填死真业务数据。
6. **不写 CSS**:骨架里没有 `<style>`、没有 CSS 规则。组件 CSS 在壳里,骨架只给结构。
7. **英文**:UI 文案占位用英文。

## 四、蒸馏配方（怎么从范例产出骨架）
1. 打开源范例 `primitives/<name>.html` 或 `composites/<name>.html`。
2. **挑一个规范实例**:范例通常把多种变体/状态都摆出来——选最能代表"这个组件平常怎么用"的那**一个**;忽略演示脚手架(切换器、多份对照、demo 包裹)。
3. **砍**:删掉其余变体、内联注释、demo 专用 wrapper;把长文/数值换成 `…`;把内联 SVG 折成 `<svg data-lucide="…">`。
4. **留**:承重的嵌套与 class(见铁律 3)一个不少。
5. **套格式**:配上 `### <name> — 用途` 标题 + Modifiers/Slots 行(从范例/`catalog.md` 该组件的 class 列里挑常用的)。
6. 覆写 `prototype-cheatsheet/skeletons/<name>.md`。

## 五、示例（对照标杆）

primitive 例（`button`）：
```
### button — a clickable action
Variant: `.btn--primary/--secondary/--ghost/--danger/--link` · Size: `.btn--xs/--sm/--md/--lg` · Icon-only: `.btn--icon*`(需 aria-label)
​```html
<button class="btn btn--primary" type="button"><svg data-lucide="plus">…</svg>…</button>
​```
```

composite 例（`kv-grid`，承重 `<dl>` 结构 + `.kv-mono`）：
```
### kv-grid — detail attributes as label → value pairs (a <dl>)
`.kv-grid __row`（`<dt>` + `<dd>`；`.kv-mono` on `<dd>` for IDs/amounts/dates）
​```html
<dl class="kv-grid">
  <div class="kv-grid__row"><dt>ID</dt><dd class="kv-mono">…</dd></div>
  <div class="kv-grid__row"><dt>Status</dt><dd>…</dd></div>
</dl>
​```
```

> 一致性锚:格式(§二)+ 铁律(§三)+ 配方(§四)一起保证——**同一组件、不同人/不同次蒸馏,产出应当等价**(挑同一个规范实例、留同一批承重 class)。若源范例本身大改,骨架随之重蒸馏(由 `check-staleness` 点名)。

## 适用角色
foundation 维护者(经 `prototype-cheatsheet` skill 蒸馏,或手改骨架时遵本契约)。
