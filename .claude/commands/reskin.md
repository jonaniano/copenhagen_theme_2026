# Theme Reskin Skill

Reskin a Zendesk Copenhagen Help Center theme to match a target website's visual identity.

## Usage

```
/reskin <command> [options]
```

**Commands:**
- `analyze <url>` - Extract design system from target website
- `apply` - Apply the full reskin based on analysis

---

# ═══════════════════════════════════════════════════════════════════════════════
# EXECUTION PROCEDURE - FOLLOW THESE STEPS IN ORDER
# ═══════════════════════════════════════════════════════════════════════════════

**CRITICAL:** This is a STRICT PROCEDURE, not reference documentation. Execute each step in order. DO NOT skip steps. DO NOT declare completion without passing ALL verification gates.

---

## STEP 1: ANALYSIS (Required First)

### 1.1 Fetch Target Site

```bash
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "<TARGET_URL>" > /tmp/target-site.html
```

If result is minimal (<1000 bytes), use WebFetch instead:
```
"Extract from this page: all hex colors, font families, logo SVG or URL, header structure, footer structure, button styles (colors, border-radius, padding)"
```

### 1.2 Extract Design Values

**You MUST document ALL of these before proceeding:**

```markdown
## Extracted Design System

### Colors
- Header BG: #______
- Footer BG: #______
- Primary text: #______
- Accent/CTA: #______
- Link color: #______

### Typography
- Font family: ______ → Google Font: ______
- Heading weight: ______ (usually 500-600, NOT 700-800)

### Components
- Button radius: ______px (4, 8, or 9999 for pill)
- Card radius: ______px (usually 8px for flat)
- Card shadow: ______ (often "none" or subtle)
- Card border: ______ (often "1px solid #ddd")

### Logo
- Type: SVG / Image URL / Text-only fallback
- Source: [paste SVG or URL here - NEVER fabricate]

### Footer Content (CRITICAL - Extract ALL Links)
- Column 1 title: ______ Links: ______
- Column 2 title: ______ Links: ______
- Column 3 title: ______ Links: ______
- Column 4 title: ______ Links: ______
- Social media: [platform] → [URL] for each
- Copyright text (exact): ______
- Legal/bottom links: ______

### Footer Typography (CRITICAL - Extract AND RESOLVE exact values)
- Footer background: #______
- Footer padding: ______rem (top/bottom)
- Column gap: ______rem
- Column title font size: ______rem = ______px (RESOLVE variables!)
- Column title font weight: ______ (400/500/600/700)
- Column title margin-bottom: ______rem
- Link font size: ______rem = ______px
- Link font weight: ______
- Link letter-spacing: ______em (often negative!)
- Link line-height: ______
- Item padding: top ______rem, bottom ______rem
- Hover effect: color change / underline / both?

**IMPORTANT:** If CSS uses variables like `var(--font-size--detail-m)`, you MUST trace them to actual values. Don't assume "detail" or "small" means small sizes!

**You MUST list every link text + URL AND resolved typography values. These will be used in template and SCSS.**
```

### 1.3 Extract Footer Structure

**CRITICAL:** Run this extraction for the footer. You will replicate the ENTIRE footer content.

#### Step A: Extract Footer Content via WebFetch
```
WebFetch: "Extract the COMPLETE footer from this page. I need EVERY link.

1. List ALL footer columns/sections with their titles
2. For EACH column, list EVERY link with exact text and full URL
3. List ALL social media icons with their platform URLs
4. What is the exact copyright text?
5. Is there a LOGO in the footer? If yes, describe it (SVG, image, position)
6. Are there any other elements (legal links, language selector)?

Format as:
COLUMN: [Title]
- [Link Text] → [URL]

SOCIAL:
- [Platform] → [URL]

BOTTOM:
- Copyright: [exact text]
- Logo: [yes/no, description]
"
```

#### Step B: Extract Footer Class Names
```bash
curl -s "<TARGET_URL>" | grep -oE 'class="[^"]*footer[^"]*"' | sort | uniq
```
This reveals the actual HTML structure (e.g., `footer_grid_logo`, `footer_group_title`).

#### Step C: Extract Logo SVG (if present)
```bash
curl -s "<TARGET_URL>" | grep -oE '<svg[^>]*footer[^>]*>.*?</svg>' | head -1
# Or search near footer classes:
curl -s "<TARGET_URL>" | grep -oE 'footer[^<]*<svg[^>]*>.*?</svg>' | head -1
```

