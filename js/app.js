const pb = new PocketBase("https://eko012309.alwaysdata.net"); // change to your domain

$(document).ready(function () {
  // Load partials
  $("#header").load("partials/header.html", function () {
    if (pb.authStore.model) {
      $("#usernameDisplay").text(pb.authStore.model.name);
    }
  });

  $("#sidebarContainer").load("partials/sidebar.html", function () {
    // Toggle sidebar for mobile
    $(document).on("click", "#toggleSidebar", function () {
      $("#sidebar").addClass("show");
    });

    // Close sidebar (FIXED)
    $(document).on("click", "#closeSidebar", function () {
      $("#sidebar").removeClass("show");
    });
  });

  $("#footer").load("partials/footer.html");

  // Redirect if not logged in
  if (!pb.authStore.isValid) {
    window.location.href = "index.html";
  }

  $(".select2").select2();

  // Logout modal
  $(document).on("click", "#logoutBtn", function () {
    $("#logoutModal").modal("show");
  });

  $(document).on("click", "#confirmLogoutBtn", function () {
    pb.authStore.clear();
    window.location.href = "index.html?loggedout=1";
  });
});
