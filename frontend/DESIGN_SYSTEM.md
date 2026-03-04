# 🎨 LoanGuard Frontend - Design System & UI Guide

## Color Palette

### Primary Colors
- **Cyan Blue** `#0ea5e9` - Primary actions, highlights
- **Dark Navy** `#0f172a` - Background, cards
- **Dark Slate** `#1e293b` - Secondary background

### Semantic Colors
- **Success Green** `#22c55e` - Approved, positive actions
- **Warning Yellow** `#eab308` - Review, caution
- **Danger Red** `#ef4444` - Risky, negative actions

### Neutral Colors
- **White** `#ffffff` - Text on dark
- **Gray 400** `#9ca3af` - Secondary text
- **Gray 500** `#6b7280` - Disabled text

---

## Typography

```css
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

/* Heading Sizes */
h1: 36px, 700 weight (Titles)
h2: 24px, 700 weight (Section headers)
h3: 20px, 700 weight (Card headers)

/* Body Text */
Large: 16px, 400 weight
Normal: 14px, 400 weight
Small: 12px, 400 weight
```

---

## Components Overview

### 1. Buttons

#### Primary Button
```html
<!-- Large CTA buttons -->
<button class="btn btn-primary">Get Prediction</button>
<!-- Background: Cyan gradient -->
<!-- Hover: Darker cyan with shadow -->
```

#### Secondary Button
```html
<!-- Alternative actions -->
<button class="btn btn-secondary">Cancel</button>
<!-- Background: Dark with border -->
```

#### Ghost Button
```html
<!-- Subtle actions -->
<button class="btn btn-ghost">More Info</button>
<!-- Text only, hover highlight -->
```

### 2. Form Elements

#### Input Field
```html
<input type="text" class="input" placeholder="Enter value">
<!-- Dark background with light border -->
<!-- Focus: Cyan border + ring -->
```

#### Select Dropdown
```html
<select class="input">
  <option>Option 1</option>
</select>
<!-- Same styling as input -->
```

### 3. Cards

#### Base Card
```html
<div class="card">
  <!-- Content here -->
</div>
<!-- Dark background with border -->
<!-- Subtle shadow -->
```

#### Hover Card
```html
<div class="card-hover">
  <!-- Clickable content -->
</div>
<!-- Hover: Border changes to cyan, increased shadow -->
```

#### Glass Card
```html
<div class="glass">
  <!-- Content with blur effect -->
</div>
<!-- Frosted glass appearance -->
```

### 4. Badges

```html
<!-- Success Badge -->
<span class="badge badge-success">Approved</span>

<!-- Warning Badge -->
<span class="badge badge-warning">Review</span>

<!-- Danger Badge -->
<span class="badge badge-danger">Risky</span>
```

### 5. Navigation Bar

- **Sticky Position**: Stays at top on scroll
- **Glass Effect**: Translucent with backdrop blur
- **Mobile**: Hamburger menu at breakpoint 768px
- **Active State**: Cyan highlight for current page

---

## Layout System

### Grid System
```
Mobile: 1 column
Tablet: 2 columns (768px+)
Desktop: 3-4 columns (1024px+)
```

### Spacing Scale
```
2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
```

### Max Width Containers
```
Full width: No max
Content: 1024px (max-w-6xl)
Narrow: 384px (max-w-md)
```

---

## Animation Effects

### Fade In
```css
Fade In: 0.5s ease-in-out
Used for: Page load, content appearance
```

### Slide Up
```css
Slide Up: 0.5s ease-out
Used for: Modal appearance, result cards
```

### Pulse
```css
Pulse Soft: 2s infinite
Used for: Loading states, emphasis
```

### Transitions
```css
Default: 200ms color transition
Hover: Smooth scale/color changes
```

---

## Page Layouts

### Login/Register Pages
```
┌─────────────────────┐
│   Logo & Title      │
│  (Centered, Top)    │
├─────────────────────┤
│                     │
│    Form Card        │
│  (Max 400px)        │
│                     │
├─────────────────────┤
│   Links & Footer    │
└─────────────────────┘
```

### Dashboard Page
```
┌──────────────────────────────────────┐
│          Navbar (Sticky)             │
├──────────────────────────────────────┤
│ Header                               │
├──────────────────────────────────────┤
│  Stats Cards (4 columns on desktop)  │
├───────────────────┬──────────────────┤
│                   │                  │
│ Recent Predictions│  Quick Actions & │
│ (2/3 width)       │  Info (1/3)      │
│                   │                  │
└───────────────────┴──────────────────┘
```

### Prediction Page
```
┌──────────────────────────────────────┐
│          Navbar (Sticky)             │
├──────────────────────────────────────┤
│ Header                               │
├───────────────────┬──────────────────┤
│                   │                  │
│  Form Sections    │  Result Card     │
│  (2/3 width)      │  (1/3 width)     │
│  - Applicant      │                  │
│  - Loan Details   │  [Shows risk     │
│  - Assets         │   score & status]│
│  - Submit Button  │                  │
│                   │                  │
└───────────────────┴──────────────────┘
```

---

## Dark Theme Implementation

