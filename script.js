// ========================================
// REXVIN ATS - SMART CV MATCHER
// MAIN SCRIPT (FINAL)
// ========================================

let candidateResults = [];

// ========== FUNGSI UTAMA ==========
async function startAnalysis() {
    // Ambil nilai form
    const jobTitle = document.getElementById('jobTitle')?.value.trim();
    const department = document.getElementById('department')?.value.trim();
    const qualification = document.getElementById('qualification')?.value.trim();
    const jobdesc = document.getElementById('jobdesc')?.value.trim();
    const files = document.getElementById('cvFiles')?.files;

    // Validasi
    if (!jobTitle || !department || !qualification || !jobdesc) {
        alert('❌ Lengkapi semua data: Nama Posisi, Departemen, Kualifikasi, Job Description.');
        return;
    }
    if (!files || files.length === 0) {
        alert('❌ Upload minimal 1 CV (PDF atau Word).');
        return;
    }

    // Tampilkan loading
    const loading = document.getElementById('loadingContainer');
    if (loading) loading.style.display = 'block';

    candidateResults = [];

    // Proses semua file satu per satu
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        let extractedText = '';

        // Baca isi file berdasarkan ekstensi
        if (fileName.toLowerCase().endsWith('.pdf')) {
            if (typeof extractTextFromPDF === 'function') {
                extractedText = await extractTextFromPDF(file);
            } else {
                console.warn('PDF Reader tidak tersedia');
                extractedText = '';
            }
        } else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
            if (typeof extractTextFromDOCX === 'function') {
                extractedText = await extractTextFromDOCX(file);
            } else {
                console.warn('DOC Reader tidak tersedia');
                extractedText = '';
            }
        } else {
            alert(`Format file tidak didukung: ${fileName}`);
            continue;
        }

        if (!extractedText) {
            // Jika gagal baca, buat dummy untuk sementara agar proses tetap jalan
            extractedText = `Nama: ${fileName.replace(/\.(pdf|docx?)$/i, '')} Pengalaman kerja tidak terbaca.`;
        }

        // Ekstrak profil kandidat dari text CV
        const profile = extractCandidateProfile(extractedText);

        // Hitung skor kesesuaian berdasarkan kualifikasi & jobdesc
        const score = calculateMatchScore(extractedText, qualification, jobdesc);

        // Tentukan rekomendasi sederhana
        let recommendation = 'Cadangan';
        let badge = 'low';
        if (score >= 80) {
            recommendation = 'Layak Interview';
            badge = 'mid';
        }
        if (score >= 90) {
            recommendation = 'High Priority Interview';
            badge = 'high';
        }

        // Simpan hasil
        candidateResults.push({
            name: profile.name || cleanFileName(fileName),
            age: profile.age || '-',
            education: profile.education || '-',
            major: profile.major || '-',
            address: profile.address || '-',
            experience: profile.experience || '-',
            score: score,
            recommendation: recommendation,
            badge: badge,
            fileName: fileName,
            rawText: extractedText
        });
    }

    // Urutkan berdasarkan skor tertinggi
    candidateResults.sort((a, b) => b.score - a.score);

    // Sembunyikan loading
    if (loading) loading.style.display = 'none';

    // Tampilkan hasil ke tabel
    renderResultTable();

    // Tampilkan card hasil
    const resultCard = document.getElementById('resultCard');
    if (resultCard) resultCard.style.display = 'block';

    // Update dashboard sederhana
    updateDashboard(candidateResults.length);
}

// ========== EKSTRAKSI PROFIL DARI TEXT CV ==========
function extractCandidateProfile(text) {
    if (!text) return { name: '-', age: '-', education: '-', major: '-', address: '-', experience: '-' };

    const lower = text.toLowerCase();

    // Nama (ambil baris pertama yang bukan angka)
    let name = '-';
    const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/m);
    if (nameMatch) name = nameMatch[1];

    // Usia
    let age = '-';
    const ageMatch = text.match(/\b(\d{1,2})\s*(?:tahun|thn|t)\b/i);
    if (ageMatch) age = ageMatch[1];

    // Pendidikan
    let education = '-';
    if (lower.includes('s2') || lower.includes('magister')) education = 'S2';
    else if (lower.includes('s1') || lower.includes('sarjana')) education = 'S1';
    else if (lower.includes('d4')) education = 'D4';
    else if (lower.includes('d3')) education = 'D3';
    else if (lower.includes('sma')) education = 'SMA';

    // Jurusan
    let major = '-';
    const jurusanMatch = text.match(/jurusan\s*:?\s*([^\n]+)/i);
    if (jurusanMatch) major = jurusanMatch[1];
    else {
        // cari kata kunci umum
        if (lower.includes('akuntansi')) major = 'Akuntansi';
        else if (lower.includes('manajemen')) major = 'Manajemen';
        else if (lower.includes('teknik informatika')) major = 'Teknik Informatika';
        else if (lower.includes('hukum')) major = 'Hukum';
        else if (lower.includes('psikologi')) major = 'Psikologi';
    }

    // Alamat
    let address = '-';
    const alamatMatch = text.match(/alamat\s*:?\s*([^\n]+)/i);
    if (alamatMatch) address = alamatMatch[1];

    // Ringkasan pengalaman (mencoba ambil nama perusahaan + tahun)
    let experience = '-';
    const expLines = [];
    const expRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[\(]?(\d{4})\s*[-–]\s*(\d{4}|sekarang)[\)]?/gi;
    let match;
    while ((match = expRegex.exec(text)) !== null) {
        expLines.push(`${match[1]} (${match[2]}–${match[3]})`);
    }
    if (expLines.length > 0) {
        experience = expLines.slice(0, 2).join('; ');
    } else {
        // fallback: ambil kalimat pertama yang mengandung "pengalaman"
        const pengalamanIndex = lower.indexOf('pengalaman');
        if (pengalamanIndex !== -1) {
            experience = text.substring(pengalamanIndex, pengalamanIndex + 150).replace(/\n/g, ' ').trim();
        }
    }

    return { name, age, education, major, address, experience };
}

