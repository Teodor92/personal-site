---
name: teodorkurtev.com
description: Evolved neo-brutalism on cream paper, mounted in a server rack.
colors:
  signal-yellow: '#ffd23f'
  electric-blue: '#2447f5'
  electric-blue-lifted: '#6b86ff'
  cream-paper: '#fffbea'
  sunk-paper: '#f6efd3'
  plate-white: '#ffffff'
  ink: '#121110'
  ink-muted: '#3b3830'
  code-slab: '#16161a'
  dark-ground: '#15140f'
  dark-sunk: '#0f0e0b'
  dark-plate: '#211f19'
  paper-white-ink: '#f4efdc'
  dark-muted: '#c8c2ad'
  dark-inline-code: '#2a2821'
  dark-code-slab: '#0b0b0d'
  dark-rail: '#2e2b23'
  footer-slab-dark: '#29261e'
  footer-plate-dark: '#34302a'
  diagram-yellow: '#ffde59'
  diagram-pink: '#ff6b9d'
  diagram-cyan: '#5ce1e6'
  diagram-green: '#7ed957'
typography:
  display:
    fontFamily: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(3rem, 0.6rem + 11vw, 11rem)'
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: '-0.04em'
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(2.4rem, 1.7rem + 2.8vw, 3.6rem)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '-0.02em'
    fontVariation: "'wdth' 92"
  plate-title:
    fontFamily: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.8rem, 1.45rem + 1.4vw, 2.4rem)'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '-0.025em'
    fontVariation: "'wdth' 85"
  title:
    fontFamily: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.4rem, 1.2rem + 0.8vw, 1.75rem)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '-0.02em'
    fontVariation: "'wdth' 92"
  title-sm:
    fontFamily: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '-0.02em'
    fontVariation: "'wdth' 92"
  body-lead:
    fontFamily: "'Atkinson Hyperlegible Next Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "'Atkinson Hyperlegible Next Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)'
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 800
    lineHeight: 1.2
  data:
    fontFamily: "'Atkinson Hyperlegible Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: '0.875rem'
    fontWeight: 400
    fontFeature: "'tnum' 1"
rounded:
  sticker: '4px'
  plate: '6px'
  button: '7px'
  card: '8px'
  pill: '999px'
spacing:
  gutter: '1.25rem'
  card-y: '1.25rem'
  card-x: '1.4rem'
  plate-gap: '1.75rem'
  list-gap: '1.4rem'
  section: '4rem'
  page-top: '2.5rem'
  page-bottom: '5rem'
components:
  button-primary:
    backgroundColor: '{colors.signal-yellow}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.button}'
    padding: '0.6rem 1.35rem'
    height: '3.5rem'
  button-secondary:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.button}'
    padding: '0.6rem 1.35rem'
    height: '3.5rem'
  button-icon:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.button}'
    size: '2.4rem'
  button-icon-hover:
    backgroundColor: '{colors.signal-yellow}'
    textColor: '{colors.ink}'
  card:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.card}'
    padding: '1.25rem 1.4rem'
  faceplate:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    typography: '{typography.plate-title}'
    rounded: '{rounded.plate}'
    padding: '0.6rem 1rem'
    height: '4.5rem'
  pillar-ai:
    backgroundColor: '{colors.signal-yellow}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sticker}'
    padding: '0.05rem 0.4rem'
  pillar-homelab:
    backgroundColor: '{colors.electric-blue}'
    textColor: '{colors.plate-white}'
    rounded: '{rounded.sticker}'
    padding: '0.05rem 0.4rem'
  tag-pill:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: '0.3rem 1rem'
  tag-pill-hover:
    backgroundColor: '{colors.signal-yellow}'
    textColor: '{colors.ink}'
  nav-link:
    textColor: '{colors.ink}'
    rounded: '{rounded.plate}'
    padding: '0.4rem 0.7rem'
  nav-link-active:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.plate}'
    padding: '0.4rem 0.7rem'
  data-field:
    backgroundColor: '{colors.plate-white}'
    textColor: '{colors.ink}'
    typography: '{typography.data}'
    rounded: '{rounded.plate}'
    padding: '0.2rem 0.7rem'
    height: '2.4rem'
---

# Design System: teodorkurtev.com

## Overview

**Creative North Star: "The Rack on Paper"**

