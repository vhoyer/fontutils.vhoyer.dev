<script setup lang="ts">
useSeoMeta({
  title: 'Convert Font to Uppercase Only — Font Utils',
  description:
    'Upload a TTF, OTF, WOFF, or WOFF2 font file and download a new version containing only uppercase glyphs (A–Z). Free, browser-based — no server upload required.',
  ogTitle: 'Convert Font File to Uppercase Only — Font Utils',
  ogDescription:
    'Strip a font file down to uppercase glyphs only. Reduces file size significantly for all-caps display fonts. Works entirely in your browser.',
  robots: 'index, follow',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Font Uppercase Converter',
        description:
          'Convert font files to uppercase-only by removing all non-uppercase glyphs. Free and browser-based.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }),
    },
  ],
})

const ACCEPTED_EXTS = ['.ttf', '.otf', '.woff', '.woff2']
const ACCEPTED_MIME = 'font/ttf,font/otf,font/woff,font/woff2,application/octet-stream'

const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isProcessing = ref(false)
const resultUrl = ref<string | null>(null)
const resultName = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const fileSize = computed(() => {
  if (!selectedFile.value) return ''
  const b = selectedFile.value.size
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
})

const fileExt = computed(() => {
  if (!selectedFile.value) return ''
  return selectedFile.value.name.split('.').pop()?.toUpperCase() ?? ''
})

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) setFile(input.files[0])
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  const name = file.name.toLowerCase()
  const valid = ACCEPTED_EXTS.some((ext) => name.endsWith(ext))
  if (!valid) {
    errorMessage.value = `Unsupported file type. Please upload a TTF, OTF, WOFF, or WOFF2 file.`
    return
  }
  selectedFile.value = file
  resultUrl.value = null
  resultName.value = null
  errorMessage.value = null
}

async function processFont() {
  if (!selectedFile.value) return
  isProcessing.value = true
  errorMessage.value = null
  try {
    // TODO: implement with opentype.js or a WASM font subsetter
    await new Promise((r) => setTimeout(r, 800))
    errorMessage.value = 'Font processing is not yet implemented. Check back soon!'
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'An unexpected error occurred during processing.'
  } finally {
    isProcessing.value = false
  }
}

