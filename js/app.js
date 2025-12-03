const pb = new PocketBase("https://eko012309.alwaysdata.net"); // change to your domain

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

$(document).ready(function () {
  const $tanggal = $("#tanggal");

  if ($tanggal.length && !$tanggal.val()) {
    const today = new Date().toISOString().split("T")[0];
    $tanggal.val(today);
  }
});