The site is a practitioner's workbench drawn in ink on cream paper. Everything is outlined (3px), filled flat, and lifted by a hard offset shadow with no blur; anything clickable presses down into its own shadow. The hardware vocabulary of a homelab is the ornament: section headings are mounted on 1U faceplates with screws and a vent grille, and on wide screens the page hangs between two rack rails punched at real 1U hole spacing. Beyond the rack, the only ornaments are paper ones: a taped photo print, a highlighter marker, hatching.

Colour is meaning, not decoration. Two hues carry it: signal yellow says "applied AI" and electric blue says "homelab". Everything without a pillar stays ink on paper. Density is comfortable and editorial: one reading column for prose, a wider home column for the evaluator path, generous gaps between sections and tight grouping inside a plate.

Dark mode is a dark rack, not an inversion: a warm near-black ground, paper-white ink for outlines and shadows, and the same two meaning colours (blue lifted so it still reads as text and outline).

**Key Characteristics:**

- Ink outlines at 3px on every surface that holds content; 2px on small parts (stickers, pills, bars, LEDs).
- Hard offset shadows in ink, or in the item's meaning colour.
- Press-in interaction: hover sinks part-way, active sinks fully onto the shadow.
- Two meaning colours only; the rest of the interface is ink, paper and white plates.
- Heavy, width-condensed grotesque display over a hyperlegible body; a mono voice for dates and figures.
- Server rack hardware (faceplates, screws, vents, LEDs, rails) as the main ornament.

## Colors

A near-monochrome ink-on-cream system with two meaning colours and nothing else in the interface.

### Primary

- **Signal Yellow** (`signal-yellow`): applied AI. Fills the primary action (Download CV), the TK brand plate, the role sticker, AI pillar stickers, the AI role bar and CV marker, selection, the reading progress bar, the skip link and every hover highlight (inline links, tag pills, icon buttons). Also the prose heading marker underline. Text on it is always ink.

### Secondary

- **Electric Blue** (`electric-blue`, lifted to `electric-blue-lifted` in dark): homelab. Appears as the hard shadow of homelab cards, the blue LED on faceplates, and the fill of the homelab pillar sticker (white text, 6.4:1). It is never a large surface.

### Neutral

- **Cream Paper** (`cream-paper`): page ground and header.
- **Sunk Paper** (`sunk-paper`): inline code, table headers, rail bodies, screw heads, scrollbar track.
- **Plate White** (`plate-white`): raised surfaces: cards, faceplates, panels, buttons, blockquotes.
- **Ink** (`ink`): text, every outline, every default shadow, the focus ring. Doubles as the on-fill text colour.
- **Ink Muted** (`ink-muted`): meta lines, captions, proof line, result lines. Clears 10:1 on paper.
- **Code Slab** (`code-slab`, `dark-code-slab` in dark): fenced code blocks are dark in both themes because the highlighter theme is github-dark.
- **Dark rack set**: `dark-ground`, `dark-sunk`, `dark-plate`, `paper-white-ink`, `dark-muted`, `dark-inline-code`, `dark-rail` map one-to-one onto the light roles above.
- **Closing slab**: the footer re-scopes the tokens locally: ink ground with cream text in light, `footer-slab-dark` with `footer-plate-dark` plates in dark, so shared buttons invert without footer-only copies.

### Diagram brights (content only)

- `diagram-yellow`, `diagram-pink`, `diagram-cyan`, `diagram-green` remain defined solely for the inline SVG diagrams inside existing post bodies. The interface never uses them.

### Named Rules

**The Meaning-Only Rule.** A colour other than ink, paper or white appears only when it states a pillar: yellow for applied AI, blue for homelab. An element with no pillar stays ink.

**The Blue-Is-An-Accent Rule.** Blue draws outlines, shadows, LEDs and labels. The only blue fill is the small homelab pillar sticker.

**The On-Fill Rule.** Text on yellow is always ink, never an accent colour. Text on a blue fill is white.

## Typography

**Display Font:** Bricolage Grotesque Variable (wdth axis loaded; falls back to system sans)
**Body Font:** Atkinson Hyperlegible Next Variable
**Label/Mono Font:** Atkinson Hyperlegible Mono Variable

**Character:** A heavy, condensed, slightly quirky grotesque does all the shouting at weight 800; a hyperlegible humanist sans does all the reading. Mono is the instrument readout.

### Hierarchy

