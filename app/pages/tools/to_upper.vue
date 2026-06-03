<script setup lang="ts">
useSeoMeta({
  title: 'Convert Font to Uppercase — Font Utils',
  description:
    'Upload a TTF, OTF, WOFF, or WOFF2 font file and get a version where all lowercase letters are remapped to their uppercase glyphs. Digits and punctuation are preserved. Free, browser-based.',
  ogTitle: 'Convert Font to Uppercase Mapping — Font Utils',
  ogDescription:
    'Remap all lowercase characters in a font file to their uppercase equivalents. Digits, punctuation, and accented characters are fully preserved.',
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
          'Remap all lowercase characters in a font file to their uppercase equivalents. Free and browser-based.',
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
const resultSize = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Preview
const previewText = ref('The Quick Brown Fox — Áéîõü 123!')
const originalFontFamily = ref<string | null>(null)
const resultFontFamily = ref<string | null>(null)
const originalFontUrl = ref<string | null>(null)

// Tracked FontFace objects for cleanup
const loadedFaces = ref<FontFace[]>([])

const fileSize = computed(() => formatBytes(selectedFile.value?.size))
const fileExt = computed(() => selectedFile.value?.name.split('.').pop()?.toUpperCase() ?? '')

function formatBytes(n?: number): string {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

async function loadFontFace(url: string, family: string) {
  const face = new FontFace(family, `url(${url})`)
  await face.load()
  document.fonts.add(face)
  loadedFaces.value.push(face)
  return face
}

function removeFontFaces(family: string) {
  loadedFaces.value = loadedFaces.value.filter((f) => {
    if (f.family === family) {
      document.fonts.delete(f)
      return false
    }
    return true
  })
}

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

async function setFile(file: File) {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTS.some((ext) => name.endsWith(ext))) {
    errorMessage.value = 'Unsupported file type. Please upload a TTF, OTF, WOFF, or WOFF2 file.'
    return
  }
  selectedFile.value = file
  resultUrl.value = null
  resultName.value = null
  resultSize.value = null
  errorMessage.value = null

  // Load original font for preview
  if (originalFontUrl.value) URL.revokeObjectURL(originalFontUrl.value)
  if (originalFontFamily.value) removeFontFaces(originalFontFamily.value)

  const family = `fu-orig-${Date.now()}`
  const url = URL.createObjectURL(file)
  originalFontUrl.value = url
  originalFontFamily.value = family

  try {
    await loadFontFace(url, family)
  } catch {
    // preview load failed silently — font still usable for conversion
  }
}

async function processFont() {
  if (!selectedFile.value) return
  isProcessing.value = true
  errorMessage.value = null

  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = null
    resultName.value = null
    resultSize.value = null
  }
  if (resultFontFamily.value) removeFontFaces(resultFontFamily.value)

  try {
    const opentype = await import('opentype.js')
    const buffer = await selectedFile.value.arrayBuffer()
    const font = opentype.parse(buffer)

    const cmapMap = (font.tables.cmap as any).glyphIndexMap as Record<string, number>

    // Build: glyphIndex (in original font) → Set of unicode codepoints for the new font.
    // Strategy: for every lowercase character, redirect its codepoint to the uppercase glyph
    // so typing 'a' renders the same shape as 'A'. All non-letter glyphs are preserved as-is.
    const glyphUnicodes = new Map<number, Set<number>>()
    glyphUnicodes.set(0, new Set()) // notdef always at position 0, no unicodes

    for (const [key, glyphIdx] of Object.entries(cmapMap)) {
      const code = parseInt(key)
      if (isNaN(code) || glyphIdx === 0) continue

      const char = String.fromCodePoint(code)
      const upper = char.toUpperCase()

      if (upper !== char && upper.length === 1) {
        // Single-char lowercase → find the uppercase glyph and map this codepoint to it
        const upperCode = upper.codePointAt(0)!
        const upperGlyphIdx = cmapMap[upperCode]

        if (upperGlyphIdx && upperGlyphIdx !== 0) {
          if (!glyphUnicodes.has(upperGlyphIdx)) glyphUnicodes.set(upperGlyphIdx, new Set())
          glyphUnicodes.get(upperGlyphIdx)!.add(upperCode)
          glyphUnicodes.get(upperGlyphIdx)!.add(code)
        } else {
          // No uppercase glyph exists — keep the glyph as-is
          if (!glyphUnicodes.has(glyphIdx)) glyphUnicodes.set(glyphIdx, new Set())
          glyphUnicodes.get(glyphIdx)!.add(code)
        }
      } else {
        // Uppercase letter, digit, punctuation, symbol — keep as-is
        if (!glyphUnicodes.has(glyphIdx)) glyphUnicodes.set(glyphIdx, new Set())
        glyphUnicodes.get(glyphIdx)!.add(code)
      }
    }

    // notdef first, then the rest in ascending glyph-index order
    const orderedIndices = [0, ...Array.from(glyphUnicodes.keys()).filter((i) => i !== 0).sort((a, b) => a - b)]

    // Create clean Glyph objects — explicitly force path resolution so the CFF serializer
    // gets a plain Path with .commands, not the TrueType lazy-loader function.
    const subsetGlyphs = orderedIndices.map((origIdx) => {
      const src = font.glyphs.get(origIdx)
      const resolvedPath = src.path // triggers lazy TrueType path builder
      const unicodes = Array.from(glyphUnicodes.get(origIdx) ?? []).sort((a, b) => a - b)
      const primary = unicodes[0]
      return new opentype.Glyph({
        name:
          src.name ||
          (primary !== undefined
            ? `uni${primary.toString(16).toUpperCase().padStart(4, '0')}`
            : '.notdef'),
        unicode: primary,
        unicodes,
        advanceWidth: src.advanceWidth ?? 0,
        leftSideBearing: src.leftSideBearing ?? 0,
        path: resolvedPath,
      })
    })

    const names = font.names as Record<string, any>
    const nameStr = (n: any) =>
      String(typeof n === 'object' ? (n?.en ?? Object.values(n ?? {})[0] ?? '') : (n ?? ''))

    const newFont = new opentype.Font({
      familyName: nameStr(names.fontFamily) || 'Font',
      styleName: nameStr(names.fontSubfamily) || 'Regular',
      unitsPerEm: font.unitsPerEm,
      ascender: font.ascender,
      descender: font.descender,
      glyphs: subsetGlyphs,
    })

    const outBuffer = newFont.toArrayBuffer()
    const blob = new Blob([outBuffer], { type: 'font/ttf' })
    const url = URL.createObjectURL(blob)

    resultUrl.value = url
    resultName.value = `${selectedFile.value.name.replace(/\.[^.]+$/, '')}-uppercase.ttf`
    resultSize.value = formatBytes(blob.size)

    // Load result font for preview
    const resultFamily = `fu-result-${Date.now()}`
    resultFontFamily.value = resultFamily
    try {
      await loadFontFace(url, resultFamily)
    } catch {
      // preview load failed silently
    }
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'An unexpected error occurred during processing.'
  } finally {
    isProcessing.value = false
  }
}

function reset() {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  if (originalFontUrl.value) URL.revokeObjectURL(originalFontUrl.value)
  loadedFaces.value.forEach((f) => document.fonts.delete(f))
  loadedFaces.value = []

  selectedFile.value = null
  resultUrl.value = null
  resultName.value = null
  resultSize.value = null
  errorMessage.value = null
  originalFontFamily.value = null
  originalFontUrl.value = null
  resultFontFamily.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

onUnmounted(() => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  if (originalFontUrl.value) URL.revokeObjectURL(originalFontUrl.value)
  loadedFaces.value.forEach((f) => document.fonts.delete(f))
})
</script>

<template>
  <div class="tool-page">
    <!-- Nav -->
    <header class="tool-nav">
      <UButton variant="ghost" color="neutral" size="sm" to="/" leading-icon="i-heroicons-arrow-left">
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
        <UBadge label="Font Remapping" color="primary" variant="soft" class="tool-badge" />
        <h1 class="tool-title">
          Convert Font to<br /><em>Uppercase Only</em>
        </h1>
        <p class="tool-description">
          Upload a font file and get a version where every lowercase letter renders as its uppercase
          equivalent — so typing <span class="code-sample">abc</span> looks like
          <span class="code-sample">ABC</span>. Digits, punctuation, accented characters, and all
          other glyphs are fully preserved.
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
            <UButton variant="outline" color="neutral" size="sm" class="dropzone-btn" @click.stop="openFilePicker">
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
              <UButton variant="ghost" color="neutral" size="xs" icon="i-heroicons-x-mark" @click.stop="reset" aria-label="Remove file" />
            </div>
          </div>
        </div>
      </div>

      <!-- Font preview (shown after file selected) -->
      <div v-if="selectedFile" class="preview-section">
        <div class="preview-header">
          <h2 class="preview-title">
            <UIcon name="i-heroicons-eye" class="preview-title-icon" />
            Font Preview
          </h2>
          <div class="preview-input-wrap">
            <input
              v-model="previewText"
              class="preview-input"
              type="text"
              placeholder="Type preview text…"
              aria-label="Preview text"
              maxlength="120"
            />
          </div>
        </div>

        <div class="preview-panels" :class="{ 'preview-panels--dual': !!resultFontFamily }">
          <!-- Before -->
          <div class="preview-panel">
            <span class="preview-panel-label">Before</span>
            <div
              class="preview-text"
              :style="originalFontFamily ? { fontFamily: `'${originalFontFamily}', serif` } : {}"
            >
              {{ previewText || 'Type something above…' }}
            </div>
            <span class="preview-panel-note">Original font</span>
          </div>

          <!-- After (only once converted) -->
          <Transition name="panel-slide">
            <div v-if="resultFontFamily" class="preview-panel preview-panel--after">
              <span class="preview-panel-label preview-panel-label--after">After</span>
              <div
                class="preview-text preview-text--after"
                :style="{ fontFamily: `'${resultFontFamily}', serif` }"
              >
                {{ previewText || 'Type something above…' }}
              </div>
              <span class="preview-panel-note">Lowercase → uppercase remapped</span>
            </div>
          </Transition>
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
          {{ isProcessing ? 'Converting…' : 'Convert to Uppercase' }}
        </UButton>
        <UButton v-if="!isProcessing" variant="ghost" color="neutral" size="xl" @click="reset">
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
      />

      <!-- Result download -->
      <Transition name="result-slide">
        <div v-if="resultUrl" class="result-section">
          <div class="result-card">
            <div class="result-icon-wrap">
              <UIcon name="i-heroicons-check-circle" class="result-icon" />
            </div>
            <div class="result-info">
              <p class="result-title">Conversion complete</p>
              <p class="result-sub">{{ resultName }} · {{ resultSize }}</p>
            </div>
            <UButton :href="resultUrl" :download="resultName" leading-icon="i-heroicons-arrow-down-tray">
              Download
            </UButton>
          </div>
        </div>
      </Transition>

      <!-- Info section -->
      <aside class="info-section" aria-label="About this tool">
        <h2 class="info-title">About: Font Uppercase Converter</h2>
        <div class="info-body">
          <p>
            This tool modifies the character map (cmap) of a font file so that lowercase letters
            render using the same glyphs as their uppercase counterparts. When the converted font is
            used in CSS, typing <strong>abc</strong> displays identically to <strong>ABC</strong>
            — without needing <code>text-transform: uppercase</code>.
          </p>
          <p>
            Accented characters are handled too: <strong>é à ã â ñ</strong> are remapped to
            <strong>É À Ã Â Ñ</strong> and so on, for any character where the font contains the
            corresponding uppercase glyph.
          </p>
          <h3>What is preserved</h3>
          <ul>
            <li>All uppercase letters and their accented variants</li>
            <li>Digits (0–9) and all punctuation</li>
            <li>Symbols, currency signs, ligatures, and any other non-letter glyphs</li>
            <li>Font metrics: ascender, descender, kerning, and advance widths</li>
          </ul>
          <h3>Use cases</h3>
          <ul>
            <li>All-caps headline typefaces on landing pages</li>
            <li>Logo and wordmark fonts where casing is controlled via font rather than CSS</li>
            <li>Display fonts for chapter headings and section titles</li>
          </ul>
          <h3>Output format</h3>
          <p>
            The output is always a <strong>TTF</strong> file. This is the most universally
            compatible format and can be re-compressed to WOFF2 using any font conversion tool.
          </p>
        </div>
      </aside>
    </main>

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
.breadcrumb-item:hover { color: var(--text-muted); }
.breadcrumb-sep { opacity: 0.4; }
.breadcrumb-current { color: var(--text-muted); }

/* ── Tool header ───────────────────────────────────── */
.tool-header { padding-top: 1rem; }

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
.tool-title em { font-style: italic; color: var(--accent-orange); }

.tool-description {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 56ch;
  margin: 0 0 1.5rem;
}

.code-sample {
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--text-primary);
  background: rgba(255,255,255,0.06);
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
  border: 1px solid var(--border-subtle);
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
.dropzone:focus-visible { box-shadow: 0 0 0 2px var(--accent-orange); }
.dropzone--active {
  border-color: rgba(249, 115, 22, 0.6);
  background: rgba(249, 115, 22, 0.04);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.08), inset 0 0 40px rgba(249, 115, 22, 0.04);
}
.dropzone--filled { cursor: default; border-style: solid; border-color: rgba(249, 115, 22, 0.25); }

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
.dropzone--active .dropzone-icon-ring { border-color: var(--accent-orange); }
.dropzone-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-subtle);
  transition: color 0.2s ease;
}
.dropzone--active .dropzone-icon { color: var(--accent-orange); }
.dropzone-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.dropzone-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
}
.dropzone-btn { margin-top: 0.5rem; }

