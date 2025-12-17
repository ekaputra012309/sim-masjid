$(document).ready(function () {
  // Load partials
  $("#header").load("/partials/header.html", function () {
    if (pb.authStore.model) {
      $("#usernameDisplay").text(pb.authStore.model.fullname);
    }
  });

  $("#sidebarContainer").load("/partials/sidebar.html", function () {
    // Toggle sidebar for mobile
    $(document).on("click", "#toggleSidebar", function () {
      $("#sidebar").addClass("show");
    });

    // Close sidebar (FIXED)
    $(document).on("click", "#closeSidebar", function () {
      $("#sidebar").removeClass("show");
    });
  });

  $("#footer").load("/partials/footer.html");
});
