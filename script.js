// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// URL’den weddingId parametresi al
const urlParams = new URLSearchParams(window.location.search);
const weddingId = urlParams.get('wedding') || "default";

let selectedAttendance = "";

// Katılım butonları
document.querySelectorAll(".attendanceBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedAttendance = btn.getAttribute("data-value");
    document.querySelectorAll(".attendanceBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Form gönderme
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  if (!selectedAttendance) {
    alert("Lütfen katılım durumunuzu seçin!");
    return;
  }

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const guestCount = parseInt(document.getElementById("guestCount").value);

  try {
    // Zaten kayıtlı mı kontrol (aynı düğün için)
    const existing = await db.collection("guests")
      .where("firstName", "==", firstName)
      .where("lastName", "==", lastName)
      .where("phone", "==", phone)
      .where("weddingId", "==", weddingId)
      .get();

    if (!existing.empty) {
      alert("Zaten kaydınız mevcut!");
      return;
    }

    // Veriyi kaydet
    await db.collection("guests").add({
      weddingId,
      firstName,
      lastName,
      phone,
      attendance: selectedAttendance,
      guestCount
    });

    // Formu temizle ve mesaj göster
    document.getElementById("rsvpForm").reset();
    document.querySelectorAll(".attendanceBtn").forEach(b => b.classList.remove("active"));
    selectedAttendance = "";

    document.getElementById("rsvpForm").classList.add("hidden");
    document.getElementById("confirmation").classList.remove("hidden");

  } catch (err) {
    console.error("Kayıt hatası:", err);
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
});
