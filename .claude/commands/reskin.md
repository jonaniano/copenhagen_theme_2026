# Theme Reskin Skill

Reskin a Zendesk Copenhagen Help Center theme to seamlessly match a target website's visual identity.

## Usage

```
/reskin <command> [options]
```

## Commands

- `analyze <url>` - Analyze target website and extract design system
- `apply` - Apply the full reskin based on analysis
- `header` - Generate header template and styles only
- `footer` - Generate footer template and styles only
- `tokens` - Generate design tokens only
- `validate` - Validate templates and run build

---

## Prerequisites

### Zendesk CLI (zcli)

The theme preview requires the Zendesk CLI tool (`zcli`).

**Installation:**
```bash
npm install -g @zendesk/zcli
```

**Authentication (required once):**
```bash
zcli login -i
```

**Preview theme:**
```bash
zcli themes:preview
```

### Resetting to Clean Copenhagen 2026 Base

```bash
# Backup skill, reset theme, restore skill
cp -r .claude /tmp/claude-skill-backup
git checkout copenhagen2026/master -- .
cp -r /tmp/claude-skill-backup/* .claude/
yarn install && yarn build
```

---

## Core Principle: Always Extract Fresh

**NEVER use cached or assumed values.** Every target site is unique. Always:
1. Fetch the actual target URL
2. Extract exact values from the response
3. Apply those specific values

Even if you've reskinned a similar site before, extract fresh values for each new target.

---

## Process Overview

```
Phase 1: Analysis → Phase 2: Tokens → Phase 3: Fonts
    ↓                                      ↓
    └──────────────────────────────────────┘
                      ↓
              VALIDATION GATE 1
              (yarn build - check for errors)
                      ↓
Phase 4: Templates → VALIDATION GATE 2 → Phase 5: SCSS
                     (yarn build)              ↓
                                        VALIDATION GATE 3
                                        (yarn build)
                                              ↓
                                    START PREVIEW SERVER
                                    (zcli themes:preview)
                                              ↓
                                    Phase 6: Iterative Refinement
```

**Key Principle:** Validate early, validate often. Don't proceed past a gate with errors.

---

## Phase 1: Analysis (Always Do First)

### Multi-Strategy Extraction

Try these strategies in order until you get useful results:

#### Strategy 1: Direct curl (try first)

```bash
# Basic fetch
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "<url>"

# Extract hex colors
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '#[0-9a-fA-F]{6}' | sort | uniq -c | sort -rn | head -20

# Find logo SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>' | head -1

# Extract navigation links
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'href="https://[^"]*"' | sort | uniq | head -30
```

#### Strategy 2: WebFetch (for JS-heavy sites)

If curl returns minimal results, use WebFetch:

```
"Extract the following from this page:
1. All colors used (exact hex values) for backgrounds, text, buttons, borders
2. The logo (describe it or extract SVG path)
3. Header navigation items and their URLs
4. Footer structure (columns, links, social icons)
5. Font families used
6. Button styles (exact colors, border-radius in pixels, padding)
7. Overall theme (dark/light header, dark/light footer)"
```

#### Strategy 3: Framework Detection

Identify the framework to know HOW to extract values:

```bash
# Tailwind CSS
curl -s "<url>" | grep -oE "bg-[a-z]+-[0-9]+" | sort | uniq -c | sort -rn | head -15

# CSS Modules (hashed class names)
curl -s "<url>" | grep -oE 'class="[^"]*__[A-Za-z0-9]{5}[^"]*"' | head -10

# Vue/Nuxt
curl -s "<url>" | grep -oE 'data-v-[a-f0-9]+' | head -5

# Next.js
curl -s "<url>" | grep -E '__next|data-reactroot' | head -5

# Webflow
curl -s "<url>" | grep -oE 'data-wf-domain|data-wf-site' | head -3
```

**Framework-specific extraction tips:**
- **Tailwind:** Convert classes to hex (see reference table below)
- **CSS Modules:** Colors in inline styles or CSS variables; use WebFetch
- **Vue/Nuxt:** curl usually works; look for inline `<style>` blocks
- **Next.js:** May use CSS Modules; WebFetch often better
- **Webflow:** CSS from CDN; may have Lottie logos

