# Claude Skill Plan: Zendesk Theme Reskin Tool

## Overview

A Claude Skill that automatically reskins a Zendesk Copenhagen Help Center theme to seamlessly match a target website's visual identity, minimizing manual iteration.

---

## Problems We Encountered (Lessons Learned)

### 1. **Color Extraction Challenges**
- Initial approach used generic CSS variables that didn't match
- Target site colors were embedded in minified CSS bundles
- Had to grep for specific patterns like `background-color:#[hex]`
- Dark footer vs light header required separate treatment

### 2. **Logo Handling Complexity**
- SVG path extraction wasn't straightforward
- Tried multiple approaches: full wordmark SVG, icon + text, icon only
- ViewBox and sizing required trial and error
- Needed to extract computed transform/scale values
- Vertical positioning required manual adjustment

### 3. **Font Matching**
- Target sites often use proprietary fonts (e.g., Vanilla Sans)
- Need to identify similar open-source alternatives (e.g., DM Sans)
- Font weights matter significantly for brand matching
- Google Fonts integration required preconnect links

### 4. **Template Validation Issues**
- Zendesk API returns 400 errors for invalid templates
- Translation keys like `{{t 'global_navigation'}}` must exist in Zendesk's system
- Custom helpers like `{{current_year}}` don't exist
- Had to use hardcoded strings or existing translation keys

### 5. **Structural Mapping**
- Header: logo position, nav items, CTA buttons, user dropdown
- Footer: multi-column layout, social icons, legal links, language selector
- Mobile navigation required separate consideration

### 6. **Styling Precision**
- Button border-radius (pill vs rounded)
- Hover states (underline vs opacity vs color change)
- Shadows and borders (often none on modern sites)
- Exact pixel sizes required checking computed styles

---

## Skill Architecture

### Phase 1: Target Website Analysis

```
/reskin analyze <url>
```

**Actions:**
1. Fetch target website HTML and CSS
2. Extract design tokens:
   - Primary/secondary/accent colors
   - Background colors (light/dark sections)
   - Text colors (primary, secondary, muted)
   - Border colors and styles
   - Shadow definitions
3. Extract typography:
   - Font families (with fallback identification)
   - Font sizes (heading scale, body text)
   - Font weights used
   - Line heights and letter-spacing
4. Extract component patterns:
   - Header structure (logo, nav items, CTAs)
   - Footer structure (columns, social, legal)
   - Button styles (radius, padding, colors)
5. Extract logo:
   - SVG paths if inline
   - Image URLs if raster
   - Computed dimensions and positioning

**Output:** Design specification document with all extracted values

### Phase 2: Font Resolution

```
/reskin fonts
```

**Actions:**
1. Identify proprietary fonts from analysis
2. Suggest open-source alternatives:
   - Match x-height, weight range, character width
   - Prioritize Google Fonts for easy integration
3. Generate font loading code for `document_head.hbs`

**Font Matching Database:**
| Proprietary | Alternative | Notes |
|-------------|-------------|-------|
| Vanilla Sans | DM Sans | Geometric, similar weights |
| Graphik | Inter | Neutral, extensive weights |
| Circular | Nunito Sans | Rounded geometric |
| Helvetica Neue | Source Sans Pro | Neo-grotesque |

### Phase 3: Token Generation

```
/reskin tokens
```

**Actions:**
1. Map extracted colors to Copenhagen token system:
   - `--color-surface` variants
   - `--color-text` variants
   - `--color-interactive`
   - `--color-border` variants
2. Generate `_tokens.scss` updates
3. Generate `manifest.json` default updates
4. Handle dark mode variants

### Phase 4: Header Generation

```
/reskin header
```

**Actions:**
1. Generate `header.hbs` template:
   - Logo (SVG inline or image reference)
   - Main navigation links (to target site sections)
   - User navigation (Help Center links)
   - CTA buttons with correct styling classes
   - Mobile menu structure
2. Generate `_header.scss` styles:
   - Exact colors (hardcoded for precision)
   - Logo sizing and positioning
   - Navigation link styles
   - Button styles (pill radius, colors)
   - Dark mode overrides if needed

**Critical Checks:**
- Only use valid Zendesk translation keys
- Validate all Handlebars helpers exist
- Test template syntax before upload

### Phase 5: Footer Generation

```
/reskin footer
```

**Actions:**
1. Generate `footer.hbs` template:
   - Column structure matching target
   - Mix of external links (to target site) and Help Center links
   - Social media icons (inline SVGs)
   - Legal links
   - Language selector
   - Copyright (hardcoded year, no dynamic helper)
2. Generate `_footer.scss` styles:
   - Background color (often dark)
   - Text colors for dark/light backgrounds
   - Link hover states
   - Grid layout for columns
   - Social icon styling

### Phase 6: Component Styling

```
/reskin components
```

**Actions:**
1. Update button styles (`_buttons.scss`):
   - Primary: brand color background
   - Border radius (pill or rounded)
   - Hover/focus states
2. Update form styles (`_forms.scss`):
   - Input borders and focus rings
   - Border radius
3. Update card/block styles (`_blocks.scss`):
   - Border radius
   - Shadow (often none/subtle)
   - Border colors
4. Update search styles (`_search.scss`)

### Phase 7: Validation & Preview

```
/reskin validate
```

**Actions:**
1. Syntax check all `.hbs` templates
2. Compile SCSS to verify no errors
3. Check for invalid translation keys
4. Verify all referenced assets exist
5. Run `yarn build` to catch errors
6. Start preview server

---

## Skill Implementation Details

