// Rexvin ATS - Smart CV Matcher
// Main System Logic

let candidateResults = [];

function startAnalysis() {
  const files = document.getElementById('cvFiles').files;
  const jobTitle = document.getElementById('jobTitle').value;
  const department = document.getElementById('department').value;
  const qualification = document.getElementById('qualification').value;
  const jobdesc = document.getElementById('jobdesc').value;

  if (!jobTitle || !department || !qualification || !jobdesc) {
    alert('Lengkapi seluruh data hiring requirement terlebih dahulu.');
    return;
  }

  if (files.length === 0) {
    alert('Upload CV kandidat terlebih dahulu.');
    return;
  }

  candidateResults = [];

  let totalHigh = 0;
  let totalInterview = 0;
  let totalBackup = 0;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i].name;

    // sementara dummy scoring
    const score = generateScore();

    let recommendation = 'Cadangan';
    let redFlag = 'Tidak ada';
    let badge = 'low';

    if (score >= 90) {
      recommendation = 'High Priority Interview';
      badge = 'high';
      totalHigh++;
    } else if (score >= 80) {
      recommendation = 'Layak Interview';
      badge = 'mid';
      totalInterview++;
    } else {
      totalBackup++;
      redFlag = detectRedFlag(score);
    }

    candidateResults.push({
      name: cleanFileName(fileName),
      fileName,
      score,
      recommendation,
      redFlag,
      badge,
      createdAt: new Date().toLocaleString('id-ID')
    });
  }

  candidateResults.sort((a, b) => b.score - a.score);

  renderResultTable();
  updateDashboard(totalHigh, totalInterview, totalBackup, files.length);
  saveHistory(jobTitle, department);

  document.getElementById('resultCard').style.display = 'block';
}

function generateScore() {
  return Math.floor(Math.random() * 25) + 75;
}

function detectRedFlag(score) {
  if (score < 78) {
    const flags = [
      'Job Hopper',
      'Skill Gap',
      'Gap Karier Terlalu Lama',
      'Industry Tidak Relevan',
      'Expected Salary Tinggi'
    ];

    return flags[Math.floor(Math.random() * flags.length)];
  }

  return 'Tidak ada';
}

function cleanFileName(fileName) {
  return fileName
    .replace('.pdf', '')
    .replace('.docx', '')
    .replace('.doc', '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ');
}

function renderResultTable() {
  const tbody = document.getElementById('resultBody');
  tbody.innerHTML = '';

  candidateResults.forEach((candidate, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${candidate.name}</td>
        <td class="score">${candidate.score}%</td>
        <td><span class="badge ${candidate.badge}">${candidate.recommendation}</span></td>
        <td>${candidate.redFlag}</td>
      </tr>
    `;
  });
}

function updateDashboard(high, interview, backup, total) {
  document.getElementById('totalCandidate').innerText = total;
  document.getElementById('highPriority').innerText = high;
  document.getElementById('interviewReady').innerText = interview;
  document.getElementById('backupCandidate').innerText = backup;
}

function saveHistory(jobTitle, department) {
  const history = JSON.parse(localStorage.getItem('rexvin_history')) || [];

  history.unshift({
    jobTitle,
    department,
    totalCandidate: candidateResults.length,
    topCandidate: candidateResults[0]?.name || '-',
    topScore: candidateResults[0]?.score || '-',
    createdAt: new Date().toLocaleString('id-ID')
  });

  localStorage.setItem('rexvin_history', JSON.stringify(history));
}

function resetSystem() {
  document.getElementById('jobTitle').value = '';
  document.getElementById('department').value = '';
  document.getElementById('qualification').value = '';
  document.getElementById('jobdesc').value = '';
  document.getElementById('niceSkill').value = '';
  document.getElementById('salaryMin').value = '';
  document.getElementById('salaryMax').value = '';
  document.getElementById('cvFiles').value = '';

  document.getElementById('resultBody').innerHTML = '';
  document.getElementById('resultCard').style.display = 'none';

  updateDashboard(0, 0, 0, 0);
}

function exportSimpleReport() {
  if (candidateResults.length === 0) {
    alert('Belum ada hasil analisis.');
    return;
  }

  let report = 'Rexvin ATS - Candidate Ranking Report\n\n';

  candidateResults.forEach((item, index) => {
    report += `${index + 1}. ${item.name} | ${item.score}% | ${item.recommendation}\n`;
  });

  const blob = new Blob([report], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'candidate-report.txt';
  link.click();
}

window.onload = function () {
  updateDashboard(0, 0, 0, 0);
};