#### Step D: Extract Actual CSS (CRITICAL for accurate styling)
```bash
# Find the CSS file
curl -s "<TARGET_URL>" | grep -oE 'href="[^"]*\.css[^"]*"' | head -3

# Extract footer-specific styles from CSS file
curl -s "<CSS_FILE_URL>" | grep -oE '\.footer_[a-z_]+[^}]+\}' | head -40
```

#### Step E: Resolve CSS Variables (CRITICAL - Don't Skip!)
The CSS will likely use variables like `var(--spacing--4)`. You MUST resolve these:

```bash
# Extract typography variables
curl -s "<CSS_FILE_URL>" | grep -oE '\-\-_typography[^:]+:[^;]+' | head -30

# Extract spacing variables
curl -s "<CSS_FILE_URL>" | grep -oE '\-\-_spacing[^:]+:[^;]+' | head -20

# Extract size variables (these define the actual values)
curl -s "<CSS_FILE_URL>" | grep -oE '\-\-size[^:]+:[^;]+' | head -20
```

**Common variable patterns:**
- `--size--1rem` = 16px
- `--size--0-75rem` = 12px
- `--spacing--space--4` often = `var(--size--1rem)` = 16px
- `--typography---font-size--detail-m` often = 16px (NOT 12px!)

**IMPORTANT:** Don't assume small names mean small sizes. Always trace:
1. Class uses `font-size: var(--text-style--font-size)`
2. Which equals `var(--typography--font-size--detail-m)`
3. Which equals `var(--size--1rem)`
4. Which equals `16px`

**Document the RESOLVED values** (in px or rem), not just variable names.

### 1.4 Verify Logo Extraction

**MANDATORY:** The logo MUST be extracted, not fabricated.

Try these in order:
```bash
# SVG with aria-label
grep -oE '<svg[^>]*aria-label[^>]*>.*?</svg>' /tmp/target-site.html | head -1

# SVG with logo class
grep -oE '<svg[^>]*logo[^"]*>.*?</svg>' /tmp/target-site.html | head -1

# Image logo URL
grep -oE 'src="[^"]*logo[^"]*\.(svg|png|webp)"' /tmp/target-site.html | head -3
```

**If ALL extraction methods fail:** ASK THE USER for logo. NEVER create your own.

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 1: Analysis Complete
## ══════════════════════════════════════════════════════════════════════════════

**DO NOT PROCEED** until you have documented:
- [ ] Header background color (exact hex)
- [ ] Footer background color (exact hex)
- [ ] Accent/CTA color (exact hex)
- [ ] Font family identified
- [ ] Heading font weight identified
- [ ] Button border-radius (exact px)
- [ ] Card border-radius (exact px)
- [ ] Card shadow/border style identified
- [ ] Logo extracted OR user asked for help
- [ ] Footer columns identified with titles
- [ ] **ALL footer links extracted** (every link text + URL in each column)
- [ ] Social media platforms and URLs extracted
- [ ] Copyright text extracted (exact)
- [ ] **Footer typography extracted** (title/link font size and weight)

---

## STEP 2: TOKENS & FONTS

### 2.1 Update manifest.json

Update these color settings with extracted values:
- `brand_color`
- `brand_text_color`
- `link_color`
- `heading_font`
- `text_font`

### 2.2 Load Google Font