### Tailwind Class → Hex Reference

| Class | Hex | Class | Hex |
|-------|-----|-------|-----|
| `bg-black` | `#000000` | `text-white` | `#FFFFFF` |
| `bg-white` | `#FFFFFF` | `text-black` | `#000000` |
| `bg-slate-900` | `#0f172a` | `text-slate-600` | `#475569` |
| `bg-slate-50` | `#f8fafc` | `text-gray-400` | `#9ca3af` |
| `bg-gray-900` | `#111827` | `bg-zinc-900` | `#18181b` |
| `bg-gray-50` | `#f9fafb` | `bg-neutral-900` | `#171717` |

**Opacity modifiers:** `text-white/60` = `rgba(255, 255, 255, 0.6)`

**Border radius:**
| Class | Value |
|-------|-------|
| `rounded-md` | `6px` |
| `rounded-lg` | `8px` |
| `rounded-xl` | `12px` |
| `rounded-full` | `9999px` |

### Logo Extraction

Try multiple methods:
```bash
# aria-label SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>'

# Logo class SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*class="[^"]*logo[^"]*"[^>]*>.*?</svg>'

# Image logo
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'src="[^"]*logo[^"]*\.(svg|png|webp)"'

# Check for Lottie (animated) - need static fallback
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'data-animation-type="lottie"'
```

**If logo is Lottie animation:** Check favicon, press/brand page, or og:image for static version.

---

## Phase 2: Design Token Extraction

**Extract these EXACT values from the target site:**

### Colors Checklist
- [ ] Header background (exact hex)
- [ ] Header border/shadow (exact CSS)
- [ ] Footer background (exact hex)
- [ ] Primary text color
- [ ] Secondary/muted text color
- [ ] Accent/brand color (CTAs)
- [ ] Link colors and hover states

### Typography Checklist
- [ ] Font family name
- [ ] **Heading font weights** (extract from H1, H2, H3 on target site - usually 500-600)
- [ ] Body font weights (400 for normal, 500-600 for emphasis)
- [ ] Base font size

**IMPORTANT:** Most modern sites use LIGHTER heading weights than the Copenhagen 2026 defaults:
- Copenhagen default: H1=800 (extrabold), H2=700 (bold)
- Most sites: H1=500-600 (medium/semibold), H2=500-600

### Component Styles Checklist
- [ ] Button border-radius (exact px or 9999px for pill)
- [ ] Button padding (exact values)
- [ ] Hover effects (underline? opacity? background change?)

---

## Phase 3: Font Resolution

If the target uses a proprietary font, substitute with a Google Font:

| Proprietary | Google Font Alternative |
|-------------|------------------------|
| Graphik, Söhne, SF Pro | Inter |
| Vanilla Sans, GT Walsheim | DM Sans |
| Circular, Avenir | Nunito Sans |
| Proxima Nova, Gotham | Montserrat / Poppins |
| (any unknown sans-serif) | Inter |

**Inter is the safest fallback for most modern sans-serif fonts.**

### Font Implementation

