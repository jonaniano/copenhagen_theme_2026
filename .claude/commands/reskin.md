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

### 1.0 Visual Structure Analysis (CRITICAL - DO THIS FIRST!)

Before extracting tokens, understand the site's VISUAL STRUCTURE and classify its type.

**Run this WebFetch prompt:**
```
"Describe the visual structure of this help center/support page:

1. HEADER:
   - How many navigation items are visible? (0, 1-3, 4+)
   - Is there just a logo, or full navigation with multiple links?
   - Does the logo link to main company site or help center home?
   - Any CTA button in header?

2. ALERT/BANNERS:
   - Is there an announcement/alert bar at the top? What color background?
   - Position: above header or below?

3. HERO SECTION:
   - Background: solid color, gradient, or image?
   - What color is the background?
   - Height: short (<200px), medium (200-300px), tall (>300px)?

4. CUSTOM SECTIONS (not standard help center elements):
   - Is there a 'Still have questions?' or 'Need help?' callout section?
   - Quick action cards or links?
   - Any promotional or announcement sections?

5. FOOTER:
   - Background color: LIGHT (white/gray) or DARK (black/navy/brand color)?
   - If dark, what's the approximate color?
   - How many columns?
   - Are there social media icons?

6. OVERALL FEEL:
   - Minimal/simple or feature-rich/complex?
   - Corporate/professional or casual/friendly?"
```

**Document structure:**
```markdown
## Site Structure Analysis

### Site Classification
- [ ] Type A: MINIMAL (logo-only header, simple layout, few sections)
- [ ] Type B: STANDARD (full nav, typical help center sections)
- [ ] Type C: CUSTOM (many unique sections, heavily branded)

### Header
- Navigation items: ______ (0-1 = logo only, 2-3 = minimal, 4+ = full)
- Logo links to: main site / help center
- CTA button present: yes / no

### Custom Sections Present
- [ ] Alert/announcement banner (color: #______)
- [ ] Request callout ("Still have questions?" etc.)
- [ ] Quick actions section
- [ ] Other: ______

### Footer
- Background: LIGHT / DARK
- If dark, color: #______
- Columns: ______
- Social icons: yes / no

### Implications
- Type A → SIMPLIFY header significantly, may need minimal nav
- Type B → Standard reskin approach
- Type C → Will need custom templates for unique sections
```

**CRITICAL:** If site is Type A (minimal), you MUST simplify the Copenhagen header. Do NOT keep full navigation if target has logo-only header!

---

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

### Colors (CRITICAL: These are often DIFFERENT - extract each separately!)

**Brand vs Link colors (OFTEN DIFFERENT!):**
- Brand/accent color: #______ (used on buttons, CTAs, backgrounds)
- Link color: #______ (text links - CHECK if different from brand!)
- Hover link color: #______
- Visited link color: #______ (often purple like #9358B0, NOT gray!)

**Text colors:**
- Primary text: #______
- Secondary/muted text: #______

**Section backgrounds:**
- Header BG: #______
- Hero BG: #______ (solid color? or image?)
- Page/content BG: #______

**Footer colors (CRITICAL - often inverted!):**
- Footer BG: #______ (LIGHT=#fff-#f5f5f5 or DARK=#333-#000?)
- Footer text: #______ (must contrast with footer bg!)
- Footer link: #______ (if dark footer, usually light/white)

**Verification - find actual link colors in CSS:**
```bash
curl -s "<CSS_URL>" | grep -oE '(^a |\.link|:link|:visited)[^}]+' | head -20
```

**WARNING:** Blue Bottle example of different colors:
- Brand: #17494D (teal) - used on buttons
- Links: #1F73B7 (blue) - used on text links
- Visited: #9358B0 (purple) - NOT gray!
If you use brand color for links, the reskin will look wrong!

### Typography
- Font family: ______ → Google Font: ______
- Heading weight: ______ (usually 500-600, NOT 700-800)

### Components
- Button radius: ______px (4, 8, or 9999 for pill)
- Card radius: ______px (usually 8px for flat)
- Card shadow: ______ (often "none" or subtle)
- Card border: ______ (often "1px solid #ddd")

