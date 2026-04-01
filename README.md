# ehs-skip-patch
> Tiny, copy-&-paste JavaScript snippets that bypass video player restrictions
> on GNU's safety-training and e-learning sites.

## Why?
Sometimes you just want to revisit a specific part of a lecture you already
sat through, but the player won't let you skip ahead.
These patches simply unlock seek controls so you can jump to the section
you need.

> **Disclaimer**
> Use at your own risk. Skipping mandated training may violate school
> policy or local regulations. This project is for study and personal
> convenience only.

---

## `ehs-skip-patch.js`

Laboratory safety training. Zone HTML5 Player.

**F12 → Console → paste:**

```js
fetch('https://raw.githubusercontent.com/i1hwan/ehs-skip-patch/main/ehs-skip-patch.js').then(r=>r.text()).then(eval)
```

| Feature | Description |
|---------|-------------|
| Skip buttons | Forward / backward buttons on the player UI |
| Arrow keys | ← → skip in configurable intervals |
| Customisation | `applySkipPatch(30)` for 30-second jumps |
| Cleanup | `window.__zoneSkipPatch.cleanup()` to remove |

> **Side effect:** the patch unintentionally triggers an immediate completion
> on paste — so the course may be marked as finished before you even press
> play. Oops.

---

## `erum-skip-patch.js`

Video.js v7 + HLS.

**F12 → Console → paste:**

```js
fetch('https://raw.githubusercontent.com/i1hwan/ehs-skip-patch/main/erum-skip-patch.js').then(r=>r.text()).then(eval)
```

A notification appears in the top-right corner — you're done.
**Fast complete fires automatically**, so you can navigate away immediately.

| Feature | Description |
|---------|-------------|
| Free seek | Drag the seekbar freely, forward or backward |
| Arrow keys | ← → skip 5 s, Space to play/pause |
| Fast complete | Auto-reports full watch time on load — just leave the page |
| Speed unlock | 0.5x, 1x, 1.25x, 1.5x, 2x, 3x playback rates |