.dropzone-filled { padding: 1.5rem; }
.file-preview { display: flex; align-items: center; gap: 1rem; }
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
.file-icon { width: 1.5rem; height: 1.5rem; color: var(--accent-orange); }
.file-info { flex: 1; min-width: 0; }
.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
.file-size { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-subtle); }

/* ── Font preview ──────────────────────────────────── */
.preview-section {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.preview-title-icon { width: 0.875rem; height: 0.875rem; }

.preview-input-wrap { flex: 1; min-width: 12rem; max-width: 28rem; }
.preview-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.2s ease;
}
.preview-input:focus { border-color: rgba(249, 115, 22, 0.4); }
.preview-input::placeholder { color: var(--text-subtle); }

.preview-panels {
  display: grid;
  grid-template-columns: 1fr;
}
.preview-panels--dual { grid-template-columns: 1fr 1fr; }

@media (max-width: 600px) {
  .preview-panels--dual { grid-template-columns: 1fr; }
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
}
.preview-panel + .preview-panel {
  border-left: 1px solid var(--border-subtle);
}
@media (max-width: 600px) {
  .preview-panel + .preview-panel {
    border-left: none;
    border-top: 1px solid var(--border-subtle);
  }
}

.preview-panel--after { background: rgba(249, 115, 22, 0.03); }