### Card/Box Styling (CRITICAL - Often Missed!)
- Card background color: #______ (often SAME as page bg, NOT white!)
- Card border color: #______ or rgba(______)
- Card hover state: ______ (border-color change? subtle shadow? none?)
- Page background color: #______ (cards should usually match this)

### Search Bar Styling (CRITICAL - Often Missed!)
- Search bar background: #______ (often same as page bg)
- Search bar border: ______ (e.g., "1px solid rgba(0,0,0,0.15)")
- Search bar border-radius: ______px (often 8px for flat sites, NOT pill!)
- Search bar shadow: ______ (often "none" for flat sites)
- Search bar height: ______px (often 48-56px)

### Breadcrumbs Styling
- Breadcrumbs background: ______ (often "transparent" for flat sites)
- Breadcrumbs text color: #______
- Breadcrumbs separator style: ______ (/, >, →, etc.)

### Page Spacing (CRITICAL - Often Missed!)
- Hero padding: top ______px, bottom ______px (often 32-48px - COMPACT!)
- Hero min-height: ______px (often 180-220px - NOT tall)
- Section gap (between hero/content/footer): ______px (often 32-48px - TIGHT!)
- Container max-width: ______px

**NOTE:** Copenhagen's defaults are ALREADY spacious. Most reskins require REDUCING spacing, not increasing it!

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

### 1.4 Detect Custom Sections (NEW - CRITICAL!)

Many sites have custom sections NOT part of standard Copenhagen. You MUST identify these.

**Run these commands:**
```bash
# Find custom section classes
curl -s "<TARGET_URL>" | grep -oE 'class="[^"]*(callout|cta|action|banner|alert|quick|promo)[^"]*"' | sort | uniq

# Look for "Still have questions" or contact prompts
curl -s "<TARGET_URL>" | grep -i "still have\|need help\|contact us\|chat with\|email us"

# Find non-standard sections
curl -s "<TARGET_URL>" | grep -oE '<section[^>]*class="[^"]*"' | grep -v "hero\|categories\|blocks\|search" | head -10
```

**Document custom sections found:**
```markdown
## Custom Sections to Implement

### Alert/Announcement Banner
- Present: yes / no
- Background color: #______
- Text content: "______"
- Link URL: ______
- Position: above header / below header

### Request Callout (e.g., "Still have questions?")
- Present: yes / no
- Background color: #______
- Heading text: "______"
- Buttons/links: [ ] Chat [ ] Email [ ] Other: ______

### Quick Actions
- Present: yes / no
- Number of items: ______
- Items: ______

### Other Custom Sections
- ______
```

**CRITICAL:** If custom sections exist:
1. You MUST create new template partials for them
2. You MUST add corresponding SCSS
3. Standard Copenhagen templates won't have these - they need to be ADDED

---

### 1.5 Verify Logo Extraction

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

### Site Classification (from Step 1.0)
- [ ] Site type identified: A (minimal) / B (standard) / C (custom)
- [ ] Header nav count: ______ (0-1, 2-3, or 4+)
- [ ] If Type A: Plan to SIMPLIFY header

### Colors (VERIFY each is extracted separately!)
- [ ] Brand/accent color: #______ (buttons, CTAs)
- [ ] Link color: #______
- [ ] **Link color DIFFERENT from brand?** yes / no (if same, double-check!)
- [ ] Visited link color: #______ (often purple, NOT gray)
- [ ] Header background: #______
- [ ] Page background: #______

### Footer Background (CRITICAL!)
- [ ] Footer background: #______
- [ ] Footer is: LIGHT / DARK
- [ ] **If DARK footer:** Footer text color: #______ (must be light!)
- [ ] **If DARK footer:** Footer link color: #______ (must be light!)
- [ ] **If DARK footer:** Social icon color noted (usually white)

### Custom Sections (from Step 1.4)
- [ ] Alert banner: present / not present
- [ ] Request callout: present / not present
- [ ] Quick actions: present / not present
- [ ] If any present: Plan to CREATE custom templates

### Standard Checks
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

