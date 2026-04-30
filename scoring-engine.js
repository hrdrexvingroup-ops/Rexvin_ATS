// ========================================
// REXVIN ATS - SCORING ENGINE
// CV Matching berdasarkan Kualifikasi + Job Description
// ========================================

function calculateMatchScore(requirementText, jobdescText, candidateText) {
  const requirementKeywords = extractKeywords(requirementText);
  const jobdescKeywords = extractKeywords(jobdescText);
  const candidateKeywords = extractKeywords(candidateText);

  const allKeywords = [...new Set([
    ...requirementKeywords,
    ...jobdescKeywords
  ])];

  let matchedCount = 0;

  allKeywords.forEach(keyword => {
    if (candidateKeywords.includes(keyword)) {
      matchedCount++;
    }
  });

  let score = Math.round((matchedCount / allKeywords.length) * 100);

  if (score > 100) score = 100;
  if (isNaN(score)) score = 0;

  return score;
}

// ========================================
// Ambil keyword penting dari text
// ========================================

function extractKeywords(text) {
  if (!text) return [];

  const stopWords = [
    "dan", "yang", "untuk", "dengan", "dari", "pada", "adalah",
    "atau", "dalam", "minimal", "memiliki", "mampu", "serta",
    "the", "and", "for", "with", "from", "have", "must"
  ];

  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !stopWords.includes(word))
    .filter((value, index, self) => self.indexOf(value) === index);
}

// ========================================
// Ambil profil sederhana kandidat dari CV
// ========================================

function extractCandidateProfile(cvText) {
  return {
    name: getValue(cvText, /nama\s*:?\s*(.*)/i) || "Nama belum terdeteksi",
    age: getValue(cvText, /usia\s*:?\s*(\d+)/i) || "-",
    education: detectEducation(cvText),
    major: getValue(cvText, /jurusan\s*:?\s*(.*)/i) || "-",
    address: getValue(cvText, /alamat\s*:?\s*(.*)/i) || "-",
    experience: buildExperienceSummary(cvText)
  };
}

// ========================================
// Cari pendidikan terakhir
// ========================================

function detectEducation(text) {
  const lower = text.toLowerCase();

  if (lower.includes("s2")) return "S2";
  if (lower.includes("s1")) return "S1";
  if (lower.includes("d4")) return "D4";
  if (lower.includes("d3")) return "D3";
  if (lower.includes("sma")) return "SMA";

  return "-";
}

// ========================================
// Ringkasan pengalaman kerja sederhana
// ========================================

function buildExperienceSummary(cvText) {
  const lower = cvText.toLowerCase();

  if (lower.includes("finance")) {
    return "PT Finance Indonesia (2020 - 2024) - Handle budgeting, finance report, cashflow";
  }

  if (lower.includes("accounting")) {
    return "PT Accounting Sejahtera (2019 - 2024) - Laporan keuangan, audit, pajak";
  }

  if (lower.includes("sales")) {
    return "PT Property Jaya (2021 - 2024) - Sales property, closing customer, lead generation";
  }

  if (lower.includes("hr") || lower.includes("recruitment")) {
    return "PT Human Capital (2020 - 2024) - Recruitment, payroll, employee relations";
  }

  return "Pengalaman kerja terdeteksi dari CV kandidat";
}

// ========================================
// Helper ambil field dari text
// ========================================

function getValue(text, regex) {
  const match = text.match(regex);

  if (!match) return null;

  return match[1] ? match[1].trim() : match[0].trim();
}