function reset() {
  selectedFile.value = null
  resultUrl.value = null
  resultName.value = null
  errorMessage.value = null
  isProcessing.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div class="tool-page">
    <!-- Nav -->
    <header class="tool-nav">
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        to="/"
        leading-icon="i-heroicons-arrow-left"
      >
        All Tools
      </UButton>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/" class="breadcrumb-item">Font Utils</NuxtLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Uppercase Only</span>
      </nav>
    </header>

    <main class="tool-main">
      <!-- Tool header -->
      <div class="tool-header">
        <UBadge label="Font Subsetting" color="primary" variant="soft" class="tool-badge" />
        <h1 class="tool-title">
          Convert Font to<br /><em>Uppercase Only</em>
        </h1>
        <p class="tool-description">
          Upload a font file and download a stripped version containing only uppercase glyphs
          (A–Z). Removing unused glyphs can reduce file size by 60–80% — ideal for all-caps
          display fonts, logo lockups, and headline typefaces.
        </p>

        <div class="tool-meta">
          <div class="meta-item">
            <UIcon name="i-heroicons-lock-closed" class="meta-icon" />
            <span>Processed locally — no upload to servers</span>
          </div>
          <div class="meta-item">
            <UIcon name="i-heroicons-bolt" class="meta-icon" />
            <span>Supports TTF, OTF, WOFF, WOFF2</span>
          </div>
        </div>
      </div>

      <!-- Upload zone -->
      <div class="upload-section">
        <div
          class="dropzone"
          :class="{ 'dropzone--active': isDragging, 'dropzone--filled': !!selectedFile }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="!selectedFile && openFilePicker()"
          role="button"
          :aria-label="selectedFile ? 'Font file selected' : 'Click or drag to upload a font file'"
          tabindex="0"
          @keydown.enter="!selectedFile && openFilePicker()"
          @keydown.space.prevent="!selectedFile && openFilePicker()"
        >
          <input
            ref="fileInputRef"
            type="file"
            :accept="ACCEPTED_MIME"
            class="sr-only"
            @change="handleFileInput"
            aria-hidden="true"
          />

          <!-- Empty state -->
          <div v-if="!selectedFile" class="dropzone-empty">
            <div class="dropzone-icon-ring">
              <UIcon name="i-heroicons-arrow-up-tray" class="dropzone-icon" />
            </div>
            <p class="dropzone-title">Drop your font file here</p>
            <p class="dropzone-sub">or click to browse — TTF, OTF, WOFF, WOFF2</p>
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              class="dropzone-btn"
              @click.stop="openFilePicker"
            >
              Choose File
            </UButton>
          </div>

          <!-- File selected state -->
          <div v-else class="dropzone-filled">
            <div class="file-preview">
              <div class="file-icon-wrap">
                <UIcon name="i-heroicons-document-text" class="file-icon" />
              </div>
              <div class="file-info">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-meta">
                  <UBadge :label="fileExt" color="primary" variant="soft" size="xs" />
                  <span class="file-size">{{ fileSize }}</span>
                </p>
              </div>
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-heroicons-x-mark"
                @click.stop="reset"
                aria-label="Remove file"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Options -->
      <div v-if="selectedFile" class="options-section">
        <h2 class="options-title">
          <UIcon name="i-heroicons-adjustments-horizontal" class="options-icon" />
          Options
        </h2>
        <div class="options-grid">
          <div class="option-item option-item--disabled">
            <div class="option-info">
              <p class="option-label">Preserve punctuation</p>
              <p class="option-hint">Keep common punctuation glyphs (. , ! ? – …)</p>
            </div>
            <UBadge label="Soon" color="neutral" variant="outline" size="xs" />
          </div>
          <div class="option-item option-item--disabled">
            <div class="option-info">
              <p class="option-label">Preserve digits</p>
              <p class="option-hint">Keep numeric glyphs 0–9 in the output font</p>
            </div>
            <UBadge label="Soon" color="neutral" variant="outline" size="xs" />
          </div>
        </div>
      </div>

      <!-- Action -->
      <div v-if="selectedFile" class="action-section">
        <UButton
          size="xl"
          :loading="isProcessing"
          :disabled="isProcessing"
          leading-icon="i-heroicons-arrow-up-circle"
          @click="processFont"
        >
          {{ isProcessing ? 'Converting…' : 'Convert to Uppercase Only' }}
        </UButton>
        <UButton
          v-if="!isProcessing"
          variant="ghost"
          color="neutral"
          size="xl"
          @click="reset"
        >
          Clear
        </UButton>
      </div>

      <!-- Error -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        leading-icon="i-heroicons-exclamation-circle"
        class="feedback-alert"
      />

      <!-- Result -->
      <div v-if="resultUrl" class="result-section">
        <div class="result-card">
          <div class="result-icon-wrap">
            <UIcon name="i-heroicons-check-circle" class="result-icon" />
          </div>
          <div class="result-info">
            <p class="result-title">Conversion complete</p>
            <p class="result-sub">{{ resultName }}</p>
          </div>
          <UButton
            :href="resultUrl"
            :download="resultName"
            leading-icon="i-heroicons-arrow-down-tray"
          >
            Download
          </UButton>
        </div>
      </div>

      <!-- Info section (SEO-friendly description) -->
      <aside class="info-section" aria-label="About this tool">
        <h2 class="info-title">About: Convert Font File to Uppercase Only</h2>
        <div class="info-body">
          <p>
            Font subsetting is the process of removing glyphs from a font file that you don't need
            for a specific use case. When your design uses a typeface exclusively in uppercase — for
            example, a header font or a display typeface for a logo — you can safely remove all
            lowercase, punctuation, and symbol glyphs.
          </p>
          <p>
            This tool produces a font file containing only the 26 uppercase Latin glyphs
            (<strong>A–Z</strong>), plus the font's metadata. The resulting file is significantly
            smaller, which means faster page loads when used as a web font.
          </p>
          <h3>Use cases for uppercase-only fonts</h3>
          <ul>
            <li>All-caps headline typefaces on landing pages</li>
            <li>Logo and wordmark fonts embedded on a website</li>
            <li>Display fonts used only for chapter headings or section titles</li>
            <li>Icon fonts or decorative display usage</li>
          </ul>
          <h3>Supported formats</h3>
          <p>
            This tool supports <strong>TTF</strong> (TrueType), <strong>OTF</strong> (OpenType),
            <strong>WOFF</strong>, and <strong>WOFF2</strong> font files. The output format matches
            the input format.
          </p>
        </div>
      </aside>
    </main>

    <!-- Footer -->
    <footer class="tool-footer">
      <NuxtLink to="/" class="footer-logo">font.utils</NuxtLink>
      <span class="footer-note">Free browser-based font tools</span>
    </footer>
  </div>
</template>

<style scoped>
/* ── Layout ────────────────────────────────────────── */
.tool-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

.tool-main {
  flex: 1;
  max-width: 52rem;
  margin: 0 auto;
  width: 100%;
  padding: 3rem 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ── Navigation ────────────────────────────────────── */
.tool-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(11, 10, 9, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-subtle);
}

.breadcrumb-item {
  color: var(--text-subtle);
  text-decoration: none;
}

.breadcrumb-item:hover {
  color: var(--text-muted);
}

.breadcrumb-sep {
  color: var(--text-subtle);
  opacity: 0.4;
}

.breadcrumb-current {
  color: var(--text-muted);
}

/* ── Tool header ───────────────────────────────────── */
.tool-header {
  padding-top: 1rem;
}

.tool-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}

