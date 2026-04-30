// ========================================
// REXVIN ATS - GROQ API
// Optional AI Analysis (Gratis versi awal tetap bisa tanpa ini)
// ========================================

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
let GROQ_API_KEY = localStorage.getItem("groq_api_key") || "";

function saveGroqApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === "") {
    alert("Masukkan Groq API Key terlebih dahulu.");
    return;
  }

  GROQ_API_KEY = apiKey.trim();
  localStorage.setItem("groq_api_key", GROQ_API_KEY);
  alert("Groq API Key berhasil disimpan.");
}

async function analyzeWithGroq(requirement, candidateCV) {
  if (!GROQ_API_KEY) {
    console.log("Groq API Key belum tersedia. Sistem tetap bisa berjalan tanpa AI.");
    return null;
  }

  const prompt = `
Analisa CV kandidat berikut.

Kualifikasi yang dibutuhkan:
${requirement}

Isi CV Kandidat:
${candidateCV}

Berikan hasil singkat:
- Nama Kandidat
- Ringkasan Pengalaman
- Kesesuaian Kandidat
- Skor (0-100)
`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return null;
    }

    return data.choices?.[0]?.message?.content || null;

  } catch (error) {
    console.error("Groq API Error:", error);
    return null;
  }
}
