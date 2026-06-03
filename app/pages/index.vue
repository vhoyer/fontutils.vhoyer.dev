<script setup lang="ts">
useSeoMeta({
  title: 'Font Utils — Free Online Font File Converter & Tools',
  description:
    'Free browser-based font utilities. Convert font files to uppercase-only, subset fonts by character set, and more. No uploads — everything runs locally in your browser.',
  ogTitle: 'Font Utils — Convert Font Files Online',
  ogDescription:
    'Convert font files to uppercase-only and more free browser-based font tools. No server upload required.',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Font Utils',
        description:
          'Free browser-based font utilities. Convert font files to uppercase-only, subset glyphs, and transform typefaces.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }),
    },
  ],
})

const tools = [
  {
    id: 'to_upper',
    slug: '/tools/to_upper',
    name: 'Uppercase Only',
    tagline: 'Convert font file to uppercase only',
    description:
      'Strip a font file down to uppercase glyphs A–Z only. Dramatically reduces file size — ideal for display fonts, headlines, and logos rendered in all-caps.',
    icon: 'i-heroicons-arrow-up-circle',
    tag: 'Subset',
    formats: ['TTF', 'OTF', 'WOFF', 'WOFF2'],
  },
]

const features = [
  {
    icon: 'i-heroicons-lock-closed',
    title: 'Private by Design',
    body: 'Font files never leave your device. All processing happens client-side — no server upload, no data collection.',
  },
  {
    icon: 'i-heroicons-bolt',
    title: 'Instant Results',
    body: 'No queue. No waiting. Process font files in milliseconds using native browser capabilities.',
  },
  {
    icon: 'i-heroicons-code-bracket',
    title: 'Open Source',
    body: 'Every tool is open source and auditable. Fork it, self-host it, or contribute new font utilities.',
  },
]
</script>

<template>
  <div class="page-root">
    <!-- Navigation -->
    <header class="site-nav">
      <NuxtLink to="/" class="nav-logo">
        <span class="logo-text">font</span><span class="logo-dot">.</span><span class="logo-text">utils</span>
      </NuxtLink>
      <nav class="nav-actions">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          to="https://github.com"
          target="_blank"
          leading-icon="i-heroicons-code-bracket"
        >
          Source
        </UButton>
      </nav>
    </header>

    <!-- Hero -->
    <section class="hero" aria-label="Font Utils — browser-based font file tools">
      <!-- Decorative background letterform -->
      <div aria-hidden="true" class="hero-watermark">Aa</div>

      <div class="hero-inner">
        <!-- Left: copy -->
        <div class="hero-copy">
          <UBadge
            label="Browser-Native Font Tools"
            color="primary"
            variant="outline"
            class="hero-badge"
          />
          <h1 class="hero-title">
            Font<br /><em>Utilities</em>
          </h1>
          <p class="hero-subtitle">
            Convert font files to uppercase-only, subset by character set, and transform typefaces —
            all running directly in your browser. No uploads, no servers, no waiting.
          </p>
          <div class="hero-cta">
            <UButton
              to="/tools/to_upper"
              size="xl"
              trailing-icon="i-heroicons-arrow-right"
            >
              Try Uppercase Tool
            </UButton>
            <UButton variant="ghost" color="neutral" size="xl">
              Browse All Tools
            </UButton>
          </div>
        </div>

        <!-- Right: before/after visual -->
        <div class="hero-visual" aria-hidden="true">
          <div class="transform-demo">
            <div class="demo-before">abc</div>
            <div class="demo-divider">
              <span class="demo-arrow">→</span>
              <span class="demo-label">uppercase only</span>
            </div>
            <div class="demo-after">ABC</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tools grid -->
    <section class="tools-section" aria-labelledby="tools-heading">
      <div class="section-wrap">
        <div class="section-header">
          <span class="section-eyebrow">Available Tools</span>
          <h2 id="tools-heading" class="section-title">What You Can Do</h2>
        </div>

        <div class="tools-grid">
          <NuxtLink
            v-for="tool in tools"
            :key="tool.id"
            :to="tool.slug"
            class="tool-card"
          >
            <div class="tool-card-top">
              <div class="tool-icon-wrap">
                <UIcon :name="tool.icon" class="tool-icon" />
              </div>
              <UBadge :label="tool.tag" color="primary" variant="soft" size="xs" />
            </div>
            <h3 class="tool-name">{{ tool.name }}</h3>
            <p class="tool-tagline">{{ tool.tagline }}</p>
            <p class="tool-desc">{{ tool.description }}</p>
            <div class="tool-formats">
              <span class="formats-label">Supports:</span>
              <UBadge
                v-for="fmt in tool.formats"
                :key="fmt"
                :label="fmt"
                color="neutral"
                variant="outline"
                size="xs"
              />
            </div>
          </NuxtLink>

          <!-- Placeholder card for upcoming tools -->
          <div class="tool-card tool-card--placeholder">
            <div class="placeholder-inner">
              <UIcon name="i-heroicons-plus-circle" class="placeholder-icon" />
              <p class="placeholder-text">More tools coming soon</p>
              <p class="placeholder-sub">Lowercase only, digit subset, glyph inspector…</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section" aria-labelledby="features-heading">
      <div class="section-wrap">
        <h2 id="features-heading" class="sr-only">Why Font Utils</h2>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-item">
            <div class="feature-icon-wrap">
              <UIcon :name="f.icon" class="feature-icon" />
            </div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-body">{{ f.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="section-wrap footer-inner">
        <span class="footer-logo">font.utils</span>
        <span class="footer-note">Free browser-based font tools — no signup required</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── Layout ────────────────────────────────────────── */