- **Display** (800, poster scale up to 11rem, line-height 0.84, width 75%): the two-line name in the homepage hero only.
- **Headline** (800, `--text-3xl`, 1.15, width 92%; post titles tighten to width 85%, line-height 1.02): page h1.
- **Plate Title** (800, `--text-2xl`, 1, width 85%): section headings mounted on faceplates; also the footer's closing line (width 88%).
- **Title** (800, `--text-xl`): prose h2, featured card title. **Title-sm** (`--text-lg`): h3, list card titles, panel role titles.
- **Body** (400, fluid 1rem to 1.0625rem, line-height 1.7): all prose, inside a 42rem column. **Body-lead** (`--text-lg`, 1.6, max 36rem): the homepage pitch.
- **Label** (Bricolage 800): buttons, nav brand, stickers (0.75rem), onward buttons.
- **Data** (Atkinson Mono, tabular figures): dates, periods, years, axis ticks, the "now" pill, tag counts, the email address. Use the `time` element or `.data`.

### Named Rules

**The Width-Axis Rule.** Display type gets narrower as it gets bigger: 92% for headings, 85% for plates and post titles, 75% for the poster name. Condensing is how the display face stays heavy without sprawling.

**The Data-Voice Rule.** Anything a reader might compare (a date, a duration, a figure, an address) is set in mono with tabular figures.

**The Marker Rule.** Prose h2s carry a thick yellow marker underline behind the lower half of the line (0.4em). In dark the marker thins to 0.14em and drops below the baseline so paper-white text keeps contrast. Card titles and faceplate titles never carry it.

## Layout

A single centred column per page type, with the header and footer matching its width so left edges align: content 42rem (posts, prose), wide 52rem (CV, lists), home 62rem. Gutters are 1.25rem a side (`min(100% - 2.5rem, width)`). Main padding is 2.5rem top, 5rem bottom.

Rhythm: distinct sections sit 4rem apart; a faceplate hugs its own content (1.75rem below it); list cards stack at 1.4rem. The homepage hero is a two-column grid (name and intro left, a 16rem taped print right, 3rem gap) that keeps the print beside the name on phones at 7.5rem. Pillar post cards pair into two columns via a container query above 36rem.

Rack rails appear only at 1340px and wider: 22px rails, 88px outside the column, with three holes per 1.75in U. They never print and never take pointer events.

Responsive steps observed: 640px (hero reflow), 520px (header drops the name, keeps the TK plate), 420px and 360px (faceplate tightens, then sheds its screws), 380px (nav tightens). Touch screens (`pointer: coarse`) lift every control to a 44px target. Nothing overflows at 320px.

## Elevation & Depth

Depth is entirely structural: flat fills, ink outlines and hard offset shadows with zero blur. There are no ambient or soft shadows and no gradients for depth. A shadow's colour is the item's meaning (`--fill`): ink by default, yellow for AI, blue for homelab.

### Shadow Vocabulary

- **Pin** (`2px 2px 0` ink): tag pills in post headers.
- **Bar** (`3px 3px 0` ink): career bars, brand plate, tag cloud pills.
- **Button** (`4px 4px 0` ink): small brutal buttons, role sticker, skip link.
- **Plate** (`5px 5px 0` in `--fill`): cards, faceplates, career panel, blockquotes, code blocks, post images.
- **Lead** (`6px 6px 0` ink): the 56px primary and secondary contact buttons.
- **Feature** (`8px 8px 0` in `--fill`): the featured post card and the hero print.

### Named Rules

**The Press-In Rule.** Interactive surfaces move toward their shadow, never away from it: hover translates by 1 to 2px and shrinks the shadow by the same amount; active translates the full shadow distance to 0. Transitions are 80ms ease-out. Reduced motion removes the movement.

**The No-Blur Rule.** Every shadow has a blur radius of 0.

## Shapes

Gently rounded rectangles with heavy borders. Radius steps by part size: 4px for stickers and inline code, 6px for plates, nav pills, the data field and the brand mark, 7px for brutal buttons, 8px for cards, blockquotes, code blocks and images, fully round for tag pills and LEDs. Hardware details are drawn as SVG or gradients: round screws with a cross slot, a vent grille of 3px ink bars on an 8px pitch, 0.75rem LED dots, a 45 degree notch on the career panel pointing at its bar. Hatching (135 degree ink stripes) marks part-time career lanes; a dashed left edge marks a role that began before the axis. A dashed 2px rule separates a post card's measured result from its summary.

Resting tilt is reserved for the two hero objects: the photo print (2.5deg) under a strip of translucent masking tape, and the role sticker (-1.2deg). Nothing else sits at an angle.

## Components

### Buttons

Chunky and tactile: an outline you can push.