### Footer Typography (CRITICAL - Often Missed!)
- [ ] Column title font-size: ______px (RESOLVED, not variable name!)
- [ ] Column title font-weight: ______ (400/500/600)
- [ ] Column title letter-spacing: ______em
- [ ] Link font-size: ______px (RESOLVED!)
- [ ] Link font-weight: ______ (400/500)
- [ ] Link letter-spacing: ______em (often negative like -0.01em!)
- [ ] Link line-height: ______ (often 1.4-1.6)
- [ ] Link vertical padding/margin: ______px (space between links)
- [ ] Column gap: ______px (horizontal space between columns)
- [ ] Footer padding: ______px top/bottom

**WARNING:** CSS variables like `--font-size--detail-m` often resolve to 16px, NOT 12px! Always trace to actual values.

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

### 3.2 Update Header (MATCH TARGET STRUCTURE!)

**FIRST: Check your Site Classification from Step 1.0**

#### For Type A (MINIMAL) Sites - 0-2 nav items

If target has logo-only or minimal header, you MUST simplify Copenhagen:

```handlebars
<a class="skip-navigation" tabindex="1" href="#main-content">{{t 'skip_navigation'}}</a>

<div class="header-wrapper">
<header class="header">
  <div class="logo">
    {{!-- Logo links to MAIN SITE if that's what target does --}}
    <a href="https://maincompanysite.com">
      <img src="{{settings.logo}}" alt="Company Logo" />
    </a>
  </div>

  {{!-- Minimal nav - only sign-in/user dropdown --}}
  <div class="nav-wrapper-desktop">
    {{#unless signed_in}}
      {{#link "sign_in" class="sign-in"}}{{t 'sign_in'}}{{/link}}
    {{/unless}}
    {{#if signed_in}}
      <div class="user-info dropdown">
        <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
          {{user_avatar class="user-avatar"}}
        </button>
        <div class="dropdown-menu" role="menu">
          {{#my_profile role="menuitem"}}{{t 'profile'}}{{/my_profile}}
          {{link "requests" role="menuitem"}}
          {{link "sign_out" role="menuitem"}}
        </div>
      </div>
    {{/if}}
  </div>

  {{!-- Mobile menu also simplified --}}
  <div class="nav-wrapper-mobile">
    <button class="menu-button-mobile" aria-controls="user-nav-mobile" aria-expanded="false" aria-label="{{t 'toggle_navigation'}}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="icon-menu">
        <path fill="none" stroke="currentColor" stroke-linecap="round" d="M1.5 3.5h13m-13 4h13m-13 4h13"/>
      </svg>
    </button>
    <nav class="menu-list-mobile" id="user-nav-mobile" aria-expanded="false">
      <ul class="menu-list-mobile-items">
        {{#if signed_in}}
          <li class="item">{{link "requests"}}</li>
          <li class="item">{{link "sign_out"}}</li>
        {{else}}
          <li class="item">{{#link "sign_in"}}{{t 'sign_in'}}{{/link}}</li>
        {{/if}}
      </ul>
    </nav>
  </div>
</header>
</div>
```

**DO NOT keep community links, service catalog, etc. if target doesn't have them!**

---

#### For Type B/C (STANDARD/CUSTOM) Sites - 4+ nav items

Keep standard Copenhagen structure but update styling.

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

## ══════════════════════════════════════════════════════════════════════════════
## SCSS FILE TRACKER - MARK EACH FILE AS YOU UPDATE IT
## ══════════════════════════════════════════════════════════════════════════════

**Copy this tracker and check off EACH file as you edit it:**

```markdown
### SCSS Files Updated (MUST update ALL before Gate 4)

**Core tokens & base:**
- [ ] `_tokens.scss` - radius, shadows
- [ ] `_base.scss` - heading weights (h1-h6)

**Header & Footer:**
- [ ] `_header.scss` - header styling
- [ ] `_footer.scss` - footer styling (dark bg if needed!)

**Hero & Search:**
- [ ] `_hero.scss` - background, spacing, heading weights
- [ ] `_search.scss` - border-radius, shadows, colors

**Buttons:**
- [ ] `_buttons.scss` - radius, shadows, colors

**Cards & Containers (CRITICAL - often skipped!):**
- [ ] `_blocks.scss` - home page category cards
- [ ] `_category.scss` - category/section tree cards
- [ ] `_section.scss` - section page cards/containers
- [ ] `_article.scss` - article containers
- [ ] `_recent-activity.scss` - activity cards

**Page sections:**
- [ ] `_home-page.scss` - community section, spacing
- [ ] `_breadcrumbs.scss` - breadcrumb styling

**Count: ___/15 files updated**
```