.preview-panel-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.preview-panel-label--after { color: rgba(249, 115, 22, 0.7); }

.preview-text {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  line-height: 1.2;
  color: var(--text-primary);
  word-break: break-word;
  min-height: 2.5em;
}
.preview-text--after { color: #f0ebe0; }

.preview-panel-note {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
}

/* ── Action ────────────────────────────────────────── */
.action-section { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

/* ── Result ────────────────────────────────────────── */
.result-section { animation: slide-in 0.3s ease; }

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
.result-icon { width: 1.25rem; height: 1.25rem; color: var(--accent-orange); }
.result-info { flex: 1; }
.result-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
.result-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* ── Info section ──────────────────────────────────── */
.info-section { border-top: 1px solid var(--border-subtle); padding-top: 2.5rem; }
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
.info-body h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-top: 0.5rem; }
.info-body ul { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
.info-body strong { color: var(--text-primary); font-weight: 600; }
.info-body code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--text-primary);
  background: rgba(255,255,255,0.06);
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
}

/* ── Footer ────────────────────────────────────────── */
.tool-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-logo { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-subtle); text-decoration: none; }
.footer-note { font-size: 0.75rem; color: var(--text-subtle); }

/* ── Transitions ───────────────────────────────────── */
.panel-slide-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.panel-slide-enter-from { opacity: 0; transform: translateX(12px); }

.result-slide-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.result-slide-enter-from { opacity: 0; transform: translateY(8px); }

@keyframes slide-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