### Required Tools/Capabilities

1. **Web Scraping:**
   - Fetch HTML with proper User-Agent
   - Parse inline styles and linked stylesheets
   - Extract computed style values (transform, scale, etc.)

2. **CSS Analysis:**
   - Parse CSS for color values
   - Identify font-family declarations
   - Extract shadow and border definitions

3. **SVG Handling:**
   - Extract inline SVG elements
   - Parse viewBox and path data
   - Calculate proper sizing

4. **Template Generation:**
   - Handlebars syntax awareness
   - Knowledge of valid Zendesk helpers
   - Translation key validation

5. **SCSS Generation:**
   - Token system awareness
   - Mixin usage (breakpoints, dark-mode)
   - Variable scoping

### Skill Prompt Structure

```markdown
<skill name="theme-reskin">

## Context
You are reskinning a Zendesk Copenhagen Help Center theme to match a target website.

## Available Commands
- /reskin analyze <url> - Analyze target website
- /reskin fonts - Resolve font alternatives
- /reskin tokens - Generate design tokens
- /reskin header - Generate header template and styles
- /reskin footer - Generate footer template and styles
- /reskin components - Update component styles
- /reskin validate - Validate and preview
- /reskin apply - Apply all changes

## Critical Rules

### Template Rules
1. ONLY use these translation keys: skip_navigation, user_navigation, toggle_navigation, sign_in, profile, activities, home_page
2. DO NOT use: current_year, global_navigation, or any custom helpers
3. Use hardcoded strings for custom text
4. External links go to target site, internal links use {{link 'helper'}}

### Color Rules
1. Extract exact hex values from target site
2. Use hardcoded colors in component SCSS for precision
3. CSS variables only for theme-wide tokens
4. Always handle dark mode for header (may need dark text)
5. Footer often needs inverted colors (dark bg, light text)

### Logo Rules
1. First try: Extract inline SVG with exact paths
2. Check viewBox dimensions carefully
3. Get computed size from target (check for transform: scale())
4. May need margin adjustments for vertical alignment
5. Test multiple sizes - don't assume first attempt is correct

### Font Rules
1. Identify proprietary fonts and find alternatives
2. Use Google Fonts with preconnect
3. Match weights carefully (400, 500, 600, 700)
4. Letter-spacing and line-height matter

### Validation Rules
1. Always run yarn build after changes
2. Watch for 400 errors from Zendesk API
3. If template fails, check for invalid helpers first
4. Verify SCSS compiles without errors

## Analysis Checklist

When analyzing a target site, extract:

### Colors
- [ ] Header background
- [ ] Footer background
- [ ] Page background
- [ ] Primary text color
- [ ] Secondary/muted text color
- [ ] Link color and hover state
- [ ] Primary button background
- [ ] Primary button text
- [ ] Border colors
- [ ] Focus ring color

### Typography
- [ ] Primary font family
- [ ] Heading font family (if different)
- [ ] Base font size
- [ ] Heading sizes (h1-h6)
- [ ] Font weights used
- [ ] Letter-spacing values

### Header
- [ ] Logo (SVG paths or image URL)
- [ ] Logo dimensions and positioning
- [ ] Navigation items and URLs
- [ ] CTA button text and style
- [ ] User menu structure
- [ ] Mobile menu pattern

### Footer
- [ ] Column count and headings
- [ ] Link categories
- [ ] Social media icons
- [ ] Legal links
- [ ] Copyright text
- [ ] Background color (often different from header)

### Components
- [ ] Button border-radius
- [ ] Input border-radius
- [ ] Card border-radius
- [ ] Shadow styles
- [ ] Hover effects (opacity, underline, color)

</skill>
```

---

## Example Workflow

```
User: /reskin analyze https://www.zendesk.com

Claude: Analyzing zendesk.com...

## Design Tokens Extracted

### Colors
- Header background: #FFFFFF
- Footer background: #030302
- Primary text: #11110D
- Accent/CTA: #D1F470
- CTA text: #11110D
- Borders: transparent (minimal use)

### Typography
- Font: Vanilla Sans → Alternative: DM Sans
- Weights: 400, 500, 700
- Base size: 16px

### Header Structure
- Logo: SVG wordmark (78.4 x 56, scale 0.84)
- Nav: Products, Solutions, Pricing, Resources, Company
- CTAs: Log in (text), Start free trial (lime button)

### Footer Structure
- 4 columns: Products, Resources, Company, [Help Center]
- Social: Facebook, Twitter, LinkedIn, YouTube, Instagram, TikTok
- Legal: Privacy, Terms, Cookies, Accessibility
- Background: Near-black (#030302)

Shall I proceed with generating the theme files?

User: Yes

Claude: [Generates all files with minimal iteration needed]
```

---

## File Structure for Skill

```
.claude/
└── commands/
    └── reskin.md          # Main skill definition
```

Or as MCP tool if more complex processing needed.

---

## Success Metrics

1. **Reduced Iterations:** Target 2-3 refinements vs 15+ in manual process
2. **Color Accuracy:** Exact hex match on first attempt
3. **Structure Match:** Header/footer structure correct on first generation
4. **Logo Handling:** Correct sizing within 2 attempts
5. **No Validation Errors:** Templates pass Zendesk API on first upload

---

## Future Enhancements

1. **Visual Diff Tool:** Screenshot comparison between target and result
2. **Component Library:** Pre-built patterns for common site structures
3. **Brand Guidelines Parser:** Extract from PDF brand guides
4. **A/B Testing:** Generate multiple variations for review
5. **Responsive Verification:** Check all breakpoints automatically
