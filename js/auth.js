const pb = new PocketBase("https://eko012309.alwaysdata.net"); // change to your domain

$(document).ready(function () {
  const BASE_URL =
    location.hostname === "rekap-v2.local" ? "/" : "/sim-masjid/";

  /* -----------------------------
             Show / Hide Password
        ----------------------------- */
  $("#togglePassword").click(function () {
    const input = $("#password");
    const icon = $("#toggleIcon");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      input.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });

  /* -----------------------------
             Bootstrap Toast Function
        ----------------------------- */
  function showToast(message, type = "danger") {
    const toastId = "toast" + Date.now();

    const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert">
              <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
              </div>
            </div>`;

    $("#toastBox").append(toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  /* -----------------------------
             Button Loading State
        ----------------------------- */
  function setLoading(state) {
    if (state) {
      $("#loginBtn").prop("disabled", true);
      $("#btnText").addClass("d-none");
      $("#btnSpinner").removeClass("d-none");
    } else {
      $("#loginBtn").prop("disabled", false);
      $("#btnText").removeClass("d-none");
      $("#btnSpinner").addClass("d-none");
    }
  }

  /* -----------------------------
             LOGIN SUBMIT
        ----------------------------- */
  $("#loginForm").on("submit", async function (e) {
    e.preventDefault();
    setLoading(true);

    const email = $("#email").val();
    const password = $("#password").val();

    try {
      await pb.collection("users").authWithPassword(email, password);

      showToast("Login successful! Redirecting…", "success");

      setTimeout(() => {
        window.location.href = BASE_URL + "v/dashboard/";
      }, 800);
    } catch (err) {
      let msg = err.message;

      if (msg.includes("authenticate")) msg = "Wrong username or password!";
      if (msg.includes("invalid login")) msg = "Invalid username!";
      if (msg.includes("password")) msg = "Wrong password!";

      showToast(msg, "danger");
    }

    setLoading(false);
  });

  if (window.location.search.includes("loggedout=1")) {
    showToast("You have been logged out.", "success");
  }
});