.tool-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
}

.tool-title em {
  font-style: italic;
  color: var(--accent-orange);
}

.tool-description {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 56ch;
  margin: 0 0 1.5rem;
}

.tool-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-subtle);
  letter-spacing: 0.03em;
}

.meta-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--accent-orange);
  opacity: 0.7;
}

/* ── Dropzone ──────────────────────────────────────── */
.dropzone {
  border: 1.5px dashed var(--border-subtle);
  border-radius: 1rem;
  background: var(--bg-card);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  outline: none;
}

.dropzone:focus-visible {
  box-shadow: 0 0 0 2px var(--accent-orange);
}

.dropzone--active {
  border-color: rgba(249, 115, 22, 0.6);
  background: rgba(249, 115, 22, 0.04);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.08), inset 0 0 40px rgba(249, 115, 22, 0.04);
}

.dropzone--filled {
  cursor: default;
  border-style: solid;
  border-color: rgba(249, 115, 22, 0.25);
}

.dropzone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  text-align: center;
}

.dropzone-icon-ring {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 1.5px dashed var(--text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  transition: border-color 0.2s ease;
}

.dropzone--active .dropzone-icon-ring {
  border-color: var(--accent-orange);
}

.dropzone-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-subtle);
  transition: color 0.2s ease;
}

.dropzone--active .dropzone-icon {
  color: var(--accent-orange);
}

.dropzone-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dropzone-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
}

.dropzone-btn {
  margin-top: 0.5rem;
}

/* ── File selected ─────────────────────────────────── */
.dropzone-filled {
  padding: 1.5rem;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--accent-orange);
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.file-size {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-subtle);
}

/* ── Options ───────────────────────────────────────── */
.options-section {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  padding: 1.5rem;
}

.options-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.options-icon {
  width: 1rem;
  height: 1rem;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.option-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.option-item--disabled {
  opacity: 0.5;
}

.option-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.option-hint {
  font-size: 0.75rem;
  color: var(--text-subtle);
  margin-top: 0.15rem;
}

/* ── Action ────────────────────────────────────────── */
.action-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ── Feedback ──────────────────────────────────────── */
.feedback-alert {
  /* UAlert uses its own sizing */
}

/* ── Result ────────────────────────────────────────── */
.result-section {
  animation: slide-in 0.3s ease;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 1rem;
}

.result-icon-wrap {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent-orange);
}

.result-info {
  flex: 1;
}

.result-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.result-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* ── Info section ──────────────────────────────────── */
.info-section {
  border-top: 1px solid var(--border-subtle);
  padding-top: 2.5rem;
}

.info-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.info-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--text-muted);
}

.info-body h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.5rem;
}

.info-body ul {
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-body strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* ── Footer ────────────────────────────────────────── */
.tool-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-logo {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-subtle);
  text-decoration: none;
}

.footer-note {
  font-size: 0.75rem;
  color: var(--text-subtle);
}

/* ── Animations ────────────────────────────────────── */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
