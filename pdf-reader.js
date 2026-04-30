// ========================================
// REXVIN ATS - PDF READER
// Membaca isi CV PDF menggunakan PDF.js
// ========================================

async function extractTextFromPDF(file) {
  try {
    if (typeof pdfjsLib === "undefined") {
      alert("PDF.js belum terhubung.");
      return null;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let page = 1; page <= pdf.numPages; page++) {
      const currentPage = await pdf.getPage(page);
      const textContent = await currentPage.getTextContent();

      const pageText = textContent.items
        .map(item => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    return cleanPDFText(fullText);

  } catch (error) {
    console.error("PDF Reader Error:", error);
    alert(`Gagal membaca file PDF: ${file.name}`);
    return null;
  }
}

function cleanPDFText(text) {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ")
    .replace(/Page\s+\d+/gi, "")
    .trim();
}