// ========== PENILAIAN SKOR KESESUAIAN ==========
function calculateMatchScore(cvText, qualification, jobdesc) {
    if (!cvText) return 0;
    const lowerCV = cvText.toLowerCase();
    const lowerQual = (qualification + ' ' + jobdesc).toLowerCase();

    // Daftar kata kunci penting
    const keywords = lowerQual.split(/\s+/).filter(word => word.length > 4);
    let matched = 0;
    let total = 0;
    keywords.forEach(kw => {
        total++;
        if (lowerCV.includes(kw)) matched++;
    });
    if (total === 0) return 50; // default
    let score = Math.round((matched / total) * 100);
    // Batasi antara 0-100
    score = Math.min(100, Math.max(0, score));
    return score;
}

// ========== TAMPILKAN TABEL HASIL ==========
function renderResultTable() {
    const tbody = document.getElementById('resultBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (candidateResults.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data. Upload CV dan klik Analisis.</td></tr>';
        return;
    }

    candidateResults.forEach((candidate, idx) => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = idx + 1;
        row.insertCell(1).innerText = candidate.name;
        row.insertCell(2).innerText = candidate.age;
        row.insertCell(3).innerText = candidate.education;
        row.insertCell(4).innerText = candidate.major;
        row.insertCell(5).innerText = candidate.address;
        row.insertCell(6).innerText = candidate.experience.length > 100 ? candidate.experience.substring(0, 100) + '…' : candidate.experience;
        const scoreCell = row.insertCell(7);
        scoreCell.className = 'score';
        scoreCell.innerText = candidate.score + '%';
        const recCell = row.insertCell(8);
        recCell.innerHTML = `<span class="badge ${candidate.badge}">${candidate.recommendation}</span>`;
    });
}

function updateDashboard(total) {
    const totalEl = document.getElementById('totalCandidate');
    if (totalEl) totalEl.innerText = total;
    // Hitung high, interview, backup
    let high = candidateResults.filter(c => c.score >= 90).length;
    let interview = candidateResults.filter(c => c.score >= 80 && c.score < 90).length;
    let backup = candidateResults.filter(c => c.score < 80).length;
    const highEl = document.getElementById('highPriority');
    const interviewEl = document.getElementById('interviewReady');
    const backupEl = document.getElementById('backupCandidate');
    if (highEl) highEl.innerText = high;
    if (interviewEl) interviewEl.innerText = interview;
    if (backupEl) backupEl.innerText = backup;
}

// ========== RESET FORM ==========
function resetSystem() {
    document.getElementById('jobTitle').value = '';
    document.getElementById('department').value = '';
    document.getElementById('qualification').value = '';
    document.getElementById('jobdesc').value = '';
    document.getElementById('cvFiles').value = '';
    const tbody = document.getElementById('resultBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data.</td></tr>';
    const resultCard = document.getElementById('resultCard');
    if (resultCard) resultCard.style.display = 'none';
    candidateResults = [];
    updateDashboard(0);
}

// ========== FUNGSI BANTU ==========
function cleanFileName(fileName) {
    return fileName.replace(/\.(pdf|docx?)$/i, '').replace(/[_-]/g, ' ');
}

// ========== EKSPOR EXCEL ==========
function exportCandidateRankingToExcel() {
    if (!candidateResults || candidateResults.length === 0) {
        alert('Belum ada hasil analisa.');
        return;
    }
    const exportData = candidateResults.map((item, idx) => ({
        No: idx + 1,
        Nama: item.name,
        Usia: item.age,
        Pendidikan: item.education,
        Jurusan: item.major,
        Alamat: item.address,
        'Ringkasan Pengalaman': item.experience,
        'Skor Kesesuaian': item.score + '%',
        Rekomendasi: item.recommendation
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidate Ranking');
    const fileName = `Candidate_Ranking_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// ========== LOADING INISIALISASI ==========
window.onload = function() {
    updateDashboard(0);
    const resultCard = document.getElementById('resultCard');
    if (resultCard) resultCard.style.display = 'none';
};