Edit `templates/document_head.hbs` - add before closing `</head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=[FONT]:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 2.3 Update Token Values

Edit `styles/_tokens.scss`:
- Set `--radius-lg` and below to extracted card radius (usually 8px for flat)
- Set shadow values to extracted values (often subtle or none for flat)

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 2: Build Validation
## ══════════════════════════════════════════════════════════════════════════════

```bash
yarn build
```

**DO NOT PROCEED** if build fails. Fix any errors first.

---

## STEP 3: TEMPLATES

### 3.1 Read Existing Templates First

```bash
# MANDATORY: Read before modifying
cat templates/header.hbs
cat templates/footer.hbs
```

### 3.2 Update Header

**PRESERVE these elements (DO NOT remove):**
- Skip navigation link: `{{t 'skip_navigation'}}`
- User nav conditional: `{{#if signed_in}}...{{/if}}`
- Mobile toggle button
- Dropdown structure for signed-in users

**CAN MODIFY:**
- Logo (replace with extracted logo)
- Main navigation items
- CTA button text/styling
- Wrapper classes for styling

### 3.3 Update Footer (COPY Target Structure)

**CRITICAL:** The footer template MUST be rewritten to match the target site's footer structure. This is NOT optional styling - you must copy the actual content and layout.

**Steps:**
1. Review the footer structure extracted in Step 1.3
2. Rewrite `templates/footer.hbs` to match that structure
3. Include these elements from the target:
   - Brand/company link to main site
   - Social media icons with correct URLs (use SVGs from reference section)
   - Exact copyright text (hardcode year - `{{current_year}}` doesn't exist)
   - Column structure if applicable

**Adaptation rules:**
- External links to target site are expected - include them all
- Use `{{link 'help_center'}}` ONLY for help center specific links
- Social icons: Use SVG icons from the Reference section at bottom of this file
- Hardcode the year in copyright ({{current_year}} doesn't exist)

**Example multi-column footer (use this pattern):**
```handlebars
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-columns">
      <div class="footer-column">
        <h4 class="footer-column-title">Products</h4>
        <ul class="footer-column-links">
          <li><a href="https://targetsite.com/product-1">Product 1</a></li>
          <li><a href="https://targetsite.com/product-2">Product 2</a></li>
          <li><a href="https://targetsite.com/pricing">Pricing</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-column-title">Company</h4>
        <ul class="footer-column-links">
          <li><a href="https://targetsite.com/about">About</a></li>
          <li><a href="https://targetsite.com/careers">Careers</a></li>
          <li><a href="https://targetsite.com/news">News</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-column-title">Resources</h4>
        <ul class="footer-column-links">
          <li><a href="https://targetsite.com/docs">Documentation</a></li>
          <li>{{#link 'help_center'}}Support{{/link}}</li>
          <li>{{#link 'community'}}Community{{/link}}</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-social">
        <a href="https://twitter.com/company" aria-label="Twitter" target="_blank" rel="noopener">
          <!-- Twitter SVG -->
        </a>
        <a href="https://linkedin.com/company/company" aria-label="LinkedIn" target="_blank" rel="noopener">
          <!-- LinkedIn SVG -->
        </a>
      </div>
      <div class="footer-legal">
        <span class="footer-copyright">© 2025 Company Name</span>
        <a href="https://targetsite.com/privacy">Privacy</a>
        <a href="https://targetsite.com/terms">Terms</a>
      </div>
      <div class="footer-language-selector">
        {{#with help_center.language}}
          <span class="dropdown">
            <span class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
              {{name}}
              <span class="dropdown-caret"></span>
            </span>
            {{#if ../help_center.alternate_locales}}
              <ul class="dropdown-menu dropdown-menu-end" role="menu">
                {{#each ../help_center.alternate_locales}}
                  <li role="menuitem"><a href="{{url}}">{{name}}</a></li>
                {{/each}}
              </ul>
            {{/if}}
          </span>
        {{/with}}
      </div>
    </div>
  </div>
</footer>
```

**IMPORTANT:** Replace the example links above with the ACTUAL links extracted in Step 1.3. Every link from the target footer should appear in the template.

**Verification:** After writing footer.hbs, count your links vs target:
- Target footer link count: ____
- Your template link count: ____
- If different, go back and add missing links

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 3: Template Validation
## ══════════════════════════════════════════════════════════════════════════════

```bash
yarn build
```

**DO NOT PROCEED** if you see 400 errors. Common causes:
- `{{t 'global_navigation'}}` - doesn't exist, use hardcoded string
- `{{current_year}}` - doesn't exist, hardcode the year
- Broken Handlebars syntax

---

## STEP 4: SCSS STYLING (15-20 FILES)

**CRITICAL:** This step requires updating 15-20 SCSS files. Updating only 2-3 files is INCOMPLETE.

### 4.1 Header & Footer SCSS

Edit `styles/_header.scss`:
- Set header background to extracted color
- Set nav link colors and hover effects
- Style CTA button

Edit `styles/_footer.scss`:
- Set footer background to extracted color
- Set link colors and hover effects

### 4.2 Hero & Search

Edit `styles/_hero.scss`:
- Set background color
- Set text colors
- Adjust heading weights to extracted value
- Remove gradient `::after` if target doesn't have one

Edit `styles/_search.scss`:
- Set border-radius to extracted value (usually 8px)
- Set border and shadow to match target

### 4.3 Typography (ALL FILES)

**MANDATORY:** Run this command and fix EVERY result:

```bash
grep -rn "font-weight.*extrabold\|font-weight.*bold" styles/*.scss | grep -E "title|h1|h2|h3" | grep -v "//"
```

**Expected result after fixes: 0 matches for extrabold/bold headings**

Files to update:
- `_base.scss` - h1, h2, h3 weights
- `_hero.scss` - .hero h1, h2 weights
- `_article.scss` - .article-title weight
- `_section.scss` - .page-header h1 weight
- `_home-page.scss` - section heading weights
- `_blocks.scss` - .blocks-item-title weight
- `_category.scss` - .section-tree-title weight
- `_recent-activity.scss` - heading weights

### 4.4 Cards & Containers (ALL FILES)

**MANDATORY:** Run this command and fix EVERY result:

```bash
grep -rn "shadow-lg\|shadow-xl\|radius-xl\|radius-2xl" styles/*.scss | grep -v "//"
```

**Expected result after fixes: 0 matches** (or only in _tokens.scss definitions)

Files to update with flat styling:
- `_blocks.scss` - home page category cards
- `_category.scss` - section tree cards
- `_section.scss` - section list items, sub-nav
- `_article.scss` - article containers, votes, related
- `_recent-activity.scss` - activity cards
- `_search_results.scss` - result cards

**For each card component:**
```scss
// REMOVE or reduce these:
box-shadow: var(--shadow-lg);     // → none or shadow-sm
border-radius: var(--radius-xl);  // → radius-md (8px)
transform: translateY(-4px);      // → remove

// ADD if target uses borders:
border: 1px solid var(--color-border-default);
```

### 4.5 Buttons (ALL FILES)

**MANDATORY:** Run this command and fix EVERY result:

```bash
grep -rn "radius-full\|9999px" styles/*.scss | grep -v "//"
```

**Expected result after fixes:** Only matches where target actually uses pill shapes (usually 0 for flat sites)

Files to update:
- `_buttons.scss` - main button styles
- `_home-page.scss` - .community-link CTA
- `_header.scss` - header CTA
- `_recent-activity.scss` - controls links
- `_section.scss` - see-all trigger

### 4.6 Remove Decorative Elements (if target doesn't have them)

**MANDATORY:** Run this command:

```bash
grep -rn "::before\|::after" styles/*.scss | grep -E "height:\s*[24]px|width:\s*[46]0px" | grep -v "//"
```

These are accent bars/underlines. DELETE the entire `&::before` or `&::after` blocks if target doesn't have decorations.

### 4.7 Home Page Sections (CRITICAL - Often Missed)

**These sections have their own backgrounds and spacing that MUST be updated:**

Edit `styles/_hero.scss`:
- Adjust hero `min-height` and `padding` to match target spacing
- **Typical flat site values:** `min-height: 180px`, `padding: space-8` (mobile), `space-10` (tablet)
- Remove any gradient overlays (`::after` with radial-gradient)

Edit `styles/_home-page.scss`:
- **Reduce section margins** - Copenhagen defaults are too large for most sites:
  - `.section` margin-bottom: `space-16` → `space-10` (tablet), `space-12` → `space-8` (mobile)
  - `.home-section h2` margin-bottom: `space-8` → `space-6`
- Update `.community` section:
  - Padding: `space-14` → `space-8` (typically)
  - Remove transform effects on CTA button
- Update `.activity` padding: `space-10` → `space-6`

Edit `styles/_recent-activity.scss`:
- Reduce container padding: `space-8` → `space-6`
- Reduce header margin: `space-6` → `space-4`
- Reduce controls padding-top: `space-8` → `space-4`
- Remove gradients and decorative `::before`/`::after` elements
- Simplify item cards (border instead of shadow)

**Spacing rule of thumb:** If Copenhagen uses `space-12` to `space-16`, most modern sites use `space-8` to `space-10`.

**Quick check for remaining gradients/decorations:**
```bash
grep -rn "linear-gradient\|radial-gradient" styles/_hero.scss styles/_home-page.scss styles/_recent-activity.scss | grep -v "//"
```

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 4: SCSS Verification (MANDATORY)
## ══════════════════════════════════════════════════════════════════════════════

**Run ALL FOUR verification commands. Each should return 0 (or near-0) matches:**

```bash
# Heavy shadows/radius - should return 0 outside _tokens.scss
grep -rn "shadow-lg\|shadow-xl\|radius-xl\|radius-2xl" styles/*.scss | grep -v "_tokens.scss" | grep -v "//" | wc -l
```
**Expected: 0** (If not 0, you missed files. Go back to 4.4)

```bash
# Pill shapes - should return 0 for flat sites
grep -rn "radius-full\|9999px" styles/*.scss | grep -v "//" | wc -l
```
**Expected: 0 for flat sites, or only in intentional places**

```bash
# Heavy heading weights - should return 0
grep -rn "font-weight.*extrabold" styles/*.scss | grep -v "//" | wc -l
```
**Expected: 0**

```bash
# Gradients in home page sections - should return 0 for flat sites
grep -rn "linear-gradient\|radial-gradient" styles/_hero.scss styles/_home-page.scss styles/_recent-activity.scss | grep -v "//" | wc -l
```
**Expected: 0 for flat sites** (If not 0, remove gradient backgrounds in 4.7)

**DO NOT PROCEED** until all four commands return expected values.

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 5: Final Build
## ══════════════════════════════════════════════════════════════════════════════

```bash
yarn build
```

**DO NOT PROCEED** if build fails.

---

## STEP 5: START PREVIEW

```bash
# Kill existing preview
lsof -ti :4567 | xargs kill -9 2>/dev/null || true
sleep 1

# Start preview
zcli themes:preview
```

Tell the user: **"Preview running at http://localhost:4567 - please compare with [TARGET_URL] and let me know what needs adjustment."**

---

## ══════════════════════════════════════════════════════════════════════════════
## COMPLETION CHECKLIST
## ══════════════════════════════════════════════════════════════════════════════

**A reskin is COMPLETE only when ALL boxes are checked:**

### Files Modified (Minimum 15)
- [ ] `manifest.json` - colors and fonts
- [ ] `document_head.hbs` - Google Font loaded
- [ ] `header.hbs` - logo and structure
- [ ] `footer.hbs` - **REWRITTEN** to match target footer (links, social icons, copyright)
- [ ] `_tokens.scss` - radius and shadow values
- [ ] `_base.scss` - heading weights
- [ ] `_header.scss` - header styling
- [ ] `_footer.scss` - footer styling (must match new footer.hbs structure)
- [ ] `_hero.scss` - hero background, spacing, and search area
- [ ] `_search.scss` - search box styling
- [ ] `_buttons.scss` - button styling
- [ ] `_blocks.scss` - home page cards
- [ ] `_category.scss` - category page cards
- [ ] `_section.scss` - section page styling
- [ ] `_article.scss` - article page styling
- [ ] `_recent-activity.scss` - activity section background and cards
- [ ] `_home-page.scss` - community section and spacing

### Footer Content (CRITICAL - Must Match Target)
- [ ] Footer template rewritten with multi-column structure (if target has columns)
- [ ] ALL navigation columns from target included with correct titles
- [ ] ALL links from each column included with correct text and URLs
- [ ] Social media icons match target (correct platforms and URLs)
- [ ] Copyright text matches target exactly
- [ ] Legal/policy links included (Privacy, Terms, etc.)
- [ ] Footer SCSS updated to style new structure (columns, spacing)
- [ ] **Footer typography matches** (font size and weight for titles/links)

**Footer Verification:**
- Count links: target vs template should match
- Check typography: font-size and font-weight should match extracted values

### Home Page Sections (Critical)
- [ ] Hero spacing reduced (typically space-8 padding, not space-10/12)
- [ ] Hero gradients/overlays removed if target is flat
- [ ] Section margins reduced (space-8 to space-10, not space-12 to space-16)
- [ ] Community section padding reduced (space-8, not space-14)
- [ ] Community CTA button styled correctly (no transforms)
- [ ] Activity section padding reduced (space-6, not space-10)
- [ ] Recent activity container padding reduced and gradients removed
- [ ] Recent activity cards styled (borders, no heavy shadows/accents)

### Verification Commands Passed
- [ ] Heavy shadow/radius grep returns 0 (outside _tokens.scss)
- [ ] Pill radius grep returns 0 (for flat sites)
- [ ] Extrabold heading grep returns 0
- [ ] Gradients grep returns 0 for flat sites
- [ ] `yarn build` passes

### Quality Checks
- [ ] Logo is EXTRACTED (not fabricated)
- [ ] Header user-nav structure preserved
- [ ] Footer uses Zendesk helpers for HC links
- [ ] Preview server is running

---

# ═══════════════════════════════════════════════════════════════════════════════
# REFERENCE MATERIAL
# ═══════════════════════════════════════════════════════════════════════════════

The sections below contain detailed reference information. Consult as needed during execution.

---

## Prerequisites

### Zendesk CLI (zcli)

```bash
npm install -g @zendesk/zcli
zcli login -i
```

### Reset to Clean Copenhagen Base

```bash
cp -r .claude /tmp/claude-skill-backup
git checkout copenhagen2026/master -- .
cp -r /tmp/claude-skill-backup/* .claude/
yarn install && yarn build
```

---

## Multi-Strategy Extraction

### Strategy 1: Direct curl

```bash
# Extract hex colors
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '#[0-9a-fA-F]{6}' | sort | uniq -c | sort -rn | head -20

# Find logo SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>' | head -1

# Extract navigation links
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'href="https://[^"]*"' | sort | uniq | head -30
```

### Strategy 2: WebFetch (for JS-heavy sites)

```
"Extract the following from this page:
1. All colors used (exact hex values)
2. The logo (describe it or extract SVG path)
3. Header navigation items and their URLs
4. Footer structure
5. Font families used
6. Button styles (colors, border-radius, padding)"
```

### Strategy 3: Framework Detection

```bash
# Tailwind CSS
curl -s "<url>" | grep -oE "bg-[a-z]+-[0-9]+" | sort | uniq -c | sort -rn | head -15

# Check for Next.js
curl -s "<url>" | grep -E '__next|data-reactroot' | head -5
```

### Tailwind Class → Hex Reference

| Class | Hex |
|-------|-----|
| `bg-black` | `#000000` |
| `bg-white` | `#FFFFFF` |
| `bg-slate-900` | `#0f172a` |
| `bg-gray-900` | `#111827` |

### Border Radius Reference

| Class | Value |
|-------|-------|
| `rounded-md` | `6px` |
| `rounded-lg` | `8px` |
| `rounded-xl` | `12px` |
| `rounded-full` | `9999px` |

---

## Logo Extraction Reference

### Extraction Commands

```bash
# aria-label SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>' | head -1

# Logo class SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*class="[^"]*logo[^"]*"[^>]*>.*?</svg>' | head -1

# Image logo URL
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'src="[^"]*logo[^"]*\.(svg|png|webp|jpg)"' | head -3

# Brand/press page
curl -s -A "Mozilla/5.0..." "<url>/press"
curl -s -A "Mozilla/5.0..." "<url>/brand"
```

### Logo Implementation

**For SVG logos:**
```handlebars
{{#link 'help_center' class='logo-link'}}
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

**NEVER fabricate logos. If extraction fails, ask the user.**

---

## Template Reference

### Valid Zendesk Helpers

- `{{t 'skip_navigation'}}`, `{{t 'user_navigation'}}`, `{{t 'toggle_navigation'}}`
- `{{t 'sign_in'}}`, `{{t 'profile'}}`, `{{t 'activities'}}`
- `{{link 'help_center'}}`, `{{link 'community'}}`, `{{link 'new_request'}}`
- `{{link 'sign_in'}}`, `{{link 'sign_out'}}`, `{{link 'requests'}}`

### INVALID Helpers (Will Cause 400 Errors)

- `{{t 'global_navigation'}}` - Does not exist
- `{{current_year}}` - Does not exist
- Any custom translation keys

### Header Structure to Preserve

```handlebars
{{!-- MUST PRESERVE --}}
<a class="skip-navigation" tabindex="1" href="#main-content">{{t 'skip_navigation'}}</a>

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

<button type="button" class="header-nav-toggle" aria-label="{{t 'toggle_navigation'}}" aria-expanded="false">
```

### Footer Pattern (Multi-Column with Full Content)

```handlebars
<footer class="footer">
  <div class="footer-inner">
    {{!-- Navigation columns - replicate ALL columns from target --}}
    <div class="footer-columns">
      <div class="footer-column">
        <h4 class="footer-column-title">Products</h4>
        <ul class="footer-column-links">
          {{!-- Include EVERY link from target's Products column --}}
          <li><a href="https://targetsite.com/product-a">Product A</a></li>
          <li><a href="https://targetsite.com/product-b">Product B</a></li>
          <li><a href="https://targetsite.com/enterprise">Enterprise</a></li>
          <li><a href="https://targetsite.com/api">API</a></li>
          <li><a href="https://targetsite.com/pricing">Pricing</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-column-title">Resources</h4>
        <ul class="footer-column-links">
          <li><a href="https://targetsite.com/docs">Documentation</a></li>
          <li><a href="https://targetsite.com/blog">Blog</a></li>
          <li>{{#link 'help_center'}}Support{{/link}}</li>
          <li>{{#link 'community'}}Community{{/link}}</li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-column-title">Company</h4>
        <ul class="footer-column-links">
          <li><a href="https://targetsite.com/about">About</a></li>
          <li><a href="https://targetsite.com/careers">Careers</a></li>
          <li><a href="https://targetsite.com/news">News</a></li>
          <li><a href="https://targetsite.com/contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4 class="footer-column-title">Legal</h4>
        <ul class="footer-column-links">
          <li><a href="https://targetsite.com/privacy">Privacy Policy</a></li>
          <li><a href="https://targetsite.com/terms">Terms of Service</a></li>
          <li><a href="https://targetsite.com/security">Security</a></li>
        </ul>
      </div>
    </div>

    {{!-- Bottom section with social, copyright, language --}}
    <div class="footer-bottom">
      <div class="footer-social">
        <a href="https://twitter.com/company" aria-label="Twitter" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><!-- X icon --></svg>
        </a>
        <a href="https://linkedin.com/company/company" aria-label="LinkedIn" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><!-- LinkedIn icon --></svg>
        </a>
        <a href="https://github.com/company" aria-label="GitHub" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><!-- GitHub icon --></svg>
        </a>
      </div>
      <div class="footer-copyright">&copy; 2025 Company Name. All rights reserved.</div>
      <div class="footer-language-selector">
        {{#with help_center.language}}
          <span class="dropdown">
            <span class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
              {{name}}<span class="dropdown-caret"></span>
            </span>
            {{#if ../help_center.alternate_locales}}
              <ul class="dropdown-menu dropdown-menu-end" role="menu">
                {{#each ../help_center.alternate_locales}}
                  <li role="menuitem"><a href="{{url}}">{{name}}</a></li>
                {{/each}}
              </ul>
            {{/if}}
          </span>
        {{/with}}
      </div>
    </div>
  </div>
</footer>
```

**Key points:**
- Replicate ALL columns from target footer
- Include EVERY link from each column (not just 1-2 examples)
- External links to main site are expected and correct
- Only use Zendesk helpers ({{link}}) for actual help center pages

---

## Font Resolution Reference

| Proprietary | Google Font Alternative |
|-------------|------------------------|
| Graphik, Söhne, SF Pro | Inter |
| Vanilla Sans, GT Walsheim | DM Sans |
| Circular, Avenir | Nunito Sans |
| Proxima Nova, Gotham | Montserrat / Poppins |
| (any unknown) | Inter |

---

## SCSS Patterns Reference

### Flat Card Styling (most modern sites)

```scss
.card-component {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;  // NOT radius-xl
  box-shadow: none;    // NOT shadow-lg

  &:hover {
    border-color: var(--color-border-emphasis);
    // NO transform: translateY()
  }
}
```

### Flat Button Styling

```scss
.button {
  border-radius: 8px;  // NOT radius-full/9999px
  box-shadow: none;

  &:hover {
    // NO transform: translateY()
  }
}
```

### Removing Decorative Elements

```scss
// DELETE these accent bar blocks:
&::before {
  content: "";
  position: absolute;
  height: 4px;
  background: var(--color-interactive);
  // DELETE ENTIRE BLOCK
}

&::after {
  content: "";
  width: 40px;
  height: 2px;
  background: var(--color-interactive);
  // DELETE ENTIRE BLOCK
}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| curl returns empty | Use WebFetch |
| Logo jumbled | Verify viewBox matches paths |
| 400 template error | Check for invalid helpers |
| Fonts not applied | Update manifest.json font values |
| Colors don't match | Re-extract exact hex values |
| Headings too bold | Update ALL files (see 4.3) |
| Cards too elevated | Update ALL files (see 4.4) |
| Buttons too rounded | Update ALL files (see 4.5) |
| Search double border | Style `.search` wrapper only |
| Wrong help center links | Use Zendesk helpers |
| Font size wrong | Resolve CSS variables! `detail-m` often = 16px, not 12px |
| Spacing too tight | Trace `space--4` etc to actual rem/px values |
| Footer looks cramped | Check padding (often 5rem), gaps (often 2-3rem) |

---

## Incomplete Reskin Warning Signs

If ANY of these are true, the reskin is NOT complete:

1. **Only `_base.scss` was updated for typography** → INCOMPLETE
   - Component files override base styles - they MUST be updated too

2. **Logo was created/fabricated instead of extracted** → INCOMPLETE
   - Go back and extract the actual logo or ask the user

3. **Header structure was rewritten from scratch** → LIKELY BROKEN
   - Should have modified existing structure, not replaced it

4. **Card styles were not touched** → INCOMPLETE
   - Cards are a major visual element across all pages

5. **Only one button file was updated** → INCOMPLETE
   - Buttons exist in multiple component files

6. **Spacing was not adjusted** → POTENTIALLY INCOMPLETE
   - Compare hero height and section gaps to target

---

## Files That Define Heading Weights

| File | Element | Copenhagen Default | Modern Sites |
|------|---------|-------------------|--------------|
| `_base.scss` | h1, h2 | extrabold/bold (800/700) | medium (500) |
| `_hero.scss` | .hero h1, h2 | extrabold | medium |
| `_article.scss` | .article-title | extrabold | medium |
| `_section.scss` | .page-header h1 | extrabold | medium |
| `_home-page.scss` | .home-section h2, .community h2 | bold/extrabold | medium |
| `_recent-activity.scss` | h2 | extrabold | medium |
| `_blocks.scss` | .blocks-item-title | bold | medium |
| `_category.scss` | .section-tree-title | bold | medium |

**Quick search:**
```bash
grep -rn "font-weight.*extrabold\|font-weight.*bold" styles/*.scss | grep -i "title\|h1\|h2"
```

---

## Common Header Mistakes to AVOID

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
```

---

## Visual Verification Checklist

Open target site and preview side-by-side. Check each item:

### Header
- [ ] Background color matches exactly
- [ ] Logo size and position match
- [ ] Nav link colors match
- [ ] Nav hover effects match (underline? color change? background?)
- [ ] CTA button matches (color, shape, size)

### Footer
- [ ] Background color matches exactly
- [ ] Text colors match (headings, links, copyright)
- [ ] Link hover effects work
- [ ] Column structure similar

### Typography
- [ ] Font looks similar (same family or close alternative)
- [ ] Page heading weights match (H1, H2 - usually medium/500)
- [ ] Card title weights match (home page cards, category cards)
- [ ] Body text weight looks correct

### Cards & Containers
- [ ] Card border-radius matches (flat: 8px, elevated: 16-24px)
- [ ] Card shadows match (flat: none/subtle, elevated: heavy)
- [ ] Card borders match (flat: 1px solid #ddd, elevated: none)
- [ ] Card hover effects match (flat: subtle, elevated: lift)
- [ ] No unwanted accent bars or decorations

### Buttons
- [ ] Button border-radius matches (flat: 4-8px, pill: 9999px)
- [ ] Button colors match
- [ ] Button hover effects match

### Spacing
- [ ] Hero height similar
- [ ] Section gaps similar
- [ ] Overall density matches (compact vs airy)

---

## Iterative Refinement Quick Fixes

| Issue | Fix |
|-------|-----|
| Logo too small | Add `transform: scale(1.15)` to `.company-logo` |
| Logo too large | Reduce scale or set explicit width/height |
| Logo misaligned vertically | Adjust `margin-top` (negative moves up) |
| Colors slightly off | Re-extract exact hex values with WebFetch |
| Wrong hover effect | Re-extract and identify effect type (underline, opacity, background) |
| Headings too bold | Check ALL files in heading weights table above |
| Cards too elevated | Remove shadows, add borders, reduce radius |
| Too much whitespace | Reduce hero padding, section margins |

---

## Social Media Icon SVGs

```html
<!-- Twitter/X -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
</svg>

<!-- LinkedIn -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
</svg>

<!-- GitHub -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
</svg>

<!-- YouTube -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
</svg>
```
