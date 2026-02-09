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
Phase 4: Templates → VALIDATION GATE 2 → Phase 5: SCSS (ALL FILES)
                     (yarn build)              ↓
                                        VALIDATION GATE 3
                                        (yarn build)
                                              ↓
                                    COMPLETION CHECKLIST
                                    (verify ALL files updated)
                                              ↓
                                    START PREVIEW SERVER
                                    (zcli themes:preview)
                                              ↓
                                    Phase 6: Iterative Refinement
```

### Key Principles

1. **Validate early, validate often.** Don't proceed past a gate with errors.

2. **NEVER skip parts.** A partial reskin is worse than no reskin - it creates visual inconsistency.

3. **Update ALL relevant files.** Typography, cards, and buttons are defined in MULTIPLE files. Updating only `_base.scss` or `_buttons.scss` leaves inconsistent styling.

4. **Extract, don't fabricate.** Logos and design values MUST come from the target site. Never create logos or guess at values.

5. **Preserve working patterns.** When modifying templates, keep Zendesk helpers and conditional blocks intact.

### What "Complete" Means

A reskin is complete when:
- All 9 checklist sections are verified (see MANDATORY Completion Checklist)
- Visual comparison shows consistent styling across all pages
- `yarn build` passes without errors
- Preview server is running for user verification

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

### Logo Extraction - MANDATORY

**CRITICAL:** The logo MUST be extracted from the target website. NEVER fabricate or create your own logo SVG.

#### Logo Extraction Strategy (Try ALL Until Success)

**Strategy 1: Direct SVG from HTML**
```bash
# aria-label SVG (most common)
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>' | head -1

# Logo class SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*class="[^"]*logo[^"]*"[^>]*>.*?</svg>' | head -1

# Any SVG in header area (extract first few and inspect)
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*>.*?</svg>' | head -5
```

**Strategy 2: Image Logo URL**
```bash
# Find logo image
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'src="[^"]*logo[^"]*\.(svg|png|webp|jpg)"' | head -3

# Find favicon (fallback)
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'href="[^"]*favicon[^"]*"' | head -1

# Find og:image
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'content="[^"]*og:image[^"]*"|og:image.*?content="[^"]*"' | head -1
```

**Strategy 3: WebFetch for JS-Heavy Sites**
```
"Extract the company logo:
1. Is there an inline SVG logo? If so, provide the COMPLETE SVG markup including all paths
2. If image, provide the EXACT src URL
3. What are the dimensions of the logo?
4. What color is the logo? (single color, multicolor, gradient)"
```

**Strategy 4: Brand/Press Page**
```bash
# Check for brand assets page
curl -s -A "Mozilla/5.0..." "<url>/press"
curl -s -A "Mozilla/5.0..." "<url>/brand"
curl -s -A "Mozilla/5.0..." "<url>/about" | grep -i logo
```

**Strategy 5: GitHub/CDN (for tech companies)**
```bash
# Many companies host logos on GitHub or CDN
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'https://[^"]*\.(svg|png)' | grep -i logo
```

#### Logo Decision Tree

```
1. Found inline SVG in HTML?
   → Use it directly (preserve complete markup including viewBox)

2. Found logo image URL?
   → Use <img> tag with extracted URL

3. Site uses Lottie animation?
   → Check favicon, press page, or og:image for static version

4. All extraction methods failed?
   → ASK THE USER for:
     a. Screenshot of the logo
     b. Direct link to logo file
     c. Brand page URL
   → NEVER fabricate a logo
