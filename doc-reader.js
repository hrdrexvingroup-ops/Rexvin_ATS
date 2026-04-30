// ========================================
// REXVIN ATS - DOC READER
// Membaca CV Word (.docx) menggunakan Mammoth.js
// ========================================

async function extractTextFromDOCX(file) {
  try {
    if (typeof mammoth === "undefined") {
      alert("Mammoth.js belum terhubung.");
      return null;
    }

    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer: arrayBuffer
    });

    return cleanDocText(result.value);

  } catch (error) {
    console.error("DOC Reader Error:", error);
    alert(`Gagal membaca file Word: ${file.name}`);
    return null;
  }
}

function cleanDocText(text) {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ")
    .trim();
}
