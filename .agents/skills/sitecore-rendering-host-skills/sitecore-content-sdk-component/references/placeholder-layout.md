# Placeholder layout (grid / flex with child components)

When a section uses `<Placeholder>` for repeating cards, slides, or columns, **layout CSS must be applied to a wrapper around placeholder children** — not assumed from Bootstrap column classes on each child alone.

---

## Why placeholders break grid layouts

1. **`<Placeholder>` renders sibling components**, not a single DOM node. Each child is a separate React root (often wrapped in `ErrorBoundary`; in Pages editing mode also `PlaceholderMetadata` chrome).
2. **Column classes on children (`col-md-6`) do not work** unless the current host stylesheet defines them.
3. **A shared `.row` class may mean something else** in the project — do not reuse it for teaser grids without scoped grid rules.
4. **Static HTML** (`<div class="row"><div class="col-md-6">…`) is not the same DOM as `<div><Placeholder /></div>` — the grid container must explicitly wrap placeholder output.

---

## Required pattern — `render` prop wraps children

Put **grid/flex on the element that directly contains placeholder children** using the Content SDK `render` callback:

```tsx
<Placeholder
  name={`teaser-cards-${params.DynamicPlaceholderId}`}
  rendering={rendering}
  render={(components) => (
    <div className="teaser-grid__row">{components}</div>
  )}
/>
```

**Do not** rely on this alone:

```tsx
{/* ❌ Grid on parent; children may not participate as grid items as expected */}
<div className="row">
  <Placeholder name={ph} rendering={rendering} />
</div>
```

**Also wrong** — wrapping each child in `col-md-6` inside `render` while the grid container stays **outside** the placeholder:

```tsx
{/* ❌ Placeholder children are SDK roots (ErrorBoundary / editing chrome); col-* on a sibling .row does not lay them out */}
<div className="row">
  <Placeholder
    name={ph}
    rendering={rendering}
    render={(components) =>
      components.map((c, i) => <div key={i} className="col-md-6">{c}</div>)
    }
  />
</div>
```

The **grid/flex host must wrap placeholder output** using **`renderEach`** (one cell wrapper per child) inside a layout container — not `render` with `components.map`, which breaks in Pages editing mode because the SDK passes a single `PlaceholderMetadata` wrapper around all children:

```tsx
<div className="teaser-grid__montage-grid">
  <Placeholder
    name={`teaser-cards-${params.DynamicPlaceholderId}`}
    rendering={rendering}
    renderEach={(component, index) => (
      <div key={`teaser-card-${index}`} className="teaser-grid__montage-cell montage__data">
        {component}
      </div>
    )}
  />
</div>
```

Hide editing metadata nodes that sit among flex/grid children: `.teaser-grid__montage-grid > code.scpm { display: none; }`

Reference: `TitleDescriptionTeaserGridSection` + `VerticalTeaserCard` (`teaser-cards-{*}`).

Child card components should expose a **stable BEM class** (e.g. `vertical-teaser-card`) for item-level styling; **width/columns come from the parent grid**, not `col-*` on the child.

---

## CSS — grid on the placeholder host

Define layout on the wrapper class passed to `render`:

```css
.teaser-grid__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 24px;
}

.teaser-grid__row > .vertical-teaser-card {
  min-width: 0;
}

@media (max-width: 850px) {
  .teaser-grid__row {
    grid-template-columns: 1fr;
  }
}
```

Use **CSS Grid or flex** scoped to the section (`.teaser-grid__*`, `.feature-grid__*`) — port column counts from desktop/tablet/mobile PNGs.

---

## Carousel / horizontal scroll placeholders

Same rule: scroll track is the `render` wrapper:

```tsx
render={(components) => (
  <ul className="carousel-grid">{components}</ul>
)}
```

Child cards may render `<li>` or `<div>` items depending on the screenshot — match current `section.html` + screenshot, not another host.

---

## React keys — `renderEach` and sibling placeholders

See [tsx-pattern.md — React keys](tsx-pattern.md#react-key-on-root-element-required) for full rules. Summary:

| Pattern | Who sets `key` |
|---------|----------------|
| Default `<Placeholder />` (no `renderEach`) | Content SDK — `rendering.uid` |
| `<Placeholder render={(components) => …} />` | SDK on each child; wrapper needs no key |
| `<Placeholder renderEach={…} />` | **You** — on the wrapper element in `renderEach` |
| **Two+ sibling `<Placeholder>`** under same parent | **You** — prefix keys per placeholder (`panel-0`, `stats-0`) |

**Why:** each `<Placeholder>` returns an array. React flattens sibling arrays into one list. Bare `key={index}` in each placeholder's `renderEach` produces duplicate `0`, `1`, … → browser warning *"Each child in a list should have a unique key prop"*.

```tsx
{/* Composite row — two sibling placeholders under one parent */}
<div className="row">
  <Placeholder
    name={panelsPh}
    rendering={rendering}
    renderEach={(component, index) => (
      <div key={`panel-${index}`} className="grid__col">{component}</div>
    )}
  />
  <Placeholder
    name={statsPh}
    rendering={rendering}
    renderEach={(component, index) => (
      <div key={`stats-${index}`} className="grid__col">{component}</div>
    )}
  />
</div>
```

Single-placeholder carousels (`hero-slides-{*}` only) may use `key={\`slide-${index}\`}` — no cross-placeholder collision.

---

## Checklist (sections with `<Placeholder>`)

```
- [ ] Grid/flex wrapper uses Placeholder `render={(components) => …}` (or equivalent host that directly wraps children)
- [ ] Layout CSS on wrapper class — not only col-* on children
- [ ] Child root has stable section-specific class for item styling
- [ ] Desktop PNG: column count matches grid-template-columns / flex-basis
- [ ] Tablet/mobile PNGs: grid collapses or scrolls per capture
- [ ] Did not assume Bootstrap .row/.col-* exist in host CSS
- [ ] Parent rendering Placeholders field + placeholder-settings YAML exist (see placeholder-settings.md)
- [ ] Multiple sibling `<Placeholder>` under same parent → `renderEach` keys use distinct prefixes (see [React keys](tsx-pattern.md#react-key-on-root-element-required))
```

---

## Related

- [placeholder-settings.md](../../sitecore-content-sdk-component/references/placeholder-settings.md) — YAML + Placeholders field on parent rendering
- [teaser-grid-archetypes.md](../../sitecore-component-from-design/references/teaser-grid-archetypes.md) — generic section/card archetype mapping
- [component-types.md](../../sitecore-content-sdk-component/references/component-types.md) — Section + Card placeholder pattern