.page-root {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
}

.section-wrap {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Navigation ────────────────────────────────────── */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(11, 10, 9, 0.85);
  backdrop-filter: blur(12px);
  max-width: 100%;
}

.nav-logo {
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  letter-spacing: -0.02em;
}

.logo-text {
  color: var(--text-primary);
}

.logo-dot {
  color: var(--accent-orange);
}

/* ── Hero ──────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 6rem 1.5rem 4rem;
}

.hero-watermark {
  position: absolute;
  right: -2vw;
  top: 50%;
  transform: translateY(-55%);
  font-family: var(--font-display);
  font-size: 40vw;
  font-weight: 900;
  line-height: 1;
  color: var(--text-primary);
  opacity: 0.018;
  pointer-events: none;
  user-select: none;
  letter-spacing: -0.05em;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 72rem;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr 1fr;
  }
}

.hero-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(4.5rem, 9vw, 8rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0 0 1.75rem;
}

.hero-title em {
  font-style: italic;
  color: var(--accent-orange);
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.65;
  color: var(--text-muted);
  max-width: 44ch;
  margin: 0 0 2.5rem;
}

.hero-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ── Before/after demo ─────────────────────────────── */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.transform-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.demo-before {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 6vw, 5.5rem);
  font-weight: 700;
  color: var(--text-subtle);
  text-decoration: line-through;
  text-decoration-color: rgba(74, 68, 56, 0.6);
  line-height: 1;
  letter-spacing: 0.05em;
}

.demo-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0;
}

.demo-arrow {
  font-size: 2rem;
  color: var(--text-subtle);
  animation: pulse-arrow 2.4s ease-in-out infinite;
}

.demo-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.demo-after {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 6vw, 5.5rem);
  font-weight: 900;
  color: var(--accent-orange);
  line-height: 1;
  letter-spacing: 0.05em;
  filter: drop-shadow(0 0 48px var(--accent-glow));
  animation: glow-pulse 2.4s ease-in-out infinite;
}

@keyframes pulse-arrow {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(3px); }
}

@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 32px rgba(249, 115, 22, 0.2)); }
  50% { filter: drop-shadow(0 0 64px rgba(249, 115, 22, 0.45)); }
}

/* ── Tools section ─────────────────────────────────── */
.tools-section {
  padding: 6rem 0;
  border-top: 1px solid var(--border-subtle);
}

.section-header {
  margin-bottom: 3rem;
}

.section-eyebrow {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  gap: 1.25rem;
}

.tool-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.tool-card:hover {
  border-color: rgba(249, 115, 22, 0.35);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.12), 0 8px 32px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.tool-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-icon-wrap {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.tool-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent-orange);
}

.tool-name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.tool-tagline {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--accent-orange);
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.tool-desc {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-muted);
  flex: 1;
}

.tool-formats {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.formats-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-subtle);
  letter-spacing: 0.1em;
}

/* Placeholder card */
.tool-card--placeholder {
  cursor: default;
  opacity: 0.4;
}

.tool-card--placeholder:hover {
  border-color: var(--border-subtle);
  box-shadow: none;
  transform: none;
}

.placeholder-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 0;
  text-align: center;
}

.placeholder-icon {
  width: 2rem;
  height: 2rem;
  color: var(--text-subtle);
}

.placeholder-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.placeholder-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-subtle);
}

/* ── Features section ──────────────────────────────── */
.features-section {
  padding: 6rem 0;
  border-top: 1px solid var(--border-subtle);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 2.5rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-icon-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
}

.feature-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent-orange);
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-body {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-muted);
}

/* ── Footer ────────────────────────────────────────── */
.site-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 2rem 0;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-logo {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-subtle);
}

.footer-note {
  font-size: 0.75rem;
  color: var(--text-subtle);
}
</style>
