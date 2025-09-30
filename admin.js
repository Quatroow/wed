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

const adminPassword = "gK8$wP3^rM6!zV2@z@Q3m8$T1xtQ9#sF1xY7&uD0";

// URL’den weddingId parametresi al (admin paneli için)
const urlParams = new URLSearchParams(window.location.search);
const weddingId = urlParams.get('wedding') || "default";

// Admin giriş
function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === adminPassword) {
    document.getElementById("adminPanel").classList.remove("hidden");
    listenGuests();
  } else alert("Hatalı şifre!");
}

// Canlı davetli listesi
function listenGuests() {
  db.collection("guests")
    .where("weddingId", "==", weddingId)
    .onSnapshot(snapshot => {
      const tbody = document.querySelector("#guestTable tbody");
      tbody.innerHTML = "";

      let totalYes = 0;
      let totalGuests = 0;
      let allGuests = [];

      snapshot.forEach(doc => {
        const g = doc.data();
        allGuests.push(g);

        const row = document.createElement("tr");
        row.innerHTML = `<td>${g.firstName}</td><td>${g.lastName}</td><td>${g.phone}</td><td>${g.attendance}</td><td>${g.guestCount}</td>`;
        tbody.appendChild(row);

        if (g.attendance === "Evet") {
          totalYes++;
          totalGuests += g.guestCount;
        }
      });

      document.getElementById("totalRecords").innerText = allGuests.length;
      document.getElementById("totalYes").innerText = totalYes;
      document.getElementById("totalGuests").innerText = totalGuests;

      window._allGuests = allGuests;
    });
}

// CSV indir
function downloadCSV() {
  const guests = window._allGuests || [];
  if (!guests.length) return alert("Henüz kayıt yok!");

  let csv = "Ad,Soyad,Telefon,Durum,Kişi Sayısı\n";
  guests.forEach(g => csv += `${g.firstName},${g.lastName},${g.phone},${g.attendance},${g.guestCount}\n`);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "davetli_listesi.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Oturma planı oluşturma
function generateSeating() {
  const capacity = parseInt(document.getElementById("tableCapacity").value);
  const guests = window._allGuests || [];
  if (!guests.length) return alert("Henüz kayıt yok!");

  let seating = [];
  let currentTable = [];
  let currentCap = 0;

  guests.forEach(g => {
    if (g.attendance !== "Evet") return;

    if (currentCap + g.guestCount <= capacity) {
      currentTable.push(g);
      currentCap += g.guestCount;
    } else {
      seating.push(currentTable);
      currentTable = [g];
      currentCap = g.guestCount;
    }
  });

  if (currentTable.length) seating.push(currentTable);
  displaySeating(seating);
}

function displaySeating(seating) {
  const container = document.getElementById("seatingPlan");
  container.innerHTML = "";
  seating.forEach((table, idx) => {
    const tableDiv = document.createElement("div");
    tableDiv.classList.add("table");
    tableDiv.innerHTML = `<h3>Masa ${idx + 1}</h3><ul>` +
      table.map(g => `<li>${g.firstName} ${g.lastName} (${g.guestCount})</li>`).join("") +
      `</ul>`;
    container.appendChild(tableDiv);
  });
}