### Background Hierarchy
```
darkest:   #0f172a (page background)
dark:      #1e293b (card background)
darker:    #334155 (borders, secondary)
dark-hover:#475569 (hover states)
```

### Text Hierarchy
```
Primary:   #ffffff (white, main text)
Secondary: #e2e8f0 (light gray, secondary)
Tertiary:  #94a3b8 (medium gray, disabled)
Muted:     #64748b (dark gray, placeholders)
```

### Interactive States
```
Default: Gray text, dark background
Hover:   Lighter text, darker background + border highlight
Active:  Cyan accent color
Disabled: Reduced opacity (50%)
Loading: Spinner animation
```

---

## Icons (Lucide React)

### Used Icons
```
Login/Register:  Mail, Lock, Eye, User, ArrowRight
Navigation:      LayoutDashboard, Zap, History, LogOut
Dashboard:       Activity, TrendingUp, Target, Clock
Prediction:      Zap, Check, AlertCircle
History:         Search, Download, Filter, Trash2
Profile:         User, Shield, Bell, Lock
```

### Icon Sizing
```
Small:   16px (inline, list items)
Medium:  20px (form labels, nav)
Large:   24px (page headers)
XL:      40px (result status)
```

---

## Responsive Design

### Breakpoints
```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Mobile Optimizations
- **Hamburger Menu**: Navigation collapses to menu icon
- **Single Column**: All content in 1 column
- **Larger Touch Targets**: Buttons 44px+ height
- **Simplified Forms**: One field per row
- **Bottom Navigation**: Sticky footer option (future)

### Tablet Optimizations
- **Two Columns**: Main + sidebar layout
- **Wider Cards**: Better use of space
- **Grid Adjustments**: 2x2 or 2x3 grids

### Desktop Optimizations
- **Three+ Columns**: Full multi-column layouts
- **Sidebar Layouts**: Main content + sidebar
- **Advanced Grids**: 3x4 or custom layouts
- **Hover Effects**: Full interactive features

---

## Accessibility Features

### Color Contrast
- Text on background: >= 7:1 WCAG AAA
- Interactive elements: >= 4.5:1

### Keyboard Navigation
- Tab order: Logical flow through form
- Focus visible: Clear cyan border
- Enter to submit: Forms support Enter key

### Screen Readers
- Semantic HTML: Proper heading hierarchy
- ARIA Labels: Input descriptions
- Alt Text: Icon labels via title attributes

### Font Sizing
- Minimum 14px for body text
- Larger text for headings
- Support for browser zoom

---

## Loading States

### Spinner
```html
<div class="spinner"></div>
<!-- Rotating border animation -->
<!-- Used in buttons during submission -->
```

### Skeleton/Shimmer
```html
<div class="animate-shimmer"></div>
<!-- Placeholder while loading -->
```

### Loading Message
```html
<div class="flex items-center gap-2">
  <div class="spinner"></div>
  <span>Loading...</span>
</div>
```

---

## Error & Success States

### Success Toast
```
✓ Action successful!
Green background, auto-dismiss after 3 seconds
```

### Error Toast
```
✗ Error message here
Red background, can dismiss manually
```

### Inline Validation
```html
<!-- Error: Red text below input -->
<input class="border-danger-500">
<p class="text-danger-500 text-sm">Error message</p>
```

---

## Best Practices

### ✅ Do's
- Use consistent spacing (8px grid)
- Maintain color hierarchy
- Test on mobile devices
- Keep animations under 500ms
- Use semantic HTML
- Provide feedback for actions

### ❌ Don'ts
- Don't use too many colors
- Don't animate on every interaction
- Don't create layouts > 1400px wide
- Don't use placeholder as label
- Don't disable form submit without feedback
- Don't forget error states

---

## Custom CSS Classes

### Utility Classes
```css
.btn              /* Base button styles */
.btn-primary      /* Primary action button */
.btn-secondary    /* Secondary action button */
.btn-ghost        /* Text-only button */

.input            /* Form input styling */
.input:disabled   /* Disabled state */

.card             /* Base card styling */
.card-hover       /* Clickable card */
.glass            /* Glass morphism */

.badge            /* Badge base */
.badge-success    /* Green badge */
.badge-warning    /* Yellow badge */
.badge-danger     /* Red badge */

.spinner          /* Loading spinner */
.gradient-text    /* Gradient text effect */
```

---

## Theme Variables

### Can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: { 50: '...', 500: '...', 900: '...' },
  dark: { 50: '...', 900: '...' },
  success: { 50: '...', 500: '...' },
  warning: { 50: '...', 500: '...' },
  danger: { 50: '...', 500: '...' },
}

extend: {
  animation: { ... },
  keyframes: { ... },
  fontFamily: { ... },
}
```

---

## Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Custom color scheme selector
- [ ] Animation preference (prefers-reduced-motion)
- [ ] Advanced data visualization (charts)
- [ ] Real-time notifications
- [ ] Mobile app version
- [ ] Offline capability
- [ ] PWA features

---

This design system ensures consistency and professional appearance across the entire LoanGuard platform! 🚀
