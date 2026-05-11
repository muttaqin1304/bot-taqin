const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 TOKEN TELEGRAM
const TOKEN = process.env.TOKEN;

// 🔗 GOOGLE APPS SCRIPT
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxCWxliZcJ3hUzFxBrJQ3GQSZp_S7Fh0Hecv4TTXL_A7Sb9qwdZ2mKMTeuMExF5Tgd6/exec";

// ========================================
// 🚀 WEBHOOK TELEGRAM
// ========================================

app.post("/", async (req, res) => {

  res.sendStatus(200);

  try {

    const message = req.body.message;

    if (!message || !message.text) return;

    const chatId = message.chat.id;

    const text = message.text;

    const textMsg = text.toLowerCase();

    console.log("PESAN MASUK:", text);
   if (textMsg === "🌴 input panen") {

  await axios.post(
    `https://api.telegram.org/bot${TOKEN}/sendMessage`,
    {
      chat_id: chatId,

      text:
`🌴 FORMAT INPUT PANEN

contoh:

6700 harga 4000 penolong 450000 bonus 100000`,

      reply_markup: {
        keyboard: [
          ["🌴 Input Panen"],
          ["📊 Laporan Hari Ini"],
          ["📅 Laporan Bulanan"]
        ],
        resize_keyboard: true
      }

    }
  );

  return;
}
// ========================================
// 📊 MENU LAPORAN HARI INI
// ========================================

if (
  textMsg === "📊 laporan hari ini"
) {

  textMsg = "laporan";
}

// ========================================
// 📅 MENU LAPORAN BULANAN
// ========================================

if (
  textMsg === "📅 laporan bulanan"
) {

  await axios.post(
    `https://api.telegram.org/bot${TOKEN}/sendMessage`,
    {
      chat_id: chatId,

      text:
`📅 LAPORAN BULANAN

fitur masih dalam pengembangan 🔥`,

      reply_markup: {
        keyboard: [
          ["🌴 Input Panen"],
          ["📊 Laporan Hari Ini"],
          ["📅 Laporan Bulanan"]
        ],
        resize_keyboard: true
      }

    }
  );

  return;
}

    // ========================================
    // 📊 MODE LAPORAN
    // ========================================

    if (textMsg === "laporan") {

      try {

        const response = await axios.get(SHEET_URL);

        const data = response.data;

        // 🔥 HITUNG UPAH PER ORANG
        const perOrang =
          Math.floor((data.upah || 0) / 4);

        // 🔥 TOTAL PENGELUARAN
        const totalPengeluaran =
          (data.upah || 0) +
          (data.penolong || 0) +
          (data.langsir || 0) +
          (data.zakat || 0);

        const reply = `
📊 *LAPORAN PANEN MUTTAQIN*

📅 ${data.tanggal}

━━━━━━━━━━━━━━━

🌴 *Total Panen*
${(data.ton || 0).toLocaleString()} Kg

👷 *Upah Panen*
Rp ${(data.upah || 0).toLocaleString()}
(Rp ${perOrang.toLocaleString()}/orang)

🤝 *Penolong*
Rp ${(data.penolong || 0).toLocaleString()}

🎁 *Bonus*
Rp ${(data.bonus || 0).toLocaleString()}

🚚 *Upah Langsir*
Rp ${(data.langsir || 0).toLocaleString()}

🕌 *Zakat (2.5%)*
Rp ${(data.zakat || 0).toLocaleString()}

💸 *Total Pengeluaran*
Rp ${totalPengeluaran.toLocaleString()}

━━━━━━━━━━━━━━━

📦 *Hasil Bersih*
Rp ${(data.bersih || 0).toLocaleString()}

━━━━━━━━━━━━━━━
`;

        await axios.post(
          `https://api.telegram.org/bot${TOKEN}/sendMessage`,
          {
            chat_id: chatId,
            text: replyText,
            parse_mode: "Markdown",
            
            reply_markup: {
      keyboard: [
        ["🌴 Input Panen"],
        ["📊 Laporan Hari Ini", "📅 Laporan Bulanan"],
      ],
      resize_keyboard: true
    }

  }
);

      } catch (err) {

        console.log("ERROR LAPORAN:", err);

        await axios.post(
          `https://api.telegram.org/bot${TOKEN}/sendMessage`,
          {
            chat_id: chatId,
            text: "❌ Gagal mengambil laporan",
          }
        );
      }

      return;
    }

    // ========================================
    // 📥 MODE INPUT DATA
    // ========================================

    const gasResponse = await axios.post(
      SHEET_URL,
      new URLSearchParams({
        text: text,
      }),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("RESPON GAS:", gasResponse.data);

    // ========================================
    // 🔥 AMBIL DATA INPUT
    // ========================================

    const numbers = text.match(/\d+/g);

    const ton =
      numbers ? parseInt(numbers[0]) : 0;

    const hargaMatch =
      text.match(/harga\s*(\d+)/i);

    const harga =
      hargaMatch
        ? parseInt(hargaMatch[1])
        : 0;

    const penolongMatch =
      text.match(/penolong\s*(\d+)/i);

    const penolong =
      penolongMatch
        ? parseInt(penolongMatch[1])
        : 0;

    const bonusMatch =
      text.match(/bonus\s*(\d+)/i);

    const bonus =
      bonusMatch
        ? parseInt(bonusMatch[1])
        : 0;

    // ========================================
    // 🤖 BALASAN BOT
    // ========================================

    const replyText = `
✅ *Data berhasil disimpan*

🌴 Tonase: ${ton.toLocaleString()} Kg
💰 Harga: Rp ${harga.toLocaleString()}
🤝 Penolong: Rp ${penolong.toLocaleString()}
🎁 Bonus: Rp ${bonus.toLocaleString()}
`;

    await axios.post(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: replyText,
        parse_mode: "Markdown",
      }
    );

  } catch (err) {

    console.log("ERROR:", err);

  }
});

// ========================================
// 🔥 TEST SERVER
// ========================================

app.get("/", (req, res) => {

  res.send("BOT AKTIF TAQIN 🚀");

});

// ========================================
// 🚀 JALANKAN SERVER
// ========================================

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {

  console.log("Server jalan di port " + PORT);

});