**STOP! If fewer than 12 files are checked, you're not done with SCSS!**

---

### 4.1 Header & Footer SCSS

**IMPORTANT:** Use `Edit` tool to update specific values, NOT `Write` to replace entire files. Replacing files loses previous refinements!

Edit `styles/_header.scss`:
- Set header background to extracted color
- Set nav link colors and hover effects
- Style CTA button

### 4.1.1 Footer SCSS (CRITICAL - Detailed Updates Required)

**MANDATORY:** The footer requires updating MANY specific values. Do NOT just set background color!

Edit `styles/_footer.scss` with ALL of these extracted values:

```scss
// 1. CONTAINER - Background and padding
.footer {
  background-color: #191919;           // ← extracted footer bg
  padding: 80px 0 48px;                // ← extracted padding (often 4-5rem top, 2-3rem bottom)
}

// 2. COLUMN LAYOUT - Grid gap
.footer-columns {
  gap: 32px 24px;                      // ← extracted column gap (row gap, column gap)

  @include desktop {
    gap: 16px;                         // ← often tighter on desktop
  }
}

// 3. COLUMN TITLES - Font styling
.footer-column-title {
  font-size: 14px;                     // ← extracted title size (often 13-15px)
  font-weight: 500;                    // ← extracted weight (often 500-600)
  letter-spacing: -0.01em;             // ← extracted spacing (often negative!)
  margin-bottom: 16px;                 // ← extracted margin
  text-transform: none;                // ← check if uppercase on target
}

// 4. LINKS - Font styling (MOST COMMONLY MISSED!)
.footer-column-links {
  a {
    font-size: 14px;                   // ← extracted link size (often 13-15px)
    font-weight: 400;                  // ← extracted weight (usually 400)
    letter-spacing: -0.01em;           // ← extracted spacing (OFTEN NEGATIVE!)
    line-height: 1.5;                  // ← extracted line-height

    // Vertical spacing between links
    display: block;
    padding: 4px 0;                    // ← OR use margin-bottom on <li>
  }

  li {
    margin-bottom: 8px;                // ← extracted vertical spacing
  }
}

// 5. BOTTOM SECTION
.footer-bottom {
  padding-top: 32px;                   // ← extracted padding
  margin-top: 48px;                    // ← if separated from columns
}

// 6. COPYRIGHT
.footer-copyright {
  font-size: 13px;                     // ← often smaller than links
  letter-spacing: -0.01em;
}
```

**Common footer mistakes:**
- Using default `var(--font-size-sm)` instead of extracted px values
- Missing letter-spacing (many sites use negative values like -0.01em)
- Wrong vertical spacing between links (too tight or too loose)
- Forgetting to update column gap for responsive breakpoints

### 4.2 Hero & Search

Edit `styles/_hero.scss`:
- Set background color
- Set text colors
- Adjust heading weights to extracted value
- Remove gradient `::after` if target doesn't have one

Edit `styles/_search.scss`:
- Set border-radius to extracted value (usually 8px)
- Set border and shadow to match target

## ══════════════════════════════════════════════════════════════════════════════
## CHECKPOINT: Before Typography & Cards
## ══════════════════════════════════════════════════════════════════════════════

**STOP! Before proceeding, verify you've updated:**
- [ ] `_tokens.scss`
- [ ] `_header.scss`
- [ ] `_footer.scss`
- [ ] `_hero.scss`
- [ ] `_search.scss`
- [ ] `_buttons.scss`

**If any are unchecked, go back and update them NOW.**

The next sections (Typography & Cards) are the MOST COMMONLY SKIPPED parts of a reskin. They require updating MANY files. Do not rush through them!

---

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

## ══════════════════════════════════════════════════════════════════════════════
## CHECKPOINT: Typography Complete?
## ══════════════════════════════════════════════════════════════════════════════

**Run this command NOW:**
```bash
grep -rn "font-weight.*extrabold\|font-weight.*800" styles/*.scss | grep -v "//" | wc -l
```