1. **Load in `document_head.hbs`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. **Update `manifest.json`** (CRITICAL - fonts won't apply without this):
```json
{
  "identifier": "heading_font",
  "value": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
}
```

3. **Update heading weights in `_base.scss`** (CRITICAL - most sites use lighter weights):

First, extract the actual heading weights used on the target site:
```
"What font-weight values are used for H1 and H2 headings? Look for font-weight CSS values."
```

Then update `_base.scss` headings:
```scss
// Copenhagen defaults (too heavy for most sites):
// h1 { font-weight: var(--font-weight-extrabold); }  // 800
// h2 { font-weight: var(--font-weight-bold); }       // 700

// Most modern sites use medium weight (500) for clean look:
h1 { font-weight: var(--font-weight-medium); }    // 500
h2 { font-weight: var(--font-weight-medium); }    // 500
h3 { font-weight: var(--font-weight-semibold); }  // 600

// IMPORTANT: Many component files override heading weights!
// Search and update ALL of these:
```

**Files that define heading/title weights (update ALL of them):**

| File | Element | Default | Fix |
|------|---------|---------|-----|
| `_base.scss` | h1, h2 | extrabold/bold | medium |
| `_hero.scss` | h1, h2 | extrabold | medium |
| `_article.scss` | .article-title | extrabold | medium |
| `_section.scss` | .page-header h1 | extrabold | medium |
| `_home-page.scss` | .home-section h2, .community h2 | bold/extrabold | medium |
| `_recent-activity.scss` | h2 | extrabold | medium |
| `_blocks.scss` | .blocks-item-title | bold | medium |
| `_category.scss` | .section-tree-title | bold | medium |

**Quick fix command:**
```bash
# Find all extrabold/bold heading weights
grep -rn "font-weight.*extrabold\|font-weight.*bold" styles/*.scss | grep -i "title\|h1\|h2"
```

**Key insight:** Zendesk.com and similar clean, modern sites use font-weight 500 (medium) for headings, NOT 700-800. Heavy weights look dated.

**Common patterns that need fixing:**
- Card titles (`.blocks-item-title`, `.section-tree-title`)
- Page titles (`.article-title`, `.page-header h1`)
- Section headings (`.home-section h2`, `.community h2`)
- Hero text (`.hero h1, .hero h2`)

---

## Phase 4: Template Generation

### CRITICAL TEMPLATE RULES

**Valid Zendesk helpers:**
- `{{t 'skip_navigation'}}`, `{{t 'user_navigation'}}`, `{{t 'toggle_navigation'}}`
- `{{t 'sign_in'}}`, `{{t 'profile'}}`, `{{t 'activities'}}`
- `{{link 'help_center'}}`, `{{link 'community'}}`, `{{link 'new_request'}}`
- `{{link 'sign_in'}}`, `{{link 'sign_out'}}`, `{{link 'requests'}}`

**INVALID - will cause 400 errors:**
- `{{t 'global_navigation'}}` - Does not exist
- `{{current_year}}` - Does not exist
- Any custom translation keys

**Use hardcoded strings for custom text:**
```handlebars
<!-- WRONG -->
<nav aria-label="{{t 'global_navigation'}}">

<!-- CORRECT -->
<nav aria-label="Main navigation">

<!-- WRONG -->
&copy; Company {{current_year}}

<!-- CORRECT -->
&copy; Company 2025
```

### CRITICAL: Preserve Dynamic Functionality

**NEVER hardcode URLs to the target's help center.**

The theme runs on the CUSTOMER'S Zendesk, not the target brand's.

```handlebars
{{!-- ❌ WRONG - Links to wrong help center --}}
<a href="https://help.targetsite.com/hc/en-us/categories/123">Get started</a>

{{!-- ✅ CORRECT - Uses Zendesk helper --}}
{{link 'help_center'}}

{{!-- ✅ ALSO CORRECT - External link to target's MAIN site --}}
<a href="https://www.targetsite.com/pricing/">Pricing</a>
```

| Link Type | Approach |
|-----------|----------|
| Help center pages | Use Zendesk helpers |
| Target's main site | External URL OK |
| Target's help center | **NEVER hardcode** |

### Main Site vs Help Center Styling

Many brands have DIFFERENT styling between main site and help center (e.g., dark footer on main site, light footer on help center).

**When analyzing:**
1. Check BOTH main site AND help center (if it exists)
2. Note any differences
3. **ASK the user** which styling to use if unclear

```
# Common help center URLs:
help.{domain}.com
support.{domain}.com
docs.{domain}.com
{domain}.com/help
```

### Header Template Structure

```handlebars
<a class="skip-navigation" tabindex="1" href="#main-content">{{t 'skip_navigation'}}</a>

<div class="header-wrapper">
  <header class="header">
    <div class="header-left">
      <div class="logo">
        {{#link 'help_center' class='logo-link' aria-label='Company Help Center'}}
          <!-- Inline SVG logo - MUST include viewBox -->
          <svg class="company-logo" viewBox="0 0 WIDTH HEIGHT" fill="currentColor" aria-hidden="true">
            <path d="..."/>
          </svg>
          <span class="logo-text">Help Center</span>
        {{/link}}
      </div>

      <nav class="main-nav" aria-label="Main navigation">
        <ul class="main-nav-list">
          <!-- External links to main site OK -->
          <li><a href="https://www.targetsite.com/products/" class="main-nav-link">Products</a></li>
          <!-- Zendesk helpers for help center links -->
          <li>{{link 'community' class='main-nav-link'}}</li>
        </ul>
      </nav>
    </div>

    <div class="header-right">
      <!-- User navigation, dropdowns, CTA button -->
    </div>
  </header>
</div>
```

### Footer Template Structure

```handlebars
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-columns">
      <!-- Copy column structure from target site -->
      <!-- Use Zendesk helpers for help center links -->
      <div class="footer-column">
        <h4 class="footer-column-title">Support</h4>
        <ul class="footer-links">
          <li>{{link 'help_center'}}</li>
          <li>{{link 'community'}}</li>
          <li>{{link 'new_request'}}</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <!-- Social links, language selector, copyright -->
      <div class="footer-copyright">&copy; Company Name 2025</div>
    </div>
  </div>
</footer>
```

---

## Phase 5: SCSS Generation

### CRITICAL: Extract and Apply Exact Values

**Before writing ANY SCSS, use WebFetch to extract exact styling:**

```
"Extract EXACT styling values:

HEADER:
1. Background color (exact hex)
2. Border or box-shadow (exact CSS value)
3. Nav link color and hover effect
4. CTA button: background, text color, border-radius, padding

FOOTER:
1. Background color (exact hex)
2. Link text color (exact hex or rgba)
3. Column header color
4. Border colors"
```

**Why exact values matter:**
- `#000000` looks different from `#111111`
- `rgba(255,255,255,0.6)` looks different from `#999999`
- `box-shadow: 0 1px 0 rgba(0,0,0,0.08)` is different from `border-bottom: 1px solid #E5E7EB`

### Apply Extracted Values Directly

```scss
// WRONG - Using approximate CSS variables
.header-wrapper {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
}

// CORRECT - Using exact extracted values
.header-wrapper {
  background-color: #FFFFFF;  // Exact value from target
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);  // Exact value from target
}
```

### SCSS Patterns by Category

**Light header:**
```scss
.header-wrapper {
  background-color: #FFFFFF;  // Extract exact value
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);  // Or border-bottom - extract exact
}

.main-nav-link {
  color: #000000;  // Extract exact value
  // Hover effect - extract exact style from target
}
```

**Dark header:**
```scss
.header-wrapper {
  background-color: #000000;  // Extract exact value
}

.main-nav-link {
  color: rgba(255, 255, 255, 0.7);  // Extract exact value
  &:hover { color: #FFFFFF; }
}
```

**Dark footer:**
```scss
.footer {
  background-color: #000000;  // Extract exact value - is it pure black or near-black?
}

.footer-column-title {
  color: rgba(255, 255, 255, 0.6);  // Extract exact value
}

.footer-links a {
  color: #FFFFFF;  // Extract exact value
  &:hover { opacity: 0.7; }  // Extract exact hover effect
}
```

**Light footer:**
```scss
.footer {
  background-color: #FFFFFF;
  border-top: 1px solid #E5E7EB;  // Extract exact value
}

.footer-links a {
  color: #666666;  // Extract exact value
  &:hover { color: #000000; }
}
```

### Common Hover Effect Patterns

Extract the exact hover effect from the target:

```scss
// Animated underline
&::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 0.15s ease;
}
&:hover::after { transform: scaleX(1); }

// Background change
&:hover { background-color: rgba(0, 0, 0, 0.05); }

// Opacity change
&:hover { opacity: 0.7; }

// Simple underline
&:hover { text-decoration: underline; }

// Color change
&:hover { color: #000000; }
```

### Logo Sizing

```scss
.company-logo {
  width: [extracted-width]px;
  height: [extracted-height]px;

  // If too small, add scale
  transform: scale(1.15);
  transform-origin: left center;

  // If vertically misaligned
  margin-top: -10px;  // Negative moves up

  color: [extracted-color];
}
```

---

## Phase 6: Validation & Iterative Refinement

### Validation Gates

**After templates:**
```bash
yarn build
# Must pass with no 400 errors before proceeding
```

**After SCSS:**
```bash
yarn build && zcli themes:preview
```

### Visual Verification Checklist

Open target site and preview side-by-side:

```
HEADER:
[ ] Background color matches exactly
[ ] Logo size and position match
[ ] Nav link colors match
[ ] CTA button matches (color, shape, size)

FOOTER:
[ ] Background color matches exactly
[ ] Text colors match
[ ] Link hover effects work

TYPOGRAPHY:
[ ] Font looks similar
[ ] Page heading weights match (H1, H2)
[ ] Card title weights match (home page cards, category cards)
[ ] Body text weight looks correct
```

### Iterative Refinement

| Issue | Fix |
|-------|-----|
| Logo too small | Add `transform: scale(1.15)` |
| Logo too large | Reduce scale or width/height |
| Logo misaligned | Adjust `margin-top` |
| Colors off | Re-extract exact hex values |
| Wrong hover effect | Re-extract and identify effect type |

---

## Final Step: Start Preview Server

After all changes pass `yarn build`:

```bash
# Kill any existing preview
lsof -ti :4567 | xargs kill -9 2>/dev/null || true
sleep 1

# Start preview
zcli themes:preview
```

Tell the user the preview URL so they can verify.

---

## Common Issues & Solutions

### curl returns empty/minimal results
**Solution:** Use WebFetch for JS-rendered sites

### Logo appears jumbled
**Solution:** Verify viewBox matches path coordinates

### Template 400 error
**Solution:** Check for invalid helpers (`{{t 'global_navigation'}}`, `{{current_year}}`)

### Fonts not applied
**Solution:** Update manifest.json `heading_font` and `text_font` values

### Colors don't match
**Solution:** Re-extract exact hex values; use hardcoded values, not CSS variables

### Header/footer styling "close but not quite"
**Solution:** Extract exact values with WebFetch; check main site vs help center

### Site blocked by Cloudflare/CAPTCHA
**Solution:** Ask user for screenshot, DevTools colors, or brand page

### Search has double border
**Solution:** Style `.search` wrapper only, not the input element

### Navigation links go to wrong help center
**Solution:** Use Zendesk helpers (`{{link 'help_center'}}`), never hardcode help center URLs

### Headings look too bold/heavy
**Solution:** Copenhagen 2026 uses heavy weights (800/700) but most modern sites use 500-600. Update in MULTIPLE files:

1. Base headings: `_base.scss` (h1, h2, h3)
2. Component titles: `_blocks.scss`, `_category.scss`, `_article.scss`
3. Page sections: `_hero.scss`, `_home-page.scss`, `_section.scss`, `_recent-activity.scss`

**Key patterns to fix:**
- `.blocks-item-title` - Home page category cards
- `.section-tree-title` - Category page section cards
- `.article-title` - Article page title
- `.page-header h1` - Section/category page headers
- `.home-section h2` - Home page section headers

Search: `grep -rn "font-weight.*bold" styles/*.scss | grep -i title`

---

## Output Format

When running `/reskin analyze`, output:

```markdown
## Target Site Analysis: [URL]

### Extraction Method
[curl / WebFetch / Tailwind detection]

### Colors (Exact Values)
| Element | Value |
|---------|-------|
| Header BG | [exact hex] |
| Header shadow/border | [exact CSS] |
| Footer BG | [exact hex] |
| Primary Text | [exact hex] |
| CTA Button | [exact hex] |

### Typography
- **Font:** [Name] → Alternative: [Google Font]
- **Heading weights:** H1=[weight], H2=[weight] (usually 500-600 for modern sites)
- **Body weights:** normal=[weight], emphasis=[weight]

### Logo
- **Type:** SVG / Image / Lottie
- **viewBox:** [if SVG]
- **Sizing:** [width x height]

### Header Structure
- Nav items: [list]
- Hover effect: [underline/opacity/background/etc]
- CTA: [text and style]

### Footer Structure
- Columns: [count and headings]
- Background: [dark/light, exact color]
- Social links: [which platforms]

Ready to proceed with `/reskin apply`?
```

---

## Social Media Icon SVGs

```html
<!-- Twitter/X -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
</svg>

<!-- LinkedIn -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
</svg>

<!-- YouTube -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
</svg>

<!-- GitHub -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
</svg>

<!-- Instagram -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
</svg>

<!-- Facebook -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>
```
