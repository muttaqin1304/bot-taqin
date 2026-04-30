const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔗 URL GOOGLE SCRIPT (punya kamu)
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxCWxliZcJ3hUzFxBrJQ3GQSZp_S7Fh0Hecv4TTXL_A7Sb9qwdZ2mKMTeuMExF5Tgd6/exec";

// 🔥 WEBHOOK TELEGRAM
app.post("/", async (req, res) => {
  // ✅ WAJIB: respon cepat supaya tidak looping
  res.sendStatus(200);

  try {
    const message = req.body.message;
    const chatId = message.chat.id;
    const textMsg = message.text.toLowerCase();

    // 🔥 kalau user minta laporan
    if (textMsg === "laporan") {
      try {
        const response = await axios.get(SHEET_URL);
        const data = response.data;

        const reply = `
          📊 *LAPORAN HARI INI*
          
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

        // kirim ke Telegram
        await axios.post(
          `https://api.telegram.org/bot8656002855:AAGmz4hE1zYX4jid-q9SVVQikXLVCLLalqE/sendMessage`,
          {
            chat_id: chatId,
            text: reply,
            parse_mode: "Markdown",
          },
        );
      } catch (err) {
        console.log(err);
      }

      return;
    }
    if (!message || !message.text) return;

    const text = message.text;

    console.log("Pesan masuk:", text);

    // 🔥 kirim ke Google Sheet (format yang pasti kebaca)
    await axios.post(
      SHEET_URL,
      new URLSearchParams({
        text: text,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
  } catch (err) {
    console.log("ERROR:", err);
  }
});

// 🔥 TEST SERVER
app.get("/", (req, res) => {
  res.send("BOT AKTIF TAQIN 🚀");
});

// 🔥 PORT REPLIT
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port " + PORT);
});
