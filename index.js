const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 ambil token dari Railway
const TOKEN = process.env.TOKEN;

// 🔗 URL GOOGLE SCRIPT
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxCWxliZcJ3hUzFxBrJQ3GQSZp_S7Fh0Hecv4TTXL_A7Sb9qwdZ2mKMTeuMExF5Tgd6/exec";

// 🔥 WEBHOOK TELEGRAM
app.post("/", async (req, res) => {
  res.sendStatus(200);

  console.log("BODY MASUK:", req.body);

  try {
    const message = req.body.message;
    if (!message || !message.text) return;

    const chatId = message.chat.id;
    const textMsg = message.text.toLowerCase();
    const text = message.text;

    console.log("Pesan masuk:", text);

    // =========================
    // 📊 MODE LAPORAN
    // =========================
    if (textMsg === "laporan") {
      try {
        const response = await axios.get(SHEET_URL);
        const data = response.data;

        const reply = `
📊 *LAPORAN PANEN MUTTAQIN*

📅 ${data.tanggal}

━━━━━━━━━━━━━━━
🌴 *Total Panen*  
${data.ton || 0} Kg

👷 *Upah Panen*
Rp ${(data.upah || 0).toLocaleString()}

🚚 *Upah Langsir*
Rp ${(data.langsir || 0).toLocaleString()}

🕌 *Zakat (2.5%)*  
Rp ${(data.zakat || 0).toLocaleString()}

📦 *Hasil Bersih*  
Rp ${(data.bersih || 0).toLocaleString()}
━━━━━━━━━━━━━━━
`;

        await axios.post(
          `https://api.telegram.org/bot${TOKEN}/sendMessage`,
          {
            chat_id: chatId,
            text: reply,
            parse_mode: "Markdown",
          }
        );
      } catch (err) {
        console.log("ERROR LAPORAN:", err);
      }

      return;
    }

    // =========================
    // 📥 MODE INPUT DATA
    // =========================

    await axios.post(
      SHEET_URL,
      new URLSearchParams({
        text: text,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // =========================
    // 🤖 REPLY PINTAR
    // =========================

    let replyText = "";

    // 🔥 jika input "keluar"
    if (textMsg.includes("keluar")) {
      const keluarMatch = text.match(/keluar\s*(\d+)/i);
      const keluar = keluarMatch ? parseInt(keluarMatch[1]) : 0;

      replyText = `💰 Uang keluar: Rp ${keluar.toLocaleString()}`;
    }

    // 🔥 jika input panen
    else {
      const numbers = text.match(/\d+/g);
      const ton = numbers ? parseInt(numbers[0]) : 0;

      const hargaMatch = text.match(/harga\s*(\d+)/i);
      const harga = hargaMatch ? parseInt(hargaMatch[1]) : 0;

      replyText = `🌴 Tonase: ${ton} Kg\n💰 Harga: Rp ${harga.toLocaleString()}`;
    }

    // 🔥 kirim balasan
    await axios.post(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: `✅ Data berhasil disimpan\n\n${replyText}`,
      }
    );

  } catch (err) {
    console.log("ERROR:", err);
  }
});

// 🔥 TEST SERVER
app.get("/", (req, res) => {
  res.send("BOT AKTIF TAQIN 🚀");
});

// 🔥 PORT
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port " + PORT);
});
