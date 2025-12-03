window.PocketBase = window.PocketBase.default || window.PocketBase;
const pb = new PocketBase("https://eko012309.alwaysdata.net");

$(document).ready(function () {
  // Redirect if not logged in
  if (!pb.authStore.isValid) {
    window.location.href = "index.html";
  }

  // Logout modal
  $(document).on("click", "#logoutBtn", function () {
    $("#logoutModal").modal("show");
  });

  $(document).on("click", "#confirmLogoutBtn", function () {
    pb.authStore.clear();
    window.location.href = "index.html?loggedout=1";
  });

  //   sidebar active
  $(document).ready(function () {
    let currentPage = window.location.pathname.split("/").pop(); // get file name

    $("#sidebar a.nav-link").each(function () {
      let linkPage = $(this).attr("href");

      // Match exact page
      if (linkPage === currentPage) {
        $(this).addClass("active");

        // If inside submenu, open the parent collapse
        let parentCollapse = $(this).closest(".collapse");
        if (parentCollapse.length) {
          parentCollapse.addClass("show"); // open submenu

          // Highlight the parent menu title
          parentCollapse.prev(".nav-link").addClass("active");
        }
      }
    });
  });
});

const BASE_URL =
  window.location.hostname === "rekap-v2.local"
    ? "/" // local path
    : "/sim-masjid/"; // GitHub Pages path

// tanggal format
function formatTanggalIndo(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const bulanIndo = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agt",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const d = date.getDate();
  const m = bulanIndo[date.getMonth()];
  const y = date.getFullYear();

  return `${d} ${m} ${y}`;
}

function formatTanggalIndoFull(dateStr) {
  const tgl = new Date(dateStr);

  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${hari[tgl.getDay()]}, ${tgl.getDate()} ${
    bulan[tgl.getMonth()]
  } ${tgl.getFullYear()}`;
}

$(document).ready(function () {
  const $tanggal = $("#tanggal");

  if ($tanggal.length && !$tanggal.val()) {
    const today = new Date().toISOString().split("T")[0];
    $tanggal.val(today);
  }
});

// // ======================================================
//  TOAST FUNCTION (Bootstrap 5)
// ======================================================
window.showToast = function (message, type = "success") {
  let bg = type === "success" ? "bg-success" : "bg-danger";

  let toast = `
    <div class="toast align-items-center text-white ${bg} border-0" role="alert" aria-live="assertive">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;

  $("#toastContainer").append(toast);

  let $toast = $("#toastContainer .toast").last();
  let bsToast = new bootstrap.Toast($toast);
  bsToast.show();
};

// Add container if not exists
$(document).ready(function () {
  if ($("#toastContainer").length === 0) {
    $("body").append(
      `<div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>`
    );
  }
});