- **Shape:** 3px ink outline, 7px radius, ink shadow.
- **Primary:** signal yellow with ink text, display face at 800, 56px tall with a 6px shadow (contact actions). The CV page's PDF download uses the same yellow at small size.
- **Secondary:** plate white with ink text, same sizes.
- **Icon (theme toggle, socials, copy):** 2.4rem square (2.75rem on touch), plate white; the theme toggle turns yellow on hover.
- **Onward:** the faceplate's "next" button, plate white with an inline arrow drawn at 2.6 stroke.
- **Hover / Focus:** press-in per the Press-In Rule; focus is a 3px ink outline at 3px offset, keyboard only.

### Chips

- **Pillar sticker:** 2px outline, 4px radius, 0.75rem display 800. AI is yellow with ink text; homelab is blue with white text. Untagged stickers are plate white.
- **Tag pill:** fully round, 2px outline, small shadow, plate white; hover fills yellow and presses in. Counts are mono.

### Cards / Containers

- **Corner Style:** 8px.
- **Background:** plate white (dark plate in dark mode).
- **Shadow Strategy:** Plate shadow in the item's meaning colour; Feature shadow on the featured card.
- **Border:** 3px ink.
- **Internal Padding:** 1.25rem by 1.4rem.
- **Linked cards** press in as a whole; their titles are not underlined. A post card may end with a measured result above a dashed rule: the figure in bold ink, the context in muted text.

### Inputs / Fields

- **Data field:** the email address as a mono field: plate white, 3px outline, 6px radius, 2.4rem tall, selectable as one unit. With JavaScript, a Copy button joins its right edge on a shared seam and flashes yellow once copied.

### Navigation

- **Header:** cream ground, 3px ink bottom rule. Brand is a yellow 2.3rem TK plate with a 3px shadow beside the name in display 800. Links are bold small text that gain an outline and white plate on hover; the current page keeps the outline and adds a 3px underline so the cue never relies on colour.
- **Footer:** a dark slab in both themes, opening with a large display line where one phrase is highlighted in yellow, then the contact actions.

### Faceplate (signature)

Every major homepage section heading sits on a 1U plate: a screw at each end, the heading in Plate Title type, optional yellow and blue LEDs for the pillars a section covers, a vent grille filling the slack, and an onward button. Min height 4.5rem, white, 3px outline, 6px radius, Plate shadow.

### Career Track (signature)

A horizontal timeline of roles on a mono year axis with faint dashed gridlines. Bars are white plates with a 3px shadow; the AI role is yellow, the lead role has a 7px top border, side roles are hatched on lower lanes. A "now" line and ink pill act as the playhead, sweeping in on load. Picking a bar inverts it to ink and opens a white panel beneath with a notch, the role title, a mono period line, and highlights. Without JavaScript it is a native radio group and still works.

### Code and reading furniture

Code blocks are dark slabs with a 3px outline and Plate shadow; a yellow copy button with a stroked SVG icon appears on hover or focus. Blockquotes are white plates. Tables take a 3px outer and 2px inner ink grid with sunk headers. Posts show a 6px yellow reading progress bar with an ink underside.

## Do's and Don'ts

### Do:

- **Do** outline every content surface in 3px ink and give it a zero-blur offset shadow sized to its importance (2px to 8px).
- **Do** set an item's `--fill` from its pillar (`.is-ai`, `.is-lab`) so shadow and accents follow meaning automatically.
- **Do** make clickable surfaces press in on hover and active, and drop the movement under reduced motion.
- **Do** keep text on yellow in ink and text on a blue fill in white.
- **Do** set dates, periods, years and figures in Atkinson Hyperlegible Mono with tabular figures.
- **Do** condense display type as it grows, using the width axis (92%, 85%, 75%).
- **Do** give touch screens 44px targets and keep every page free of overflow at 320px.
- **Do** keep the print stylesheet neutral: black on white, shadows and chrome removed, meaning colours flattened.

### Don't:

- **Don't** use the diagram brights (yellow, pink, cyan, green) in the interface; they exist for post diagrams only.
- **Don't** fill a large surface with blue; it is an accent and a label colour.
- **Don't** add a colour that carries no pillar meaning.
- **Don't** blur a shadow or add a gradient for depth.
- **Don't** set anything at a resting angle other than the hero print and role sticker.
- **Don't** put the yellow marker underline on card or faceplate titles.
- **Don't** add ornament beyond the rack hardware (plates, screws, vents, LEDs, rails) and the paper set (taped print, marker, hatching).
