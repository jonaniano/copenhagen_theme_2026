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

## Instructions

You are reskinning a Zendesk Copenhagen Help Center theme to match a target website. The goal is pixel-perfect visual alignment so users cannot distinguish between the main website and the help center.

### Process Overview

The reskin process has built-in validation gates to minimize back-and-forth:

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
                                        (yarn start + visual check)
                                              ↓
                                    Phase 6: Iterative Refinement
                                    (logo sizing, colors - expect 2-3 passes)
```

**Key Principle:** Validate early, validate often. Don't proceed past a gate with errors.

---

### Phase 1: Analysis (Always Do First)

When analyzing a target website, use a **multi-strategy approach** because many modern sites are JS-rendered.

#### Strategy 1: Direct curl (try first)

```bash
# Basic fetch
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "<url>"

# Extract hex colors
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '#[0-9a-fA-F]{6}' | sort | uniq -c | sort -rn | head -20

# Extract background colors
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'background-color:#[0-9a-fA-F]{3,6}' | sort | uniq -c | sort -rn | head -15

# Find logo SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>' | head -1

# Extract aria-labels for structure
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'aria-label="[^"]*"' | head -30

# Extract navigation links
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'href="https://[^"]*"' | sort | uniq | head -30
```

#### Strategy 2: WebFetch (for JS-heavy sites)

If curl returns minimal/no results, use WebFetch:

```
Use WebFetch tool with URL and prompt:
"Extract the following from this page:
1. All colors used (hex values) for backgrounds, text, buttons, borders
2. The logo (describe it or extract SVG path)
3. Header navigation items and their URLs
4. Footer structure (columns, links, social icons)
5. Font families used
6. Button styles (colors, border-radius)
7. Overall theme (dark/light header, dark/light footer)"
```

#### Strategy 3: Tailwind Detection

Many modern sites use Tailwind CSS. Look for class patterns:

```bash
# Check for Tailwind classes
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'class="[^"]*bg-[^"]*"' | head -20
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'class="[^"]*text-[^"]*"' | head -20

# Count most common Tailwind bg classes
curl -s "<url>" | grep -oE "bg-[a-z]+-[0-9]+" | sort | uniq -c | sort -rn | head -15

# Count most common rounded classes (for border-radius)
curl -s "<url>" | grep -oE "rounded-[a-z0-9]+" | sort | uniq -c | sort -rn | head -10
```

**Tailwind Color Reference:**

| Tailwind Class | Hex Value |
|----------------|-----------|
| `bg-black` | `#000000` |
| `bg-white` | `#FFFFFF` |
| `bg-slate-900` | `#0f172a` |
| `bg-slate-800` | `#1e293b` |
| `bg-slate-700` | `#334155` |
| `bg-slate-100` | `#f1f5f9` |
| `bg-slate-50` | `#f8fafc` |
| `bg-gray-900` | `#111827` |
| `bg-gray-800` | `#1f2937` |
| `bg-gray-100` | `#f3f4f6` |
| `bg-gray-50` | `#f9fafb` |
| `bg-zinc-900` | `#18181b` |
| `bg-zinc-800` | `#27272a` |
| `bg-neutral-900` | `#171717` |
| `bg-neutral-800` | `#262626` |
| `text-white` | `#FFFFFF` |
| `text-black` | `#000000` |
| `text-slate-900` | `#0f172a` |
| `text-slate-600` | `#475569` |
| `text-slate-400` | `#94a3b8` |
| `text-gray-900` | `#111827` |
| `text-gray-600` | `#4b5563` |
| `text-gray-400` | `#9ca3af` |
| `text-neutral-500` | `#737373` |
| `bg-red-50` | `#fef2f2` |
| `bg-red-500` | `#ef4444` |
| `text-red-600` | `#dc2626` |
| `bg-amber-50` | `#fffbeb` |
| `text-amber-800` | `#92400e` |
| `bg-blue-500` | `#3b82f6` |
| `text-blue-500` | `#3b82f6` |

**Tailwind Opacity Modifiers:**
- `text-white/60` = `rgba(255, 255, 255, 0.6)`
- `text-white/80` = `rgba(255, 255, 255, 0.8)`
- `bg-black/50` = `rgba(0, 0, 0, 0.5)`

**Tailwind Border Radius:**
| Class | Value |
|-------|-------|
| `rounded-sm` | `2px` |
| `rounded` | `4px` |
| `rounded-md` | `6px` |
| `rounded-lg` | `8px` |
| `rounded-xl` | `12px` |
| `rounded-2xl` | `16px` |
| `rounded-3xl` | `24px` |
| `rounded-full` | `9999px` |

#### Strategy 4: CSS Modules / Design Token Detection

Some sites use CSS Modules (hashed class names) or design token systems.

**CSS Modules detection:**
```bash
# Look for hashed class names like `theme_theme__XHAvb`
curl -s "<url>" | grep -oE 'class="[^"]*__[A-Za-z0-9]{5}[^"]*"' | head -10
```

**Design Token Systems (Notion-style):**
```bash
# Extract CSS custom properties
curl -s "<url>" | grep -oE 'var\(--[^)]+\)' | sort | uniq | head -30

# Look for semantic token patterns
curl -s "<url>" | grep -oE '--[a-z]+-[a-z]+-[0-9]+' | head -20
```

