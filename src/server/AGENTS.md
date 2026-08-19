# HTML Escaping: Context Rules

`escapeHtml()` / `Bun.escapeHTML()` only escape `& < > " '`. This is sufficient
for **some** HTML contexts and completely insufficient for others. Do not use
a plain HTML-character escaper as a general-purpose "make this safe" function.

## Safe contexts (escaping alone is enough)

- **Text nodes**: `<div>${escapeHtml(value)}</div>`
- **Quoted attributes**: `<div title="${escapeHtml(value)}">`

These are the only two cases where escaping `& < > " '` fully neutralizes the
input, because the only way to break out of these contexts is via one of
those characters.

## Unsafe contexts (escaping is not enough)

### Unquoted attributes

```html
<div title=${escapeHtml(value)}>
```

Attribute ends at the first whitespace, not a quote. None of the escaped
characters are needed to break out:

```
value = "x onmouseover=alert(1)"
→ <div title=x onmouseover=alert(1)>
```

**Rule: never emit unquoted attributes.** Always wrap in `"..."` and escape
into the quotes.

### URL-valued attributes (`href`, `src`, `action`, `formaction`, etc.)

```html
<a href="${escapeHtml(value)}">click</a>
```

The danger here isn't breaking out of the attribute — it's that the whole
value is interpreted as a URL, and none of `& < > " '` need to appear for
that to be dangerous:

```
value = "javascript:alert(document.cookie)"
→ <a href="javascript:alert(document.cookie)">click</a>
```

Every character is "safe" by HTML's rules. HTML-escaping has nothing to
escape here — the exploit lives in what the browser does with the value,
not in the HTML syntax around it.

**Rule: validate the scheme with an allowlist before emitting, don't just
escape.**

```typescript
function safeUrl(value: string): string {
  try {
    const url = new URL(value, 'https://example.com'); // base for relative URLs
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return '#';
  } catch {
    return '#';
  }
  return escapeHtml(value);
}
```

### `<script>` blocks / inline JS event handlers

HTML-escaping does not neutralize JS syntax at all. Never interpolate
user input into `<script>` bodies or `on*=` handlers via HTML-escaping.
Use `JSON.stringify()` for data passed into inline `<script>`, or avoid
inline handlers entirely (attach listeners in JS instead).

### CSS / `style` attribute, `<style>` blocks

Not covered by HTML escaping (`expression()`, `url()`, etc.). Avoid
interpolating user input into CSS. If unavoidable, use a dedicated CSS
value sanitizer, not the HTML escaper.

## Summary

HTML-escaping answers: *"can this value break out of the syntactic slot
it's in?"* It does not answer: *"is this value safe given what the slot
means?"* Text nodes and quoted attributes are purely syntactic slots —
escaping suffices. URLs, scripts, and CSS carry a second layer of
interpretation on top of HTML syntax — escaping alone is not sufficient
for these, regardless of which escaper (hand-rolled or `Bun.escapeHTML`)
is used.