```

#### Logo Implementation

**For SVG logos:**
```handlebars
{{#link 'help_center' class='logo-link'}}
  <!-- PASTE COMPLETE EXTRACTED SVG HERE - DO NOT MODIFY PATHS -->
  <svg viewBox="[extracted]" fill="currentColor" aria-hidden="true">
    [extracted paths - copy EXACTLY]
  </svg>
  <span class="logo-text">Help Center</span>
{{/link}}
```

**For image logos:**
```handlebars
{{#link 'help_center' class='logo-link'}}
  <img src="[extracted-url]" alt="Company Logo" class="logo-image" />
  <span class="logo-text">Help Center</span>
{{/link}}
```

**NEVER DO THIS:**
```handlebars
<!-- ❌ WRONG - Fabricated logo -->
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40"/>  <!-- Made up! -->
</svg>
```

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
- [ ] Card border-radius (usually 8px for flat, 16-24px for elevated)
- [ ] Card shadows (often none/subtle for flat, heavy for elevated)
- [ ] Card borders (often `1px solid #ddd` for flat, none for elevated)

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

### BEFORE MODIFYING TEMPLATES

**MANDATORY:** Read the existing template files BEFORE making ANY changes:
```bash
# Read current templates
cat templates/header.hbs
cat templates/footer.hbs
```

This ensures you understand the working structure and don't accidentally break it.

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

**CRITICAL: Read the existing header.hbs FIRST before making ANY changes.**

The Copenhagen theme header has specific Zendesk patterns that MUST be preserved. Breaking these causes template errors or broken functionality.

#### Safe Header Modification Rules

**MUST PRESERVE (Do NOT remove or restructure):**
```handlebars
{{!-- 1. Skip navigation link --}}
<a class="skip-navigation" tabindex="1" href="#main-content">{{t 'skip_navigation'}}</a>

{{!-- 2. User navigation section - KEEP THE EXACT STRUCTURE --}}
<nav class="user-nav" aria-label="{{t 'user_navigation'}}">
  {{#if signed_in}}
    {{!-- Avatar/dropdown for signed-in users --}}
  {{else}}
    {{!-- Sign in link for anonymous users --}}
  {{/if}}
</nav>

{{!-- 3. Mobile menu toggle --}}
<button type="button" class="header-nav-toggle" aria-label="{{t 'toggle_navigation'}}" aria-expanded="false">
```

**CAN MODIFY SAFELY:**
- Logo (replace SVG/image, but keep link structure)
- Main navigation items (add/remove links)
- CTA button text and styling classes
- Header wrapper classes
- Visual layout (left/center/right sections)

#### Safe Header Template Pattern

```handlebars
<a class="skip-navigation" tabindex="1" href="#main-content">{{t 'skip_navigation'}}</a>

<div class="header-wrapper">
  <header class="header">
    {{!-- LEFT SECTION: Logo + Nav --}}
    <div class="header-left">
      <div class="logo">
        {{#link 'help_center' class='logo-link' aria-label='Help Center'}}
          {{!-- REPLACE WITH EXTRACTED LOGO --}}
          <svg class="company-logo" viewBox="[extracted]" fill="currentColor" aria-hidden="true">
            [extracted paths]
          </svg>
          <span class="logo-text">Help Center</span>
        {{/link}}
      </div>

      {{!-- CAN ADD MAIN NAV HERE --}}
      <nav class="main-nav" aria-label="Main navigation">
        <ul class="main-nav-list">
          <li><a href="https://www.targetsite.com/products/" class="main-nav-link">Products</a></li>
          <li>{{link 'community' class='main-nav-link'}}</li>
        </ul>
      </nav>
    </div>

    {{!-- RIGHT SECTION: User Nav + CTA --}}
    <div class="header-right">
      {{!-- MOBILE TOGGLE - PRESERVE STRUCTURE --}}
      <button type="button" class="header-nav-toggle" aria-label="{{t 'toggle_navigation'}}" aria-expanded="false">
        <svg class="icon-menu">...</svg>
      </button>

      {{!-- USER NAV - PRESERVE ENTIRE BLOCK --}}
      <nav class="user-nav" aria-label="{{t 'user_navigation'}}">
        {{#if signed_in}}
          <div class="dropdown">
            <span class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
              {{current_user.avatar}}
              <span class="dropdown-caret"></span>
            </span>
            <ul class="dropdown-menu" role="menu">
              <li role="menuitem">{{link 'profile'}}</li>
              <li role="menuitem">{{link 'requests'}}</li>
              <li role="menuitem">{{link 'contributions'}}</li>
              <li role="separator"></li>
              <li role="menuitem">{{link 'sign_out'}}</li>
            </ul>
          </div>
        {{else}}
          {{link 'sign_in' class='sign-in-link'}}
        {{/if}}
      </nav>

      {{!-- CTA BUTTON - CAN MODIFY TEXT/CLASSES --}}
      {{link 'new_request' class='header-cta button-primary'}}
    </div>
  </header>
</div>
```

#### Common Header Mistakes to AVOID

```handlebars
{{!-- ❌ WRONG: Removing user nav signed_in conditional --}}
<nav class="user-nav">
  <a href="{{link 'sign_in'}}">Sign In</a>  {{!-- Broken: shows even when signed in --}}
</nav>

{{!-- ❌ WRONG: Using invalid helpers --}}
<nav aria-label="{{t 'global_navigation'}}">  {{!-- 400 error: helper doesn't exist --}}

{{!-- ❌ WRONG: Removing mobile toggle --}}
{{!-- Missing toggle = broken mobile nav --}}

{{!-- ❌ WRONG: Breaking dropdown structure --}}
<div class="dropdown">
  {{current_user.avatar}}  {{!-- Missing toggle/menu = broken dropdown --}}
</div>

{{!-- ✅ CORRECT: Keep structure, change styling --}}
<nav class="user-nav" aria-label="{{t 'user_navigation'}}">
  {{#if signed_in}}
    <div class="dropdown">
      {{!-- Keep ALL dropdown elements --}}
    </div>
  {{else}}
    {{link 'sign_in' class='sign-in-link'}}
  {{/if}}
</nav>
```

#### Header Modification Workflow

1. **Read existing header.hbs** - Understand current structure
2. **Identify what to change** - Usually just logo, nav items, styling classes
3. **Copy the full template** - Start from working template, not from scratch
4. **Make targeted edits** - Change only what needs changing
5. **Validate immediately** - Run `yarn build` after header changes

### Footer Template Structure

**Read the existing footer.hbs FIRST before making changes.**

Footers are more flexible than headers, but still need to preserve Zendesk functionality.

#### Safe Footer Modification Rules

**CAN MODIFY FREELY:**
- Column structure and content
- Visual layout (columns, grid)
- Social links
- Copyright text
- Styling classes

**SHOULD PRESERVE (if present in original):**
- Language selector dropdown
- Any Zendesk helpers for dynamic content

#### Footer Template Pattern

```handlebars
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-columns">
      {{!-- Copy column structure from target site --}}
      {{!-- Use Zendesk helpers for help center links --}}
      <div class="footer-column">
        <h4 class="footer-column-title">Support</h4>
        <ul class="footer-links">
          <li>{{link 'help_center'}}</li>
          <li>{{link 'community'}}</li>
          <li>{{link 'new_request'}}</li>
        </ul>
      </div>

      <div class="footer-column">
        <h4 class="footer-column-title">Company</h4>
        <ul class="footer-links">
          {{!-- External links to main site OK --}}
          <li><a href="https://www.targetsite.com/about">About</a></li>
          <li><a href="https://www.targetsite.com/careers">Careers</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      {{!-- Social links with extracted icons --}}
      <div class="footer-social">
        <a href="https://twitter.com/company" aria-label="Twitter">
          <svg>...</svg>
        </a>
      </div>

      {{!-- Copyright - hardcode, don't use {{current_year}} --}}
      <div class="footer-copyright">&copy; Company Name 2025</div>
    </div>
  </div>
</footer>
```

#### Footer Mistakes to AVOID

```handlebars
{{!-- ❌ WRONG: Using invalid helper --}}
&copy; {{current_year}}  {{!-- 400 error --}}

{{!-- ✅ CORRECT: Hardcode the year --}}
&copy; 2025
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
  background-color: [extracted-header-bg];     // e.g., #FFFFFF or #0f172a
  box-shadow: [extracted-header-shadow];       // e.g., 0 1px 0 rgba(0,0,0,0.08)
}
```

### SCSS Patterns by Category

**Header:**
```scss
.header-wrapper {
  background-color: [extracted-header-bg];
  box-shadow: [extracted-header-shadow];  // Or border-bottom
}

.main-nav-link {
  color: [extracted-nav-link-color];
  &:hover {
    [extracted-hover-effect]  // Could be color change, underline, background, etc.
  }
}
```

**Footer:**
```scss
.footer {
  background-color: [extracted-footer-bg];
  border-top: [extracted-footer-border];  // If applicable
}

.footer-column-title {
  color: [extracted-footer-heading];
}

.footer-links a {
  color: [extracted-footer-link];
  &:hover {
    [extracted-footer-hover]  // Could be opacity, color change, underline, etc.
  }
}
```

### Common Hover Effect Patterns

Extract the exact hover effect from the target. Common patterns include:

- **Animated underline** - `::after` pseudo-element with `transform: scaleX()`
- **Background change** - `background-color` on hover
- **Opacity change** - `opacity` on hover
- **Simple underline** - `text-decoration: underline`
- **Color change** - Different `color` on hover

Apply whatever pattern the target site uses.

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

## Phase 5b: Card & Container Styles

### Extract Card Styling from Target

Most modern sites (Figma, Stripe, Zendesk) use **flat, minimal card styling**. Copenhagen 2026 defaults are heavier than most sites need.

**Extract these values:**
```
"Extract card/container styling:
1. Card border-radius (exact px value - usually 8px)
2. Card shadows (exact CSS or 'none')
3. Card borders (exact CSS - often '1px solid #ddd')
4. Card background colors
5. Hover effects on cards"
```

### Common Patterns

**Flat/Minimal pattern:**
- Consistent border-radius (often 8px)
- Subtle or no shadows
- Visible borders (e.g., `1px solid [border-color]`)
- Minimal hover effects

**Elevated pattern:**
- Larger border-radius (12-24px)
- Heavy shadows for depth
- No borders (shadow provides definition)
- Lift/transform on hover

**Apply extracted values:**
```scss
// Update _tokens.scss with extracted values
$radius-sm: [extracted-radius-sm];
$radius-md: [extracted-radius-md];
$radius-lg: [extracted-radius-lg];

$shadow-sm: [extracted-shadow-sm];
$shadow-md: [extracted-shadow-md];
$shadow-lg: [extracted-shadow-lg];

// Apply to card components
.blocks-item {
  background-color: [extracted-card-bg];
  border: [extracted-card-border];      // e.g., "1px solid #ddd" or "none"
  border-radius: [extracted-card-radius];
  box-shadow: [extracted-card-shadow];  // e.g., "none" or shadow value

  &:hover {
    box-shadow: [extracted-hover-shadow];
    border-color: [extracted-hover-border];
  }
}
```

### Files to Update for Card Styles

| File | Components | What to change |
|------|------------|----------------|
| `_tokens.scss` | All | `$radius-*` and `$shadow-*` values |
| `_blocks.scss` | Home page category cards | border, shadow, radius, hover |
| `_category.scss` | Section tree cards | `.section-tree .section` styling |
| `_section.scss` | Section list items, sub-nav | border, shadow, radius |
| `_article.scss` | Article content, votes, related | border, shadow, radius |
| `_recent-activity.scss` | Activity cards | border, shadow, radius |

### Removing Decorative Elements

Copenhagen 2026 includes accent bars, gradient decorations, and animated hovers. Most target sites don't have these.

**Things to remove for flat styling:**
```scss
// REMOVE: Top accent bars
&::before {
  content: "";
  position: absolute;
  top: 0;
  height: 4px;
  background: var(--color-interactive);
  // DELETE THIS ENTIRE BLOCK
}

// REMOVE: Decorative underlines
&::after {
  width: 40px;
  height: 2px;
  background: var(--color-interactive);
  // DELETE THIS ENTIRE BLOCK
}

// REMOVE: Heavy transform on hover
&:hover {
  transform: translateY(-6px);  // DELETE
  box-shadow: var(--shadow-xl);  // CHANGE to shadow-md or none
}

// REMOVE: Gradient backgrounds
background: linear-gradient(...);  // CHANGE to solid color
```

### Quick Reference: Figma-style Card Fixes

```bash
# Find all accent bars to remove
grep -rn "::before\|::after" styles/*.scss | grep -i "accent\|height: 4px\|height: 2px"

# Find all heavy shadows to reduce
grep -rn "shadow-lg\|shadow-xl" styles/*.scss

# Find all transform hovers to remove
grep -rn "translateY\|translateX" styles/*.scss | grep hover
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

CARDS & CONTAINERS:
[ ] Card border-radius matches (flat: 8px, elevated: 16-24px)
[ ] Card shadows match (flat: none/subtle, elevated: heavy)
[ ] Card borders match (flat: 1px solid #ddd, elevated: none)
[ ] Card hover effects match (flat: subtle, elevated: lift)
[ ] No unwanted accent bars or decorations
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

## MANDATORY Completion Checklist

**CRITICAL: A reskin is NOT complete until ALL items are checked.**

Before starting the preview server, verify EVERY item below. Do not skip ANY section.

### Phase Completion Gates

```markdown
## Reskin Completion Checklist

### 1. Analysis Complete
- [ ] Colors extracted (all hex values documented)
- [ ] Typography extracted (font family, weights)
- [ ] Logo extracted (NOT fabricated)
- [ ] Header structure analyzed
- [ ] Footer structure analyzed
- [ ] Spacing/density analyzed

### 2. Tokens & Fonts Applied
- [ ] `manifest.json` - All color settings updated
- [ ] `manifest.json` - Font families updated
- [ ] `document_head.hbs` - Google Font loaded
- [ ] `yarn build` passes

### 3. Templates Updated
- [ ] `header.hbs` - Logo replaced with EXTRACTED logo
- [ ] `header.hbs` - Structure preserved (user nav, mobile toggle)
- [ ] `footer.hbs` - Structure matches target
- [ ] `yarn build` passes (NO 400 errors)

### 4. Typography Updated (ALL FILES)
- [ ] `_base.scss` - h1, h2, h3, h4, h5, h6 weights
- [ ] `_hero.scss` - .hero h1, h2 weights
- [ ] `_article.scss` - .article-title weight
- [ ] `_section.scss` - .page-header h1 weight
- [ ] `_home-page.scss` - section heading weights
- [ ] `_blocks.scss` - .blocks-item-title weight
- [ ] `_category.scss` - .section-tree-title weight
- [ ] `_recent-activity.scss` - heading weights

### 5. Cards & Containers Updated (ALL FILES)
- [ ] `_tokens.scss` - border-radius values
- [ ] `_tokens.scss` - shadow values
- [ ] `_blocks.scss` - card borders, shadows, hover
- [ ] `_category.scss` - section tree cards
- [ ] `_section.scss` - section list items
- [ ] `_article.scss` - article containers
- [ ] `_recent-activity.scss` - activity cards

### 6. Buttons Updated (ALL FILES)
- [ ] `_buttons.scss` - main button styles
- [ ] `_home-page.scss` - .community-link CTA
- [ ] `_header.scss` - header CTA
- [ ] `_forms.scss` - submit buttons

### 7. Hero & Search Updated
- [ ] `_hero.scss` - background, padding, height
- [ ] `_search.scss` - search box styling

### 8. Spacing Updated
- [ ] `_hero.scss` - compact hero if target is compact
- [ ] `_home-page.scss` - section margins reduced if needed
- [ ] Overall page density matches target

### 9. Final Validation
- [ ] `yarn build` passes
- [ ] Preview server started
- [ ] Visual comparison with target site done
```

### File Update Quick Reference

**Typography files to update:**
```bash
grep -rn "font-weight" styles/*.scss | grep -E "extrabold|bold" | grep -v "//"
```

**Card/shadow files to update:**
```bash
grep -rn "shadow-lg\|shadow-xl\|radius-xl\|radius-2xl" styles/*.scss | grep -v "//"
```

**Button files to update:**
```bash
grep -rn "radius-full\|9999px" styles/*.scss | grep -v "//"
```

### Incomplete Reskin Warning Signs

If ANY of these are true, the reskin is NOT complete:

1. **Only `_base.scss` was updated for typography** - INCOMPLETE
   - Component files override base styles - they MUST be updated too

2. **Logo was created/fabricated instead of extracted** - INCOMPLETE
   - Go back and extract the actual logo

3. **Header structure was rewritten from scratch** - LIKELY BROKEN
   - Should have modified existing structure, not replaced it

4. **Card styles were not touched** - INCOMPLETE
   - Cards are a major visual element

5. **Only one button file was updated** - INCOMPLETE
   - Buttons exist in multiple component files

6. **Spacing was not adjusted** - POTENTIALLY INCOMPLETE
   - Compare hero height and section gaps to target

---

## Final Step: Start Preview Server

After ALL checklist items are verified and `yarn build` passes:

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

### Logo extraction failed completely
**Solution:** NEVER fabricate a logo. Ask the user to provide:
1. Direct URL to logo file (SVG or PNG)
2. Screenshot of the logo
3. Link to brand/press page
4. Permission to use text-only logo as fallback

```handlebars
{{!-- Text-only logo fallback (ONLY if user approves) --}}
{{#link 'help_center' class='logo-link'}}
  <span class="logo-text-only">Company Name</span>
  <span class="logo-text">Help Center</span>
{{/link}}
```

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

### Cards look too elevated/heavy
**Solution:** Copenhagen 2026 uses large border-radius (16-24px) and heavy shadows. Most sites (Figma, Zendesk, etc.) use flat styling:

1. Update `_tokens.scss`: Set all `$radius-*` to 8px, reduce `$shadow-*` values
2. Update card components: Add `border: 1px solid #ddd`, remove `box-shadow`
3. Remove accent decorations: Delete `::before` and `::after` blocks with accent bars/underlines
4. Simplify hover effects: Remove `transform: translateY()`, use subtle shadow only

**Files to update:**
- `_tokens.scss` - radius and shadow values
- `_blocks.scss` - home page category cards
- `_category.scss` - section tree cards
- `_section.scss` - section list items, sub-nav, page headers
- `_article.scss` - article content, votes, related articles
- `_recent-activity.scss` - activity section and items

Search: `grep -rn "radius-xl\|radius-2xl\|shadow-lg\|shadow-xl" styles/*.scss`

### Buttons look too rounded/pill-shaped
**Solution:** Copenhagen 2026 uses pill buttons (`border-radius: 9999px`). Extract the target site's button radius and apply it.

Update `_buttons.scss`:
```scss
border-radius: [extracted-button-radius];  // Could be 4px, 8px, or 9999px

// If target doesn't use transform hover, remove it:
&:hover {
  // DELETE: transform: translateY(-2px);
}
```

### Button styling inconsistent across pages
**Solution:** Button styles are defined in multiple component files, not just `_buttons.scss`. After updating button styles, search for ALL button/link instances:

```bash
# Find all pill-shaped elements (need flat styling)
grep -rn "radius-full\|9999px" styles/*.scss

# Find all CTA-style links
grep -rn "link\|cta\|action" styles/*.scss | grep -v "//\|color-link"

# Find transform hover effects (often need removal)
grep -rn "translateY\|translateX" styles/*.scss | grep hover
```

**Files that commonly have button-like elements:**

| File | Elements | What to check |
|------|----------|---------------|
| `_buttons.scss` | `.button`, `.button-primary` | Main button styles |
| `_home-page.scss` | `.community-link` | CTA button in community section |
| `_recent-activity.scss` | `.recent-activity-controls a` | "See all activity" link |
| `_header.scss` | `.header-cta`, nav buttons | Header action buttons |
| `_footer.scss` | Social links, CTA buttons | Footer action elements |
| `_article.scss` | `.article-vote`, action buttons | Article interaction buttons |
| `_forms.scss` | Submit buttons | Form buttons |

**IMPORTANT:** After updating `_buttons.scss`, always check these component files for:
- `border-radius: var(--radius-full)` → Change to `[extracted-button-radius]`
- `box-shadow: var(--shadow-lg)` → Change to `[extracted-button-shadow]`
- `transform: translateY(-Xpx)` on hover → Keep only if target uses it
- Arrow icons with animation → Keep only if target uses them

### Search box too rounded or has heavy shadow
**Solution:** Extract the target site's search box styling and apply it.

Update `_search.scss`:
```scss
.search {
  border-radius: [extracted-search-radius];
  border: [extracted-search-border];
  box-shadow: [extracted-search-shadow];

  &:focus-within {
    border-color: [extracted-focus-color];
    box-shadow: [extracted-focus-ring];
  }
}
```

### Hero styling doesn't match target
**Solution:** Extract the target site's hero styling and apply it.

Update `_hero.scss`:
```scss
.hero {
  background-color: [extracted-hero-bg];
  // If target has gradient: background: [extracted-gradient];
  // If target has no gradient: DELETE the &::after block

  &-inner {
    color: [extracted-hero-text];

    h1, h2 {
      color: [extracted-hero-heading];
      // If target has no text-shadow: DELETE text-shadow
    }
  }
}
```

### Home page has too much whitespace
**Solution:** Copenhagen 2026 uses generous spacing. Most target sites are more compact.

**Files to check:**

| File | Element | Default | Tighter |
|------|---------|---------|---------|
| `_hero.scss` | `.hero` min-height | 220px/280px | 160px/200px |
| `_hero.scss` | `.hero` padding | space-10/space-12 | space-6/space-8 |
| `_home-page.scss` | `.section` margin-bottom | space-12/space-16 | space-8/space-10 |
| `_home-page.scss` | `.home-section h2` margin-bottom | space-8 | space-5 |
| `_home-page.scss` | `.community` padding | space-14 | space-8 |
| `_home-page.scss` | `.activity` padding | space-10 | space-6 |

**Extraction prompt:**
```
"Analyze the spacing on the target site:
1. Hero section height and padding
2. Gap between major sections
3. Section heading spacing
4. Overall density (compact vs airy)"
```

Apply values that match the target's density. Most modern sites favor tighter layouts.

### Form inputs have heavy styling
**Solution:** Extract the target site's input styling and apply it.

Update `_forms.scss`:
```scss
.form-field input {
  border: [extracted-input-border];
  border-radius: [extracted-input-radius];
  box-shadow: [extracted-input-shadow];

  &:focus {
    border-color: [extracted-focus-border];
    box-shadow: [extracted-focus-ring];
  }
}
```

### Empty box appearing on search results page
**Solution:** The generative answers section uses an overly broad CSS selector.

**NEVER use broad selectors like this:**
```scss
// ❌ BAD - matches ANY first child, including empty containers
.search-results-column {
  > :first-child:not(.search-results-subheading):not(.search-results-list) {
    background-color: #f9f9f9;
    // This will style empty elements too!
  }
}
```

**ALWAYS use specific class-based selectors:**
```scss
// ✅ GOOD - only matches elements with specific class names
[class*="generative-answer"],
[class*="ai-answer"],
[class*="instant-answer"],
[class*="quick-answer"] {
  background-color: [extracted-card-bg];
  border: [extracted-card-border];
  border-radius: [extracted-card-radius];
  padding: var(--space-8);
}
```

**Key principle:** When styling dynamic/optional content (like AI answers), only target elements with specific class names. Avoid `:first-child`, `:last-child`, or other structural selectors that might match empty or placeholder elements.

---

## Additional Style Categories

### Hero/Search Section

**Extract these values:**
```
"Analyze the hero/search section:
1. Hero background color or gradient
2. Search box border-radius (usually 8px)
3. Search box border (e.g., '1px solid #ddd')
4. Search box shadow (often none or subtle)
5. Search focus state styling"
```

**Apply extracted values:**

```scss
.hero {
  background-color: [extracted-hero-bg];
  // If gradient: background: [extracted-gradient];

  h1, h2 {
    color: [extracted-hero-text];
    font-weight: [extracted-heading-weight];
  }

  .search {
    border: [extracted-search-border];
    border-radius: [extracted-search-radius];
    box-shadow: [extracted-search-shadow];

    &:focus-within {
      border-color: [extracted-focus-color];
      box-shadow: [extracted-focus-ring];
    }
  }
}
```

**Files to update:**
- `_hero.scss` - Hero section styling
- `_search.scss` - Search box styling

---

### Buttons

**Extract these values:**
```
"Analyze button styling:
1. Border-radius (4px for square, 8px for rounded, 9999px for pill)
2. Border width and color
3. Background color (primary and secondary)
4. Text color
5. Padding
6. Hover effects (color change? shadow? transform?)"
```

**Apply extracted values:**

```scss
.button {
  border: [extracted-button-border];
  border-radius: [extracted-button-radius];
  background-color: [extracted-button-bg];
  color: [extracted-button-text];
  padding: [extracted-button-padding];
  font-size: [extracted-button-font-size];
  font-weight: [extracted-button-weight];
  box-shadow: [extracted-button-shadow];

  &:hover {
    background-color: [extracted-button-hover-bg];
    color: [extracted-button-hover-text];
    // Only include transform if target uses it
  }
}

.button-primary {
  background-color: [extracted-primary-bg];
  color: [extracted-primary-text];

  &:hover {
    background-color: [extracted-primary-hover-bg];
  }
}
```

**Files to update:**
- `_buttons.scss` - All button styles

---

### Forms/Inputs

**Extract these values:**
```
"Analyze form input styling:
1. Border-radius (usually 4px)
2. Border color and width
3. Background color
4. Focus state (border color, ring/shadow)
5. Padding"
```

**Apply extracted values:**

```scss
.form-field input {
  border: [extracted-input-border];
  border-radius: [extracted-input-radius];
  padding: [extracted-input-padding];
  box-shadow: [extracted-input-shadow];

  &:focus {
    border-color: [extracted-focus-border];
    outline: none;
    box-shadow: [extracted-focus-ring];
  }
}
```

**Files to update:**
- `_forms.scss` - Form field styling
- `_search.scss` - Search input (may differ from forms)

---

### Breadcrumbs

**Extract these values:**
```
"Analyze breadcrumb styling:
1. Separator character (/, >, chevron icon)
2. Text color
3. Link hover color
4. Background (often transparent)"
```

**Apply extracted values:**

```scss
.breadcrumbs {
  background-color: [extracted-breadcrumb-bg];  // Often transparent
  padding: [extracted-breadcrumb-padding];

  li {
    color: [extracted-breadcrumb-text];

    + li::before {
      content: "[extracted-separator]";  // "/" or ">" or chevron
      color: [extracted-separator-color];
    }

    a {
      color: [extracted-breadcrumb-link];

      &:hover {
        color: [extracted-breadcrumb-hover];
      }
    }

    &:last-child {
      color: [extracted-breadcrumb-current];
    }
  }
}
```

**Files to update:**
- `_breadcrumbs.scss`

---

### Search Results

**Extract these values:**
```
"Analyze search result cards:
1. Card border-radius
2. Card border or shadow
3. Highlight color for search matches
4. Hover effects"
```

**Files to update:**
- `_search_results.scss` - Result cards and generative answers section

---

### Article Body Content

**Extract these values:**
```
"Analyze article content styling:
1. Code block background and border
2. Code block border-radius (usually 6-8px)
3. Blockquote border and color
4. Table styling (borders, border-radius)
5. Image styling (border, border-radius)"
```

**Apply extracted values:**

```scss
@mixin content-body {
  :not(pre) > code {
    background: [extracted-code-bg];
    border: [extracted-code-border];
    border-radius: [extracted-code-radius];
    padding: [extracted-code-padding];
  }

  pre {
    background: [extracted-pre-bg];
    border: [extracted-pre-border];
    border-radius: [extracted-pre-radius];
    padding: [extracted-pre-padding];
  }

  blockquote {
    border-left: [extracted-blockquote-border];
    color: [extracted-blockquote-color];
    padding: [extracted-blockquote-padding];
  }

  table {
    border: [extracted-table-border];
    border-radius: [extracted-table-radius];

    th, td {
      padding: [extracted-cell-padding];
    }
  }

  img {
    border: [extracted-img-border];
    border-radius: [extracted-img-radius];
  }
}
```

**Files to update:**
- `_mixins.scss` - The `content-body` mixin

---

## CSS Best Practices

### Avoid Broad Structural Selectors

When styling optional or dynamic content, **never** use structural selectors that might match empty elements:

```scss
// ❌ AVOID - these can match empty/placeholder elements
> :first-child
> :last-child
> :nth-child(n)
> *:not(.specific-class)

// ✅ PREFER - specific class-based selectors
[class*="pattern"]
.specific-class-name
```

### Use Attribute Selectors for Dynamic Content

For content that may or may not exist (like AI answers, notifications, etc.):

```scss
// Target by class name pattern
[class*="generative-answer"] { }
[class*="notification"] { }

// Target by data attribute
[data-type="answer"] { }
```

### Test with Empty States

Always verify styling works correctly when:
- Content containers are empty
- Optional features are disabled
- API responses return no data

---

## Quick Style Extraction Checklist

When analyzing a target site, extract ALL of these:

```markdown
## Style Extraction Checklist

### Colors
- [ ] Header background
- [ ] Footer background
- [ ] Body background
- [ ] Primary text color
- [ ] Secondary/muted text color
- [ ] Link color and hover
- [ ] Accent/brand color

### Typography
- [ ] Font family
- [ ] Heading weights (H1, H2, H3)
- [ ] Body text weight

### Border Radius
- [ ] Cards (usually 8px or 16-24px)
- [ ] Buttons (4px, 8px, or pill)
- [ ] Inputs (4px or 8px)
- [ ] Search box (8px typical)
- [ ] Code blocks (6-8px)

### Borders & Shadows
- [ ] Card borders (`1px solid #ddd` or none)
- [ ] Card shadows (none, subtle, or heavy)
- [ ] Input borders
- [ ] Input focus ring style

### Hero Section
- [ ] Background (white, dark, gradient, image)
- [ ] Text color
- [ ] Search box style

### Buttons
- [ ] Primary style (filled)
- [ ] Secondary style (outline)
- [ ] Hover effects

### Spacing & Density
- [ ] Hero height and padding (compact vs airy)
- [ ] Section gaps (tight vs generous)
- [ ] Overall page density
```

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

### Spacing & Density
- Overall feel: [compact / moderate / airy]
- Hero: [tall with padding / compact]
- Section gaps: [tight / generous]

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