**Expected: 0 (or very low for specific use cases)**

If the number is high (5+), you skipped typography updates. Go back to 4.3!

---

### 4.4 Cards & Containers (ALL FILES) - CRITICAL

**THIS SECTION IS FREQUENTLY SKIPPED - DO NOT SKIP IT!**

Cards appear on: home page, category pages, section pages, article pages, search results. If you don't update card styling, the reskin will look incomplete on EVERY page.

**MANDATORY:** Run these commands and fix EVERY result:

```bash
# Find heavy shadows/radius
grep -rn "shadow-lg\|shadow-xl\|radius-xl\|radius-2xl" styles/*.scss | grep -v "//"

# Find white/surface backgrounds on cards (should match page bg for flat sites)
grep -rn "background-color: var(--color-surface)" styles/_blocks.scss styles/_category.scss styles/_section.scss styles/_article.scss styles/_recent-activity.scss
```

**Expected result after fixes: 0 matches** (or only in _tokens.scss definitions)

Files to update with flat styling:
- `_blocks.scss` - home page category cards
- `_category.scss` - section tree cards
- `_section.scss` - section list items, sub-nav
- `_article.scss` - article containers, votes, related
- `_recent-activity.scss` - activity cards
- `_search_results.scss` - result cards

**For each card component, update ALL THREE properties:**
```scss
// 1. BACKGROUND - Use extracted card bg color (often SAME as page bg!)
//    For flat sites like Anthropic: cards blend into page, NOT white
background-color: #faf9f0;  // ← extracted card bg (NOT var(--color-surface)!)

// 2. BORDER - Add explicit border for flat sites
border: 1px solid rgba(0, 0, 0, 0.08);  // ← subtle border

// 3. SHADOW - Remove entirely for flat sites
box-shadow: none;  // ← NOT shadow-sm, but NONE

// 4. RADIUS - Use extracted value
border-radius: 8px;  // ← usually 8px for flat

// 5. HOVER - Subtle border change, NOT lift effect
&:hover {
  border-color: rgba(0, 0, 0, 0.15);  // ← subtle darkening
  // NO transform: translateY()
  // NO box-shadow on hover
}
```

**Common mistake:** Reducing shadows but leaving white backgrounds. For flat sites, cards should blend into the page background, not pop out with white backgrounds.

## ══════════════════════════════════════════════════════════════════════════════
## CHECKPOINT: Cards Complete?
## ══════════════════════════════════════════════════════════════════════════════

**Verify you edited EACH of these files for card styling:**
- [ ] `_blocks.scss` - home page category cards
- [ ] `_category.scss` - section tree cards
- [ ] `_section.scss` - section list items
- [ ] `_article.scss` - article containers
- [ ] `_recent-activity.scss` - activity cards

**Run this command NOW:**
```bash
grep -rn "shadow-lg\|shadow-xl\|radius-xl" styles/_blocks.scss styles/_category.scss styles/_section.scss styles/_article.scss styles/_recent-activity.scss | grep -v "//" | wc -l
```

**Expected: 0 for flat sites**

If the number is high, you didn't update card styling. Go back to 4.4!

---

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

### 4.8 Search Bar (CRITICAL - Often Missed!)

**MANDATORY:** Run these commands:
```bash
# Check for pill shape and shadows in ALL files with search styles
grep -rn "radius-full" styles/_search.scss styles/_section.scss styles/_sub-nav.scss | grep -v "//"

# Check for remaining color variables in search files
grep -rn "var(--color" styles/_search.scss styles/_section.scss | grep -i search
```

**Expected: 0 for both commands**

**WARNING:** Search styles exist in MULTIPLE files! You must update ALL of them:
- `_search.scss` - main search styles
- `_section.scss` - interior page search (often has conflicting pill shape!)
- `_sub-nav.scss` - sub-navigation search container
- `_hero.scss` - hero search override

**IMPORTANT:** You must update ALL color instances in `_search.scss`, not just the main container! The file has colors for:
- Main `.search` container
- `.search-full` variant
- `input[type="search"]` text and placeholder
- `-webkit-autofill` background (often missed!)
- `.clear-button` colors
- `.search-icon` color
- Focus border colors in `[dir="ltr"]` and `[dir="rtl"]` sections

