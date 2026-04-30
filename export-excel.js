// ========================================
// REXVIN ATS - EXPORT EXCEL
// Export hasil ranking kandidat ke Excel
// ========================================

function exportCandidateRankingToExcel() {
  if (!candidateResults || candidateResults.length === 0) {
    alert("Belum ada hasil analisa kandidat.");
    return;
  }

  const exportData = candidateResults.map((item, index) => ({
    No: index + 1,
    Nama: item.name,
    Usia: item.age,
    Pendidikan: item.education,
    Jurusan: item.major,
    Alamat: item.address,
    "Ringkasan Pengalaman": item.experience,
    "Skor Kesesuaian": item.score + "%"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidate Ranking");

  const fileName = `Candidate_Ranking_${getTodayDate()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}