Common patterns:
- `--typography-sans-100-medium-font` → Typography tokens
- `--spacing-20`, `--spacing-48` → Spacing scale
- `--border-radius-200`, `--border-radius-500` → Radius tokens
- `--color-primary`, `--color-surface` → Color tokens

**Framework Detection:**
```bash
# Vue/Nuxt (data-v-* attributes)
curl -s "<url>" | grep -oE 'data-v-[a-f0-9]+' | head -5

# React/Next.js (data-reactroot, __next)
curl -s "<url>" | grep -E '__next|data-reactroot' | head -5

# CMS-driven (JSON blobs)
curl -s "<url>" | grep -oE '"blades":|"blocks":|"sections":' | head -3

# Webflow (data-wf-* attributes)
curl -s "<url>" | grep -oE 'data-wf-domain|data-wf-site' | head -3

# Adobe Experience Manager (AEM)
curl -s "<url>" | grep -E 'clientlibs|aem|adobe' | head -3
```

**Webflow Sites:**
- Detection: `data-wf-domain`, `data-wf-site`, `data-wf-page` attributes
- CSS from: `cdn.prod.website-files.com`
- Often use Lottie animations for logos (see Logo section)
- Class patterns: `w-inline-block`, `w-dropdown`, `w-list-unstyled`

**Adobe Helix / Experience Cloud Sites:**
- Detection: `hlx.page`, `helix`, Adobe scripts
- External theme CSS from CDN
- Examples: Coca-Cola
- Often have clean semantic HTML

**Next.js Sites (very common):**
- Detection: `__NEXT_DATA__` script tag, `data-next-head` attributes
- Examples: Walmart, Airtable, ClickUp
- May use CSS Modules (hashed class names)
- Look for `_next` in asset URLs

**CSS Modules + Utility Class Hybrid:**
Some sites (e.g., ClickUp) combine CSS Modules with utility-like classes:
```html
<button class="CuButton_button__2XIwY radius-12 text-lg">
```
- Hashed component classes: `CuButton_button__2XIwY`
- Utility classes: `radius-12`, `text-lg`, `radius-md`
- Extract radius values from utility class names

#### Strategy 5: Logo Extraction Deep Dive

Logos are tricky. Try multiple approaches:

```bash
# Method 1: aria-label SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*aria-label="[^"]*"[^>]*>.*?</svg>'

# Method 2: Logo class SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<svg[^>]*class="[^"]*logo[^"]*"[^>]*>.*?</svg>'

# Method 3: Header link with SVG
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<a[^>]*href="/"[^>]*>.*?</a>' | grep -oE '<svg.*?</svg>'

# Method 4: Image logo
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '<img[^>]*logo[^>]*>'
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'src="[^"]*logo[^"]*\.(svg|png|webp)"'

# Method 5: CSS for logo sizing
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE '\.[a-zA-Z0-9_-]*\{[^}]*width:[^}]*height:[^}]*\}' | head -10

# Method 6: Check for Lottie animated logos
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'data-animation-type="lottie"'
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'data-src="[^"]*\.json"'
```

**Lottie Logo Handling:**
Some modern sites (e.g., Anthropic) use Lottie JSON animations for logos.
- Detection: `data-animation-type="lottie"`, `data-src="*.json"`
- **Solution:** Look for static fallback (favicon, og:image, press kit)
- Alternative: Search for company logo SVG on their press/brand page
- Example: `https://www.anthropic.com/brand` or similar

**Logo Sizing Extraction:**
```bash
# Find transform/scale on logo
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'transform:scale\([0-9.]+\)'

# Find width/height attributes
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'width="[0-9.]+"' | head -5
curl -s -A "Mozilla/5.0..." "<url>" | grep -oE 'height="[0-9.]+"' | head -5
```

---

### LOGO WORKFLOW (Expect 2-3 iterations)

Logos are the #1 source of back-and-forth. Follow this systematic approach:

**Step 1: Extract Logo SVG**
Try methods in order until you get a clean SVG:
1. aria-label SVG in header
2. Logo class SVG
3. Header home link SVG
4. Favicon/brand page fallback
5. Ask user to provide SVG path

**Step 2: Validate SVG**
```bash
# Check that viewBox matches path coordinates
# A path with coordinates 0-78 needs viewBox="0 0 78 ..."
# Mismatched viewBox = jumbled/clipped logo
```

**Step 3: Get Exact Sizing from Target Site**
```bash
# Extract computed dimensions from target
# Look for: width, height, transform: scale()
```

**Step 4: Initial Implementation**
```scss
.company-logo {
  // Start with viewBox dimensions
  width: [viewBox-width]px;
  height: [viewBox-height]px;
  color: [header-text-color];
}
```

**Step 5: Iterative Refinement (EXPECT THIS)**
After first preview, you will likely need to adjust:
- **Too small?** → Add `transform: scale(1.1)` or `scale(1.2)`
- **Too large?** → Reduce scale or explicit width/height
- **Vertically misaligned?** → Add `margin-top: -Xpx` (negative = up)
- **Horizontally off?** → Check `transform-origin: left center`

