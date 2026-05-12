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
// 🎛️ KEYBOARD MENU
// ========================================

const keyboardMenu = {
  keyboard: [
    ["🌴 Input Panen"],
    ["📊 Laporan Hari Ini", "📅 Laporan Bulanan"]
  ],
  resize_keyboard: true
};

// ========================================
// 🚀 WEBHOOK TELEGRAM
// ========================================

app.post("/", async (req, res) => {

  res.sendStatus(200);

  try {

    const message = req.body.message;

    if (!message || !message.text) return;

    const chatId = message.chat.id;

    let textMsg = message.text.toLowerCase();

    const text = message.text;

    console.log("PESAN MASUK:", text);

    // ========================================
    // 🌴 MENU INPUT PANEN
    // ========================================

    if (textMsg === "🌴 input panen") {

      await axios.post(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          chat_id: chatId,

          text:
`🌴 FORMAT INPUT PANEN

contoh:

tonase harga xxxx penolong 450000`,

          reply_markup: keyboardMenu
        }
      );

      return;
    }

    // ========================================
    // 📊 MENU LAPORAN HARI INI
    // ========================================

    if (textMsg === "📊 laporan hari ini") {
      textMsg = "laporan";
    }

    // ========================================
    // 📅 MENU LAPORAN BULANAN
    // ========================================

    if (textMsg === "📅 laporan bulanan") {

      await axios.post(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          chat_id: chatId,

          text:
`📅 LAPORAN BULANAN

fitur masih dalam pengembangan 🔥`,

          reply_markup: keyboardMenu
        }
      );

      return;
    }

    // ========================================
    // 👷 MODE PEMBAGIAN BONUS
    // ========================================

    if (
      textMsg.includes("anggota") &&
      textMsg.includes("ketua")
    ) {

      const anggotaMatch =
        text.match(/anggota\s*(\d+)/i);

      const ketuaMatch =
        text.match(/ketua\s*(\d+)/i);

      const anggota =
        anggotaMatch
          ? parseInt(anggotaMatch[1]) * 1000
          : 0;

      const ketua =
        ketuaMatch
          ? parseInt(ketuaMatch[1]) * 1000
          : 0;

      // ambil laporan terakhir
      const response =
        await axios.get(SHEET_URL);

      const data = response.data;

      const upahDasar =
        (data.ton || 0) * 260;

      // total pembagian
      const totalPembagian =
        (anggota * 3) + ketua;

      // bonus final
      const bonusFinal =
        totalPembagian - upahDasar;
      // kirim bonus ke GAS
        await axios.post(
          SHEET_URL,
          new URLSearchParams({
            bonus: bonusFinal
          }),
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
          }
        );

      // simpan sementara
      global.bonusData = {
        ketua,
        anggota,
        bonusFinal
      };

      await axios.post(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: `✅ Bonus berhasil disimpan`,
          reply_markup: keyboardMenu
        }
      );

      return;
    }

    // ========================================
    // 📊 MODE LAPORAN
    // ========================================

    if (textMsg === "laporan") {

      try {

        const response =
          await axios.get(SHEET_URL);

        const data = response.data;

        // 🔥 HITUNG UPAH DASAR
        const upahDasar =
          (data.ton || 0) * 260;

        // 🔥 HITUNG PER ORANG
        const perOrang =
          Math.floor(upahDasar / 4);

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

👷 *Upah Dasar*
Rp ${upahDasar.toLocaleString()}

👤 *Per Orang*
Rp ${perOrang.toLocaleString()}
👑 Ketua + Bonus: Rp ${(global.bonusData?.ketua || 0).toLocaleString()}
👷 Anggota + Bonus: Rp ${(global.bonusData?.anggota || 0).toLocaleString()} x3

🎁 *Total Bonus*
Rp ${(global.bonusData?.bonusFinal || 0).toLocaleString()}

🤝 *Penolong Panen*
Rp ${(data.penolong || 0).toLocaleString()}

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
            text: reply,
            parse_mode: "Markdown",
            reply_markup: keyboardMenu
          }
        );

      } catch (err) {

        console.log("ERROR LAPORAN:", err);

        await axios.post(
          `https://api.telegram.org/bot${TOKEN}/sendMessage`,
          {
            chat_id: chatId,
            text: "❌ Gagal mengambil laporan",
            reply_markup: keyboardMenu
          }
        );
      }

      return;
    }

    // ========================================
    // 📥 VALIDASI INPUT
    // ========================================

    if (!textMsg.includes("harga")) {

      await axios.post(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          chat_id: chatId,

          text:
`❌ Format tidak dikenali

Gunakan tombol menu di bawah 👇`,

          reply_markup: keyboardMenu
        }
      );

      return;
    }

    // ========================================
    // 📥 KIRIM KE GOOGLE SHEET
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

    // ========================================
    // 🔥 HITUNG UPAH DASAR
    // ========================================

    const upahDasar =
      ton * 260;

    // ========================================
    // 🔥 HITUNG PER ORANG
    // ========================================

    const perOrangAsli =
      Math.floor(upahDasar / 4);

    // ========================================
    // 🤖 BALASAN BOT
    // ========================================

    const replyText = `
✅ *Data berhasil disimpan*

🌴 Tonase
${ton.toLocaleString()} Kg

💰 Harga
Rp ${harga.toLocaleString()}

👷 Upah Dasar
Rp ${upahDasar.toLocaleString()}

👤 Per Orang Asli
Rp ${perOrangAsli.toLocaleString()}

💡 Silakan tentukan pembagian:

contoh:
anggota berapa ketua berapa
`;

    await axios.post(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: replyText,
        parse_mode: "Markdown",
        reply_markup: keyboardMenu
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
