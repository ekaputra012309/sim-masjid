$(document).ready(function () {
  // Load partials
  $("#header").load(BASE_URL + "partials/header.html", function () {
    if (pb.authStore.model) {
      $("#usernameDisplay").text(pb.authStore.model.fullname);
    }
  });

  $("#sidebarContainer").load(BASE_URL + "partials/sidebar.html", function () {
    // Toggle sidebar for mobile
    $(document).on("click", "#toggleSidebar", function () {
      $("#sidebar").addClass("show");
    });

    // Close sidebar (FIXED)
    $(document).on("click", "#closeSidebar", function () {
      $("#sidebar").removeClass("show");
    });
  });

  $("#footer").load(BASE_URL + "partials/footer.html");
});