Update `styles/_search.scss`:
```scss
.search {
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background-color: #faf9f0;

  &:focus-within {
    border-color: #d97757;
    box-shadow: none;
  }

  &-full input[type="search"],
  &-full .clear-button {
    border-color: #faf9f0;  // NOT var(--color-surface)!
  }

  input[type="search"] {
    background-color: transparent;
    color: #191919;

    &::placeholder {
      color: rgba(25, 25, 25, 0.5);
    }

    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px #faf9f0 inset;  // MUST match bg!
    }
  }

  .clear-button {
    color: rgba(25, 25, 25, 0.5);
    &:hover { background-color: #d97757; color: #fff; }
  }
}

.search-icon {
  color: rgba(25, 25, 25, 0.5);
}
```

Also update focus border colors in the `[dir="ltr"]` and `[dir="rtl"]` sections!

### 4.9 Breadcrumbs (Often Missed!)

Update `styles/_breadcrumbs.scss`:
```scss
.breadcrumbs {
  background-color: transparent;  // NOT surface-raised for flat sites
  padding: var(--space-2) 0;      // minimal padding
  border-radius: 0;               // no rounded container

  li {
    color: rgba(25, 25, 25, 0.6);  // muted text

    a {
      color: rgba(25, 25, 25, 0.6);

      &:hover {
        color: #d97757;  // accent color
      }
    }

    &:last-child {
      color: #191919;  // current page darker
    }
  }
}
```

### 4.10 Page Spacing (CRITICAL - Often Missed!)

**Copenhagen's defaults are SPACIOUS. Most sites need TIGHTER spacing.**

**IMPORTANT:** You almost always need to REDUCE spacing, not increase it!

Update `styles/_hero.scss`:
```scss
.hero {
  padding: var(--space-8) var(--space-5);  // 32px - COMPACT
  min-height: 180px;                        // shorter hero

  @include tablet {
    padding: var(--space-10) var(--space-6);  // 40px on desktop
    min-height: 220px;
  }
}
```

Update `styles/_home-page.scss`:
```scss
.section {
  margin-bottom: var(--space-10);  // 40px between sections - TIGHT

  @include tablet {
    margin-bottom: var(--space-12);  // 48px on desktop
  }
}
```

**Rule of thumb:** If Copenhagen uses `space-16` (64px), most sites use `space-10` (40px) or less.

**Verification:**
```bash
# Check hero padding values
grep -n "padding:" styles/_hero.scss | head -5
```

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 4: SCSS Verification (MANDATORY)
## ══════════════════════════════════════════════════════════════════════════════

**Run ALL SEVEN verification commands. Each should return 0 (or near-0) matches:**

```bash
# 1. Heavy shadows/radius - should return 0 outside _tokens.scss
grep -rn "shadow-lg\|shadow-xl\|radius-xl\|radius-2xl" styles/*.scss | grep -v "_tokens.scss" | grep -v "//" | wc -l
```
**Expected: 0** (If not 0, you missed files. Go back to 4.4)

```bash
# 2. Pill shapes in search bar - should return 0 for flat sites
grep -rn "radius-full" styles/_search.scss | grep -v "//" | wc -l
```
**Expected: 0 for flat sites** (If not 0, go back to 4.8)

```bash
# 3. Heavy heading weights - should return 0
grep -rn "font-weight.*extrabold" styles/*.scss | grep -v "//" | wc -l
```
**Expected: 0**

```bash
# 4. Gradients in home page sections - should return 0 for flat sites
grep -rn "linear-gradient\|radial-gradient" styles/_hero.scss styles/_home-page.scss styles/_recent-activity.scss | grep -v "//" | wc -l
```
**Expected: 0 for flat sites** (If not 0, remove gradient backgrounds in 4.7)

```bash
# 5. White card backgrounds - should return 0 for flat sites where cards match page bg
grep -rn "background-color: var(--color-surface)" styles/_blocks.scss styles/_category.scss styles/_section.scss styles/_recent-activity.scss | grep -v "//" | wc -l
```
**Expected: 0 for flat sites** (If not 0, update card backgrounds to match extracted page bg color)

