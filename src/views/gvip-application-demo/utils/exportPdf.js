import html2pdf from 'html2pdf.js'

export async function exportPdf({ element, fileName }) {
  if (!element) {
    throw new Error('PDF preview element is not available.')
  }

  return html2pdf()
    .set({
      margin: [10, 10, 12, 10],
      filename: fileName,
      image: {
        type: 'jpeg',
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['css', 'legacy'],
      },
    })
    .from(element)
    .save()
}
