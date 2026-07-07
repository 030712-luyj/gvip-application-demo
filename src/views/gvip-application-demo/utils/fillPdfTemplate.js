import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb } from 'pdf-lib'
import {
  pdfFieldMap,
  PDF_TEMPLATE_FONT_PATH,
  PDF_TEMPLATE_PATH,
} from '../config/pdfFieldMap'

function getValueByPath(source, path) {
  return path.split('.').reduce((current, segment) => current?.[segment], source)
}

function formatFieldValue(item, formData) {
  const value = getValueByPath(formData, item.key)

  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function resolvePdfPosition(page, field) {
  const { width, height } = page.getSize()

  if (typeof field.xRatio === 'number' && typeof field.yRatio === 'number') {
    return {
      x: width * field.xRatio,
      y: height * (1 - field.yRatio),
    }
  }

  return {
    x: field.x,
    y: field.y,
  }
}

async function fetchBinary(url, missingMessage) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(missingMessage)
  }

  return response.arrayBuffer()
}

function downloadPdf(bytes, fileName) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = blobUrl
  link.download = fileName
  link.click()

  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

export async function exportFilledGvipPdf({ formData, fileName }) {
  console.info('[GVIP TEMPLATE PDF] loading template')

  const [templateBytes, fontBytes] = await Promise.all([
    fetchBinary(PDF_TEMPLATE_PATH, '未找到 PDF 模板：/templates/gvip-application-form.pdf'),
    fetchBinary(PDF_TEMPLATE_FONT_PATH, '未找到中文字体：/fonts/simhei.ttf'),
  ])

  const pdfDoc = await PDFDocument.load(templateBytes)
  pdfDoc.registerFontkit(fontkit)

  const embeddedFont = await pdfDoc.embedFont(fontBytes, { subset: true })
  const pages = pdfDoc.getPages()

  console.info('[GVIP TEMPLATE PDF] template loaded')
  console.info('[GVIP TEMPLATE PDF] page count:', pages.length)
  pages.forEach((page, index) => {
    const size = page.getSize()
    console.info(`[GVIP TEMPLATE PDF] page ${index + 1} size:`, size.width, size.height)
  })
  console.info('[GVIP TEMPLATE PDF] writing fields:', pdfFieldMap.length)

  pdfFieldMap.forEach((item) => {
    const page = pages[item.page]

    if (!page) {
      return
    }

    if (item.type === 'radio') {
      const radioValue = getValueByPath(formData, item.key)
      const option = item.options?.[radioValue]

      if (!option) {
        return
      }

      const { x, y } = resolvePdfPosition(page, {
        xRatio: option.xRatio,
        yRatio: option.yRatio,
      })

      page.drawText(item.mark || '✓', {
        x: x + (option.xOffset || 0),
        y: y + (option.yOffset || 0),
        size: item.fontSize || 10,
        font: embeddedFont,
        color: rgb(0.05, 0.12, 0.16),
      })

      return
    }

    const fieldValue = formatFieldValue(item, formData)

    if (!fieldValue) {
      return
    }

    const { x, y } = resolvePdfPosition(page, item)
    const finalX = x + (item.xOffset || 0)
    const finalY = y + (item.yOffset || 0)

    page.drawText(fieldValue, {
      x: finalX,
      y: finalY,
      size: item.fontSize || 10.5,
      font: embeddedFont,
      color: rgb(0.03, 0.10, 0.14),
      maxWidth: item.maxWidth,
      lineHeight: item.lineHeight || (item.fontSize || 10.5) * 1.25,
    })
  })

  const pdfBytes = await pdfDoc.save()
  console.info('[GVIP TEMPLATE PDF] saved')
  downloadPdf(pdfBytes, fileName)
}

export const fillPdfTemplate = exportFilledGvipPdf