```bash
# 6. Footer using default token variables instead of extracted values
grep -n "var(--font-size" styles/_footer.scss | wc -l
```
**Expected: 0 or minimal** (Footer typography should use extracted px values, not default tokens!)

```bash
# 7. Footer typography check - verify extracted values are present
grep -n "font-size:\|letter-spacing:\|line-height:" styles/_footer.scss | head -10
```
**Verify:** Output should show SPECIFIC px values (like `14px`, `-0.01em`, `1.5`) NOT token variables.

**DO NOT PROCEED** until all SEVEN commands return expected values.

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

---

## ══════════════════════════════════════════════════════════════════════════════
## GATE 6: Visual Verification (MANDATORY - DO NOT SKIP!)
## ══════════════════════════════════════════════════════════════════════════════

**Open target site and preview (localhost:4567) SIDE BY SIDE.**

You MUST visually compare before declaring completion!

### Header Comparison
- [ ] Number of nav items similar (if target has 0-2, yours should too!)
- [ ] Logo position and size similar
- [ ] Background color matches
- [ ] If target has NO nav links, yours doesn't either

### Hero Comparison
- [ ] Background type matches (solid color / gradient / image)
- [ ] Background color matches (if solid)
- [ ] Height is similar (not drastically taller/shorter)

### Custom Sections
- [ ] Alert banner present IF target has one
- [ ] Request callout ("Still have questions?") present IF target has one
- [ ] Quick actions present IF target has them
- [ ] If target has custom sections you don't, GO BACK and add them!

### Footer Comparison (CRITICAL!)
- [ ] Background color matches (ESPECIALLY check if dark!)
- [ ] Text is readable against background
- [ ] If target footer is DARK, yours is too
- [ ] Column count similar
- [ ] Social icons visible and styled correctly

### Link Colors
- [ ] Click a link - does the color match target's link color?
- [ ] Is visited link color correct (often purple, not gray)?

### Overall Feel
- [ ] Site "feels" similar to target
- [ ] No jarring visual differences
- [ ] Color scheme is cohesive

**If ANY checkbox fails, FIX THE ISSUE before proceeding!**

Common fixes needed at this stage:
| Issue | Fix |
|-------|-----|
| Header has too many nav items | Use Type A minimal header template |
| Footer is light but should be dark | Update `_footer.scss` background-color |
| Links are wrong color | Update manifest.json `link_color` |
| Missing custom sections | Create new templates and SCSS |

---

Tell the user: **"Preview running at http://localhost:4567 - please compare with [TARGET_URL] and let me know what needs adjustment."**

---

## ══════════════════════════════════════════════════════════════════════════════
## COMPLETION CHECKLIST
## ══════════════════════════════════════════════════════════════════════════════

**A reskin is COMPLETE only when ALL boxes are checked:**

### Pre-Implementation Analysis (MUST be done FIRST)
- [ ] Site type classified: A (minimal) / B (standard) / C (custom)
- [ ] Header nav count documented (determines header approach)
- [ ] Link color extracted (verified DIFFERENT from brand color if applicable)
- [ ] Footer background identified: LIGHT / DARK
- [ ] Custom sections identified (alert, callout, quick-actions)

### Header Structure (Based on Site Type)
- [ ] **If Type A (minimal):** Header simplified to logo + sign-in only
- [ ] **If Type B/C:** Standard header with appropriate nav items
- [ ] Header nav count matches target (not more items than target!)
- [ ] Logo links to correct destination (main site vs help center)

### Custom Sections (If Target Has Them)
- [ ] Alert banner template created (if target has one)
- [ ] Alert banner SCSS created
- [ ] Request callout template created (if target has one)
- [ ] Request callout SCSS created
- [ ] Quick actions implemented (if target has them)

### Files Modified (Minimum 15)
- [ ] `manifest.json` - colors and fonts (link_color VERIFIED correct)
- [ ] `document_head.hbs` - Google Font loaded
- [ ] `header.hbs` - **STRUCTURE matches target** (minimal vs full)
- [ ] `footer.hbs` - **REWRITTEN** to match target footer (links, social icons, copyright)
- [ ] `_tokens.scss` - radius and shadow values
- [ ] `_base.scss` - heading weights
- [ ] `_header.scss` - header styling
- [ ] `_footer.scss` - footer styling (**dark bg if target is dark!**)
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

