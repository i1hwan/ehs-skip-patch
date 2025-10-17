# ehs-gnu-skip-patch
> A tiny, copy‑&‑paste JavaScript snippet that unlocks forward/backward skip
> controls (and arrow‑key hotkeys) on the Zone HTML5 Player used by  
> **ehs.gnu.ac.kr** laboratory‑safety courses.

## Why?
GNU’s E‑Learning site forces you to watch every second of safety‑training
videos. This patch lets you jump in _n_‑second steps (default **300 s**) so you
can revisit only the parts you need.

> ⚠️ **Disclaimer**  
> Use at your own risk. Skipping mandated training may violate school
> policy or local regulations. This project is for study and personal
> convenience only.

---

## Quick start

1. Open the safety‑training video page.  
2. Press **F12** (DevTools) → **Console**.  
3. Paste the contents of [`skip-patch.js`](skip-patch.js) and hit **Enter**.  
   * ← / → arrow keys now jump 10 s.  
   * Skip buttons appear on the player UI.  
   * Call `applySkipPatch(30)` in the console if you want 30‑second jumps.

No extensions, no userscripts—just one‑time paste.

---

## Customisation

```js
// 5‑second intervals
applySkipPatch(5);

// Remove the patch completely
if (window.__zoneSkipPatch) window.__zoneSkipPatch.cleanup();
