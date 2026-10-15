import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { preview } from 'vite'
import text from '../src/messages.json' with { type: 'json' }

const server = await preview({ preview: { host: '127.0.0.1', port: 4174, strictPort: true, open: false } })
let browser

try {
  browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: 'reduce',
    hasTouch: true,
  })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => { if (response.status() >= 400) errors.push(response.url()) })
  await page.goto('http://127.0.0.1:4174/cardjo/')
  await page.locator('[data-tile-id]').first().waitFor()
  assert.equal(await page.locator('[data-tile-id]').count(), 36)

  const layout = await page.evaluate(() => {
    const tile = document.querySelector('[data-tile-id]')
    const bounds = tile.getBoundingClientRect()
    return {
      viewport: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      tileWidth: bounds.width,
      tileHeight: bounds.height,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      transition: getComputedStyle(tile).transitionDuration,
    }
  })
  assert.equal(layout.viewport, 360)
  assert.equal(layout.pageWidth, 360)
  assert.ok(layout.tileWidth >= 44 && layout.tileHeight >= 44)
  assert.equal(layout.reducedMotion, true)
  assert.equal(layout.transition, '0s')

  const firstAvailable = page.locator('[data-tile-id]:not(:disabled)').first()
  await firstAvailable.tap()
  assert.equal(await firstAvailable.getAttribute('aria-pressed'), 'true')
  await firstAvailable.tap()
  assert.equal(await firstAvailable.getAttribute('aria-pressed'), 'false')

  await page.getByRole('button', { name: text.hint, exact: true }).click()
  const pair = await page.locator('[data-hinted="true"]').evaluateAll((tiles) => tiles.map((tile) => tile.dataset.tileId))
  assert.equal(pair.length, 2)
  await page.locator(`[data-tile-id="${pair[0]}"]`).press('Enter')
  await page.locator(`[data-tile-id="${pair[1]}"]`).press('Space')
  await page.waitForFunction(() => document.querySelectorAll('[data-tile-id]').length === 34
    && document.activeElement?.matches('[data-tile-id]:not(:disabled)'))

  await page.getByRole('button', { name: text.hint, exact: true }).click()
  const beforeCancel = await page.locator('[data-tile-id]').evaluateAll((tiles) => tiles.map((tile) => tile.outerHTML))
  for (const name of [text.restart, text.newGame]) {
    page.once('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name, exact: true }).click()
    assert.deepEqual(await page.locator('[data-tile-id]').evaluateAll((tiles) => tiles.map((tile) => tile.outerHTML)), beforeCancel)
  }

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: text.restart, exact: true }).click()
  assert.equal(await page.locator('[data-tile-id]').count(), 36)
  assert.equal(await page.locator('[data-hinted="true"]').count(), 0)
  assert.equal(await page.getByRole('button', { name: text.undo, exact: true }).isDisabled(), true)

  await page.getByRole('button', { name: text.howToPlay, exact: true }).click()
  assert.equal(await page.locator('dialog').isVisible(), true)
  await page.getByRole('button', { name: text.closeInstructions, exact: true }).press('Escape')
  assert.equal(await page.locator('dialog').isVisible(), false)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  assert.equal(await page.locator('[data-tile-id]').first().evaluate((tile) => getComputedStyle(tile).transitionDuration), '0.15s')
  await page.reload()
  await page.locator('[data-tile-id]').first().waitFor()
  assert.equal(await page.locator('[data-tile-id]').count(), 36)
  assert.deepEqual(errors, [])
  console.log('Browser checks passed: phone sizing, touch, keyboard focus, resets, instructions, reduced motion, and reload.')
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()))
}