### Gate 6: Visual Verification (MANDATORY!)
- [ ] Opened target and preview side-by-side
- [ ] Header nav count matches target
- [ ] Footer background color matches (especially if DARK!)
- [ ] Link colors verified by clicking actual links
- [ ] Custom sections present if target has them
- [ ] Overall site "feels" similar to target

### Quality Checks
- [ ] Logo is EXTRACTED (not fabricated)
- [ ] Header structure matches target type (minimal vs full)
- [ ] Footer uses Zendesk helpers for HC links
- [ ] Preview server is running
- [ ] User has been asked to compare and provide feedback

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
| Cards look "popped out" | Change background-color from white to page bg color (e.g., #faf9f0) |
| Cards still have shadow | Set `box-shadow: none` not just `shadow-sm` for flat sites |
| Buttons too rounded | Update ALL files (see 4.5) |
| Search bar pill-shaped | Change `border-radius: var(--radius-full)` to `8px` (see 4.8) |
| Search bar has shadow | Set `box-shadow: none` in `_search.scss` |
| Breadcrumbs have background | Set `background-color: transparent` (see 4.9) |
| Page feels too spread out | REDUCE hero padding and section margins (see 4.10) - Copenhagen defaults are spacious |
| Too much whitespace | Reduce `min-height`, padding, and margins - most sites are COMPACT |
| Search double border | Style `.search` wrapper only |
| Wrong help center links | Use Zendesk helpers |
| Font size wrong | Resolve CSS variables! `detail-m` often = 16px, not 12px |
| Spacing too tight | Trace `space--4` etc to actual rem/px values |
| Footer looks cramped | Check padding (often 5rem), gaps (often 2-3rem) |
| **Links wrong color** | Brand color ≠ link color! Re-extract link color specifically from CSS `a` styles |
| **Header has too many items** | Target is Type A (minimal) - simplify to logo + sign-in only |
| **Footer light but should be dark** | Re-check target footer - update `_footer.scss` background to dark color |
| **Footer text invisible** | If dark footer, text/links must be light (white or #ccc) |
| **Missing alert banner** | Target has custom section - create new template + SCSS |
| **Missing "Still have questions?"** | Target has request-callout - create new template + SCSS |
| **Site doesn't "feel" like target** | Did you do Gate 6 visual comparison? Compare side-by-side! |
| **Visited links gray instead of purple** | Many sites use purple (#9358B0) for visited - check and update |

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

7. **Used brand color for link_color without verification** → LIKELY WRONG
   - Many sites have DIFFERENT brand vs link colors (e.g., Blue Bottle: teal brand, blue links)
   - Always extract link color from actual `<a>` styles in CSS

8. **Header has full nav when target has minimal** → WRONG STRUCTURE
   - Did you classify the site type in Step 1.0?
   - Type A sites need simplified header (logo + sign-in only)

9. **Footer is light but target's is dark** → VISUALLY WRONG
   - Footer background is one of the most visible differences
   - Dark footers need inverted text colors

10. **No visual side-by-side comparison done** → NOT VERIFIED
    - Gate 6 is MANDATORY - you must visually compare before completing

11. **Target has custom sections you didn't implement** → INCOMPLETE
    - Alert banners, "Still have questions?", quick actions need custom templates
    - Standard Copenhagen doesn't have these - they must be ADDED

12. **Only updated _tokens.scss, _header.scss, _footer.scss** → MAJORLY INCOMPLETE
    - You skipped Typography (4.3) and Cards (4.4) sections entirely!
    - Cards appear on EVERY page - skipping them makes reskin look unfinished
    - Run the checkpoint verification commands and update ALL listed files

13. **Didn't run Gate 4 verification commands** → NOT VERIFIED
    - Gate 4 has 7 verification commands that MUST return expected values
    - If you skipped these, you likely missed files
    - Go back and run EVERY command in Gate 4

14. **Updated fewer than 12 SCSS files** → INCOMPLETE
    - Check the SCSS File Tracker at start of Step 4
    - A proper reskin touches 15+ SCSS files
    - If your count is low, you skipped sections

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