**Step 6: Final Verification**
Open target site and help center side-by-side. Logo should be:
- [ ] Same visual size
- [ ] Same vertical position relative to nav items
- [ ] Same color

---

### Phase 2: Design Token Extraction

Create a mental model of these values before making changes:

#### Colors Checklist
- [ ] Header background (often #FFFFFF, transparent, or dark #000/#111)
- [ ] Footer background (often dark - #030302, #11110D, #000, #111827)
- [ ] Page/body background (#FFFFFF or off-white like #F5F5F2, #FAFAFA)
- [ ] Primary text color (near-black like #11110D, #111827, #171717)
- [ ] Secondary/muted text (gray like #6B6B6B, #9CA3AF, or rgba white)
- [ ] Accent/brand color (for CTAs - varies by brand)
- [ ] Text on accent color (often dark on light accent, white on dark)
- [ ] Link color (often same as text, with underline on hover)
- [ ] Border color (often subtle #E5E7EB or transparent)
- [ ] Focus ring color (often accent color)

#### Typography Checklist
- [ ] Primary font family
- [ ] If proprietary, identify alternative (see Font Alternatives below)
- [ ] Font weights used (typically 400, 500, 600, 700)
- [ ] Base font size (usually 16px)
- [ ] Heading scale
- [ ] Letter-spacing (often `tracking-tight` = -0.025em on headings)

#### Component Styles Checklist
- [ ] Button border-radius (pill = 9999px, rounded = 6-16px)
- [ ] Button padding (common: 10px 20px, 12px 24px)
- [ ] Input border-radius (often matches buttons)
- [ ] Card/block border-radius (8-16px common)
- [ ] Shadow usage (modern sites often use none or very subtle)
- [ ] Hover effects (underline vs opacity vs color change)

### Phase 3: Font Resolution

**Common Font Alternatives (proprietary → open source):**

| Proprietary | Google Font Alternative | Notes |
|-------------|------------------------|-------|
| Vanilla Sans | DM Sans | Geometric, Zendesk-like |
| Graphik | Inter | Neutral, extensive weights |
| Circular | Nunito Sans | Rounded geometric |
| Helvetica Neue | Source Sans Pro | Neo-grotesque |
| Avenir | Nunito | Rounded, friendly |
| Proxima Nova | Montserrat | Geometric, popular |
| Gotham | Poppins | Geometric, bold |
| SF Pro | Inter | Apple system font alternative |
| Söhne | Inter | Stripe-like |
| Roobert | Space Grotesk | Modern geometric |
| GT Walsheim | DM Sans | Geometric humanist |
| Tiempos | Merriweather | Serif alternative |
| Canela | Playfair Display | Display serif |
| ITC Salesforce Sans | Inter | Salesforce CRM |
| system-ui | Inter | Generic system stack |
| Haas Groot Disp | Inter | Airtable's font |
| Bogle | Nunito Sans | Walmart's proprietary font |
| TCCC Unity | Montserrat | Coca-Cola's font |
| (any missing) | Inter | Safe fallback for most sans-serif |

**Note:** Inter is the most versatile fallback for modern sans-serif fonts. When in doubt, use Inter.

**System Font Stack (no loading needed):**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Font loading code for `document_head.hbs`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Multiple fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Phase 4: Template Generation

#### CRITICAL TEMPLATE RULES

1. **Valid Zendesk Translation Keys:**
   - `{{t 'skip_navigation'}}`
   - `{{t 'user_navigation'}}`
   - `{{t 'toggle_navigation'}}`
   - `{{t 'sign_in'}}`
   - `{{t 'profile'}}`
   - `{{t 'activities'}}`
   - `{{t 'home_page' name=help_center.name}}`

2. **INVALID - DO NOT USE:**
   - `{{t 'global_navigation'}}` - Does not exist
   - `{{current_year}}` - Does not exist
   - Any custom translation keys not in Zendesk's system

3. **Use hardcoded strings for custom text:**
   ```handlebars
   <!-- WRONG -->
   <nav aria-label="{{t 'global_navigation'}}">

   <!-- CORRECT -->
   <nav aria-label="Main navigation">
   ```

4. **Use hardcoded year:**
   ```handlebars
   <!-- WRONG -->
   &copy; Company {{current_year}}

   <!-- CORRECT -->
   &copy; Company 2025
   ```

5. **Valid link helpers:**
   - `{{link 'help_center'}}`
   - `{{link 'community'}}`
   - `{{link 'new_request' class='classname'}}`
   - `{{link 'service_catalog'}}`
   - `{{link 'sign_in'}}`
   - `{{link 'sign_out'}}`
   - `{{link 'requests'}}`
   - `{{link 'contributions'}}`
   - `{{link 'approval_requests'}}`
   - `{{#link 'contributions'}}{{t 'activities'}}{{/link}}`
   - `{{#my_profile}}...{{/my_profile}}`
   - `{{user_avatar class="classname"}}`
   - `{{user_name}}`
   - `{{contact_details}}`
   - `{{change_password}}`

#### PRE-FLIGHT TEMPLATE CHECKLIST

**Before writing ANY template, verify these patterns:**

```handlebars
{{!-- ✅ SAFE - These work --}}
{{t 'skip_navigation'}}
{{t 'user_navigation'}}
{{t 'toggle_navigation'}}
{{t 'sign_in'}}
{{t 'profile'}}
{{t 'activities'}}
{{link 'help_center'}}
{{link 'community'}}
{{link 'new_request'}}
aria-label="Main navigation"  {{!-- Hardcoded string --}}
&copy; Company 2025            {{!-- Hardcoded year --}}

{{!-- ❌ WILL FAIL - Never use these --}}
{{t 'global_navigation'}}      {{!-- Does not exist --}}
{{t 'main_navigation'}}        {{!-- Does not exist --}}
{{current_year}}               {{!-- Helper does not exist --}}
{{year}}                       {{!-- Helper does not exist --}}
```

**Validation command after writing templates:**
```bash
yarn build
# If you see 400 errors, check for invalid translation keys
```

#### Header Template Structure

```handlebars
<a class="skip-navigation" tabindex="1" href="#main-content">{{t 'skip_navigation' }}</a>

<div class="header-wrapper">
  <header class="header">
    <div class="header-left">
      <div class="logo">
        <a href="https://www.targetsite.com" aria-label="Company Name">
          <!-- Inline SVG logo here - MUST include viewBox -->
          <svg class="company-logo" viewBox="0 0 WIDTH HEIGHT" fill="currentColor" aria-hidden="true">
            <path d="..."/>
          </svg>
        </a>
      </div>

      <nav class="main-nav" aria-label="Main navigation">
        <ul class="main-nav-list">
          <li class="main-nav-item">
            <a href="https://www.targetsite.com/products/" class="main-nav-link">Products</a>
          </li>
          <!-- More nav items from target site -->
        </ul>
      </nav>
    </div>

    <div class="header-right">
      <nav class="user-nav" id="user-nav" aria-label="{{t 'user_navigation'}}">
        <ul class="user-nav-list">
          <li>{{link 'community'}}</li>
          <li>{{link 'new_request' class='submit-a-request'}}</li>
          {{#unless signed_in}}
            <li>
              <a href="https://www.targetsite.com/login/" class="nav-link">Log in</a>
            </li>
          {{/unless}}
        </ul>
      </nav>

      {{#if signed_in}}
        <div class="user-info dropdown">
          <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
            {{user_avatar class="user-avatar"}}
            <span class="user-name-text">
              {{user_name}}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" class="dropdown-chevron-icon" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-linecap="round" d="M3 4.5l2.6 2.6c.2.2.5.2.7 0L9 4.5"/>
              </svg>
            </span>
          </button>
          <div class="dropdown-menu" role="menu">
            {{#my_profile role="menuitem"}}{{t 'profile'}}{{/my_profile}}
            {{link "requests" role="menuitem"}}
            {{#link "contributions" role="menuitem"}}{{t "activities"}}{{/link}}
            {{link "approval_requests" role="menuitem"}}
            {{contact_details role="menuitem"}}
            {{change_password role="menuitem"}}
            <div class="separator" role="separator"></div>
            {{link "sign_out" role="menuitem"}}
          </div>
        </div>
      {{else}}
        <a href="https://www.targetsite.com/register/" class="cta-button">Start free trial</a>
      {{/if}}
    </div>

    <!-- Mobile navigation -->
    <div class="nav-wrapper-mobile">
      <button class="menu-button-mobile" aria-controls="user-nav-mobile" aria-expanded="false" aria-label="{{t 'toggle_navigation'}}">
        {{#if signed_in}}
          {{user_avatar class="user-avatar"}}
        {{/if}}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="icon-menu">
          <path fill="none" stroke="currentColor" stroke-linecap="round" d="M1.5 3.5h13m-13 4h13m-13 4h13"/>
        </svg>
      </button>
      <nav class="menu-list-mobile" id="user-nav-mobile" aria-expanded="false">
        <ul class="menu-list-mobile-items">
          <!-- Mobile menu items -->
        </ul>
      </nav>
    </div>
  </header>
</div>
```

#### Footer Template Structure

```handlebars
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-columns">
      <div class="footer-column">
        <h4 class="footer-column-title">Products</h4>
        <ul class="footer-links">
          <li><a href="https://www.targetsite.com/product1/">Product 1</a></li>
          <!-- More links from target site -->
        </ul>
      </div>

      <div class="footer-column">
        <h4 class="footer-column-title">Resources</h4>
        <ul class="footer-links">
          <li><a href="https://www.targetsite.com/blog/">Blog</a></li>
          <!-- More links -->
        </ul>
      </div>

      <div class="footer-column">
        <h4 class="footer-column-title">Company</h4>
        <ul class="footer-links">
          <li><a href="https://www.targetsite.com/about/">About</a></li>
          <!-- More links -->
        </ul>
      </div>

      <div class="footer-column">
        <h4 class="footer-column-title">Help Center</h4>
        <ul class="footer-links">
          <li>{{link 'help_center'}}</li>
          <li>{{link 'community'}}</li>
          <li>{{link 'new_request'}}</li>
          <li>{{link 'service_catalog'}}</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-social">
        <!-- Social icons - see Social Media Icon SVGs section -->
      </div>

      <div class="footer-legal">
        <div class="footer-legal-links">
          <a href="https://www.targetsite.com/privacy/">Privacy Notice</a>
          <a href="https://www.targetsite.com/terms/">Terms of Use</a>
        </div>
        <div class="footer-copyright">
          &copy; Company Name 2025
        </div>
      </div>

      <div class="footer-language-selector">
        {{#if alternative_locales}}
          <div class="dropdown language-selector">
            <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5"/>
                <path d="M1.5 8h13M8 1.5c-2 2-2.5 4-2.5 6.5s.5 4.5 2.5 6.5M8 1.5c2 2 2.5 4 2.5 6.5s-.5 4.5-2.5 6.5"/>
              </svg>
              {{current_locale.name}}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" class="dropdown-chevron-icon" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-linecap="round" d="M3 4.5l2.6 2.6c.2.2.5.2.7 0L9 4.5"/>
              </svg>
            </button>
            <span class="dropdown-menu dropdown-menu-end" role="menu">
              {{#each alternative_locales}}
                <a href="{{url}}" dir="{{direction}}" rel="nofollow" role="menuitem">
                  {{name}}
                </a>
              {{/each}}
            </span>
          </div>
        {{/if}}
      </div>
    </div>
  </div>
</footer>
```

### Phase 5: SCSS Generation

#### CRITICAL SCSS RULES

1. **Use hardcoded colors for precision** in component files:
   ```scss
   // In _header.scss, _footer.scss - use exact values
   .header-wrapper {
     background-color: #FFFFFF;  // Not var(--color-surface)
     border-bottom: none;        // Modern sites often have no border
   }

   .footer {
     background-color: #030302;  // Exact dark color
     color: #fff;
   }
   ```

2. **CSS variables only in `_tokens.scss`** for theme-wide values

3. **Light header pattern:**
   ```scss
   .header-wrapper {
     background-color: #fff;
     border-bottom: none;
   }

   .main-nav-link,
   .nav-link {
     color: #11110D;

     &:hover {
       text-decoration: underline;
     }
   }

   .company-logo {
     color: #11110D;
   }
   ```

4. **Dark header pattern:**
   ```scss
   .header-wrapper {
     background-color: #000;
   }

   .main-nav-link,
   .nav-link {
     color: rgba(255, 255, 255, 0.7);

     &:hover {
       color: #fff;
     }
   }

   .company-logo {
     color: #fff;
   }
   ```

5. **Dark footer pattern** (common):
   ```scss
   .footer {
     background-color: #030302;
     color: #fff;
     border-top: none;
   }

   .footer-column-title {
     color: #fff;
   }

   .footer-links a {
     color: rgba(255, 255, 255, 0.7);

     &:hover {
       color: #fff;
       text-decoration: underline;
     }
   }

   .footer-bottom {
     border-top: 1px solid rgba(255, 255, 255, 0.15);
   }

   .footer-legal-links a,
   .footer-copyright {
     color: rgba(255, 255, 255, 0.5);
   }
   ```

6. **Logo sizing pattern:**
   ```scss
   .company-logo {
     // Start with viewBox dimensions
     width: 78.4px;
     height: 56px;

     // Apply scaling if needed (check target site computed styles)
     transform: scale(1.15);
     transform-origin: left center;

     // Vertical adjustment if logo appears misaligned
     margin-top: -35px;  // Negative moves up, positive moves down

     color: #11110D;  // Or #fff for dark headers
   }
   ```

   **Logo sizing tips:**
   - Get viewBox from SVG: `viewBox="0 0 WIDTH HEIGHT"`
   - Check target for `transform: scale(X)` in computed styles
   - If logo is too small, increase scale or remove scale transform
   - If logo is vertically misaligned, adjust margin-top
   - Always set `transform-origin: left center` when using scale

7. **Button styles:**
   ```scss
   .cta-button {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     padding: 10px 20px;
     background-color: #D1F470;  // Brand accent color
     color: #11110D !important;  // Text on accent
     font-size: 14px;
     font-weight: 600;
     text-decoration: none;
     border-radius: 9999px;  // Pill shape (or 8px for rounded)

     &:hover {
       background-color: #bde05f;  // Slightly darker on hover
       text-decoration: none;
     }
   }

   .submit-a-request {
     background-color: #D1F470;
     color: #11110D !important;
     border-radius: 9999px;
     padding: 10px 20px;
     font-weight: 600;

     &:hover {
       background-color: #bde05f;
     }
   }
   ```

8. **Navigation links:**
   ```scss
   .main-nav-link {
     padding: 8px 16px;
     color: #11110D;
     font-size: 14px;
     font-weight: 500;
     text-decoration: none;

     &:hover {
       text-decoration: underline;  // Common modern pattern
     }
   }
   ```

### Phase 6: Validation & Iterative Refinement

**VALIDATION GATE 1: After Templates (before SCSS)**
```bash
yarn build
# Must pass with no 400 errors before proceeding
```

**VALIDATION GATE 2: After SCSS**
```bash
yarn build && yarn start
# Check console for errors, then visual inspection
```

**VALIDATION GATE 3: Visual Verification**

Open TWO browser windows side-by-side:
- Left: Target website (e.g., zendesk.com)
- Right: Help center preview (localhost:4567)

**Quick Visual Checklist:**
```
HEADER:
[ ] Background color matches exactly
[ ] Logo same size (within 5%)
[ ] Logo same vertical position
[ ] Logo color matches
[ ] Nav link colors match
[ ] CTA button color matches
[ ] CTA button shape (pill vs rounded) matches

FOOTER:
[ ] Background color matches (dark vs light)
[ ] Text color matches (white on dark, dark on light)
[ ] Column structure similar
[ ] Link hover states work

TYPOGRAPHY:
[ ] Font looks similar (even if not exact match)
[ ] Weights appear correct
```

**ITERATIVE REFINEMENT LOOP**

For items that don't match, follow this loop:

```
1. Identify mismatch (e.g., "logo too small")
2. Make targeted SCSS adjustment
3. Refresh preview (yarn start auto-reloads)
4. Re-check against target
5. Repeat until match (expect 2-3 iterations for logo)
```

**Common Refinement Patterns:**

| Issue | First Try | Second Try | Third Try |
|-------|-----------|------------|-----------|
| Logo too small | scale(1.15) | scale(1.25) | Increase width/height |
| Logo too high | margin-top: 5px | margin-top: 10px | - |
| Logo too low | margin-top: -10px | margin-top: -20px | margin-top: -35px |
| Color slightly off | Check hex exactly | Check for rgba/opacity | - |
| Button wrong shape | border-radius: 9999px (pill) | border-radius: 8px | - |

**Automated Validation Commands:**
```bash
# Check for common template errors
grep -r "{{t 'global_navigation'}}" templates/  # Should return nothing
grep -r "{{current_year}}" templates/            # Should return nothing

# Verify build passes
yarn build 2>&1 | grep -i "error\|400"          # Should return nothing
```

### Social Media Icon SVGs

```html
<!-- Facebook -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>

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

<!-- Instagram -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
</svg>

<!-- TikTok -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
</svg>

<!-- GitHub -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
</svg>
```

---

## Output Format

When running `/reskin analyze`, output a structured report:

```markdown
## Target Site Analysis: [URL]

### Extraction Method
[curl / WebFetch / Tailwind detection]

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Header BG | #FFFFFF | Light header |
| Footer BG | #030302 | Dark footer |
| Primary Text | #11110D | Body text |
| Muted Text | rgba(255,255,255,0.6) | Secondary text on dark |
| Accent | #D1F470 | CTA buttons |
| Accent Text | #11110D | Text on accent |
| Borders | transparent | No visible borders |

### Typography
- **Font:** [Name] → Alternative: [Google Font]
- **Weights:** 400, 500, 600, 700
- **Base Size:** 16px
- **Letter-spacing:** -0.025em on headings

### Logo
- **Type:** SVG / Image
- **viewBox:** 0 0 WIDTH HEIGHT
- **Computed size:** WxH px
- **Scale transform:** scale(X) if any
- **Color:** #HEXCODE

### Header Structure
- Logo: [Description]
- Nav Items: [List with URLs]
- CTAs: [List]
- Style: Light/Dark background

### Footer Structure
- Columns: [Count and headings]
- Social: [Which platforms]
- Legal: [Links]
- Background: Dark/Light
- Text color: [Color]

### Component Styles
- Button radius: [pill/rounded-lg/etc]
- Hover effects: [underline/opacity/color]
- Shadows: [none/subtle/heavy]

### Files to Modify
1. `templates/document_head.hbs` - Font loading
2. `templates/header.hbs` - Header structure
3. `templates/footer.hbs` - Footer structure
4. `styles/_tokens.scss` - Design tokens
5. `styles/_header.scss` - Header styles
6. `styles/_footer.scss` - Footer styles
7. `manifest.json` - Default colors

Ready to proceed with `/reskin apply`?
```

When running `/reskin apply`, modify files systematically and validate after each major change.

---

## Automated vs Manual Iteration

**What the skill should do automatically:**

1. **Template validation** - Run `yarn build` after writing templates, fix errors before proceeding
2. **Pre-flight checks** - Grep for known-bad patterns before saving templates
3. **Build verification** - Confirm no 400 errors after each file change
4. **Logo sizing iteration** - If user says "too small", automatically try scale(1.15), then scale(1.25)

**What requires user feedback:**

1. **"Does the logo look right?"** - Only user can confirm visual match
2. **"Is this the correct accent color?"** - User knows their brand
3. **"Should header be dark or light?"** - Sometimes ambiguous from analysis
4. **Logo source** - If extraction fails, ask user to provide SVG

**Recommended `/reskin apply` workflow:**

```
1. Apply fonts + tokens
   → yarn build (auto-validate)
   → Fix any errors automatically

2. Apply header template
   → grep for bad patterns (auto-fix if found)
   → yarn build (auto-validate)
   → Ask user: "Does header structure look correct?"

3. Apply footer template
   → Same validation flow
   → Ask user: "Does footer structure look correct?"

4. Apply SCSS styles
   → yarn build && yarn start
   → Ask user: "Please check preview. What needs adjustment?"

5. Iterate on feedback
   → Make changes
   → Re-validate
   → Repeat until user confirms "looks good"
```

**Key insight:** The skill should handle ALL technical validation automatically. User feedback should only be needed for visual/design decisions.

---

## Self-Correction Patterns

When you encounter these issues, fix them automatically without asking the user:

**Issue: `yarn build` returns 400 error**
```bash
# Auto-check for these patterns and fix:
grep -r "{{t 'global_navigation'}}" templates/ && sed -i '' 's/{{t .global_navigation.}}/Main navigation/g' templates/*.hbs
grep -r "{{current_year}}" templates/ && sed -i '' 's/{{current_year}}/2025/g' templates/*.hbs
```

**Issue: Logo SVG has no viewBox**
→ Automatically add viewBox based on path coordinates

**Issue: Colors extracted as Tailwind classes**
→ Automatically convert using the reference table (e.g., `bg-slate-900` → `#0f172a`)

**Issue: Font is proprietary**
→ Automatically substitute from font alternatives table

**Issue: yarn start fails with EADDRINUSE**
```bash
lsof -ti:4567 | xargs kill -9 && yarn start
```

---

## Common Issues & Solutions

### Issue: curl returns empty/minimal results
**Solution:** Use WebFetch tool as fallback for JS-rendered sites

### Issue: Logo appears jumbled/wrong
**Solution:**
1. Verify viewBox matches path coordinates
2. Check for multiple paths that need combining
3. Try extracting from different source (favicon, asset CDN)

### Issue: Logo too small/large
**Solution:**
1. Check target site for `transform: scale(X)`
2. Adjust scale in SCSS (start with 1.0, adjust up/down)
3. Set explicit width/height from viewBox

### Issue: Logo vertically misaligned
**Solution:** Add `margin-top: -Xpx` (negative moves up)

### Issue: Template upload fails with 400 error
**Solution:**
1. Check for invalid translation keys
2. Remove `{{current_year}}` or similar non-existent helpers
3. Verify Handlebars syntax

### Issue: Colors don't match exactly
**Solution:**
1. Use hardcoded hex values, not CSS variables
2. Check for opacity modifiers (white/60 = rgba)
3. Verify dark/light mode handling

### Issue: Fonts don't match
**Solution:**
1. Identify proprietary font
2. Find Google Font alternative from table
3. Match weights carefully (400, 500, 600, 700)

### Issue: Site uses CSS Modules (hashed class names)
**Symptoms:** Class names like `theme_theme__XHAvb`, `button_primary__abc12`
**Solution:**
1. Colors are likely in inline styles or CSS variables
2. Look for `style="..."` attributes with color values
3. Extract CSS custom properties (`--color-*`, `--spacing-*`)
4. WebFetch may provide better results than curl

### Issue: Site uses design token system
**Symptoms:** CSS variables like `--spacing-20`, `--typography-sans-100-medium-font`
**Solution:**
1. These are semantic tokens, not direct values
2. Look for where tokens are defined (usually in `<style>` blocks)
3. Map tokens to actual values (e.g., `--spacing-20` = `20px`)
4. Use computed styles from DevTools if possible

### Issue: Site is Nuxt/Vue (data-v-* attributes)
**Symptoms:** HTML has `data-v-72a864df` attributes
**Solution:**
1. curl usually works well for Nuxt sites
2. Look for inline `<style>` blocks with Tailwind or custom CSS
3. Vue component structure is usually semantic

### Issue: Site uses CMS-driven content (JSON blades/blocks)
**Symptoms:** JSON in HTML like `"blades": [...]`, `"blocks": [...]`
**Solution:**
1. Colors may be in JSON data, not CSS
2. Extract hex values from JSON: `grep -oE '"#[0-9a-fA-F]{6}"'`
3. Look for `font_color`, `background_color` keys in JSON

### Issue: Transparent/overlay header
**Symptoms:** Header shows `bg-transparent` or no background
**Solution:**
1. Use `background-color: transparent` in CSS
2. May need to handle scroll state (header becomes solid on scroll)
3. Text color may need to contrast with hero image underneath

### Issue: Site blocked by Cloudflare/bot protection
**Symptoms:** curl returns "Just a moment..." or challenge page, WebFetch returns 403
**Affected sites:** OpenAI, some enterprise sites
**Solution:**
1. Try with different user agent: `-A "Mozilla/5.0 (Macintosh...)"`
2. If still blocked, ask user to manually provide:
   - Screenshot of homepage
   - Key colors from browser DevTools
   - Font family from computed styles
3. Check brand/press page (often less protected)
4. Look for design system documentation

### Issue: Site blocked by CAPTCHA
**Symptoms:** curl returns "Click the button below to continue" or similar
**Affected sites:** Amazon, some e-commerce sites
**Solution:**
1. Same as Cloudflare - manual inspection required
2. Check mobile site (sometimes less protected)
3. Look for public style guides or brand pages

### Issue: Multi-color brand palette
**Symptoms:** Site uses many accent colors (purple, green, yellow, etc.)
**Affected sites:** ClickUp, Airtable, Slack
**Solution:**
1. Identify the PRIMARY accent color (usually CTAs)
2. Pick ONE accent for the help center theme
3. Use brand guidelines to choose most important color
4. Consider using the most prominent CTA color
5. For buttons, stick to single accent for consistency

### Issue: Logo is Lottie animation (JSON)
**Symptoms:** `data-animation-type="lottie"`, `data-src="*.json"`
**Affected sites:** Anthropic, some modern startups
**Solution:**
1. Check favicon for simplified logo
2. Look for press/brand kit page with static assets
3. Check og:image meta tag for logo
4. Search CDN for static SVG version
5. May need to recreate simple logo from brand guidelines

### Issue: Site uses custom/proprietary variable fonts
**Symptoms:** Font files like `*VF*.woff2`, `font-variation-settings`
**Affected sites:** NVIDIA (NVIDIA Sans VF), Apple, Google
**Solution:**
1. Variable fonts cannot be easily replicated
2. Find closest Google Font match (usually Inter or system-ui)
3. Match the font-weight range used on the site
4. Consider using system font stack for performance

---

## Site Architecture Reference

Examples from analyzed sites to help identify patterns:

### Samsara (Tailwind + Nuxt/Vue)
- **Framework:** Nuxt.js (Vue), Tailwind CSS v3.4.17
- **Font:** Inter, system-ui fallback
- **Detection:** `data-v-*` attributes, `tailwindcss` comment in CSS
- **Buttons:** Heavy use of `rounded-full` (pill), `rounded-md`
- **Colors:** `bg-slate-50`, `bg-blue-500`, `text-neutral-500`
- **Logo:** SVG 248x62 viewBox

### Notion (CSS Modules + Design Tokens)
- **Framework:** React/Next.js with CSS Modules
- **Classes:** Hashed names like `base_theme__K5IIh`, `theme_theme__XHAvb`
- **Tokens:** `--typography-sans-100-medium-font`, `--spacing-20`, `--border-radius-200`
- **Note:** Direct color extraction is harder; use WebFetch

### Salesforce (CMS-driven + CSS Variables)
- **Framework:** Custom CMS with JSON "blades"
- **Primary color:** `#032D60` (dark blue)
- **CSS vars:** `--pbc-g-font-display`
- **Detection:** Look for JSON content blocks in HTML

### Zendesk (reference)
- **Font:** Vanilla Sans → DM Sans alternative
- **Primary:** `#11110D` (near-black text)
- **Accent:** `#D1F470` (lime green CTAs)
- **Footer:** `#030302` (dark)
- **Buttons:** `border-radius: 9999px` (pill)

### Anthropic (Webflow + Lottie)
- **Framework:** Webflow (data-wf-* attributes)
- **CSS:** External from `cdn.prod.website-files.com`
- **Logo:** **Lottie animation** (JSON) - need static fallback
- **Colors:** `#d97757` (coral accent), `#f0eee6` (cream), `#141413` (near-black)
- **Border-radius:** 8px, 12px, 24px (rounded, not pill)
- **Nav:** Research, Economic Futures, Commitments, Learn, News
- **CTA:** "Try Claude"

### OpenAI (Cloudflare Protected)
- **Status:** Blocked by Cloudflare challenge
- **Note:** Both curl and WebFetch fail with 403
- **Workaround:** Manual inspection or brand page required

### NVIDIA (Enterprise/AEM)
- **Framework:** Adobe Experience Manager style
- **Font:** NVIDIA Sans VF (custom variable font) → Inter alternative
- **Colors:** `#76b900` (green), `#000000` (black), `#eeeeee` (light gray)
- **Style:** Traditional enterprise with dark header

### Amazon (CAPTCHA Protected)
- **Status:** Blocked by CAPTCHA/bot detection
- **Note:** Returns "Click the button below to continue shopping"
- **Workaround:** Manual inspection required

### Apple (Custom System Fonts)
- **Framework:** Custom, uses `data-layout-name`
- **Font:** SF Pro (system font) → Inter alternative
- **Colors:** Minimal palette, heavy use of #000000, #ffffff
- **Style:** Clean, minimal, lots of whitespace
- **Note:** Extensive locale variants (50+ languages)

### Coca-Cola (Adobe Helix)
- **Framework:** Adobe Experience Cloud / Helix
- **Detection:** `hlx.page`, Adobe rum scripts
- **Font:** TCCC Unity (proprietary) → Montserrat alternative
- **Colors:** `#bf1004` (Coca-Cola red), `#000000`, `#ffffff`
- **Style:** Bold red accent, clean black/white base

### Walmart (Next.js + Custom Font)
- **Framework:** Next.js (`__NEXT_DATA__`)
- **Font:** Bogle (proprietary) → Nunito Sans alternative
- **Colors:** `#001e60` (Walmart blue), `#ffc220` (spark yellow)
- **Style:** Blue dominant, yellow accents

### Airtable (Next.js + CSS Modules)
- **Framework:** Next.js (`data-next-head`)
- **Font:** Haas Groot Disp (proprietary) → Inter alternative
- **Colors:** Multi-color palette: `#FCB42A` (yellow), `#254FAD` (blue), `#9B67F0` (purple)
- **Classes:** CSS Modules with hashed names
- **Note:** Colorful, product-focused design

### ClickUp (Next.js + Utility Hybrid)
- **Framework:** Next.js (`data-next-head`)
- **Classes:** CSS Modules + utility classes (`radius-12`, `text-lg`)
- **Colors:** Multi-color: `#7F187F` (purple), `#1ED760` (green), `#F50A23` (red)
- **Buttons:** Multiple accent colors, gradient backgrounds
- **Note:** Very colorful brand with many accent colors
