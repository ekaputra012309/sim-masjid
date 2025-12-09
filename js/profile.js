// PROFILE PAGE (profile.html / account settings)
if (pb.authStore.isValid) {
  const userId = pb.authStore.model.id;

  // -----------------------------
  // Load user data to form
  // -----------------------------
  async function loadUserProfile() {
    try {
      const user = await pb.collection("users").getOne(userId);

      $("#profileEditForm input[name='fullname']").val(user.fullname || "");
      $("#profileEditForm input[name='name']").val(user.name || "");
      $("#profileEditForm input[name='email']").val(user.email || "");
    } catch (err) {
      showToast("Failed to load user data", "danger");
    }
  }

  loadUserProfile();

  // -----------------------------
  // UPDATE PROFILE
  // -----------------------------
  $("#profileEditForm").on("submit", async function (e) {
    e.preventDefault();

    const data = {
      fullname: $("#profileEditForm input[name='fullname']").val(),
      name: $("#profileEditForm input[name='name']").val(),
      email: $("#profileEditForm input[name='email']").val(),
    };

    try {
      await pb.collection("users").update(userId, data);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast("Error updating profile: " + err.message, "danger");
    }
  });

  // -----------------------------
  // UPDATE PASSWORD
  // -----------------------------
  $("#profileEditPasswordForm").on("submit", async function (e) {
    e.preventDefault();

    const currentPassword = $(
      "#profileEditPasswordForm input[name='current_password']"
    ).val();

    const newPassword = $(
      "#profileEditPasswordForm input[name='password']"
    ).val();

    const confirmPassword = $(
      "#profileEditPasswordForm input[name='password_confirmation']"
    ).val();

    if (newPassword !== confirmPassword) {
      showToast("Password confirmation does not match!", "danger");
      return;
    }

    try {
      // Update password
      await pb.collection("users").update(userId, {
        password: newPassword,
        passwordConfirm: confirmPassword,
        oldPassword: currentPassword,
      });

      showToast("Password updated successfully!", "success");

      // Clear form
      $("#profileEditPasswordForm")[0].reset();
    } catch (err) {
      showToast("Error updating password: " + err.message, "danger");
    }
  });
} else {
  showToast("You must be logged in", "danger");
}

// -----------------------------
// TOGGLE SHOW / HIDE PASSWORD
// -----------------------------
$(document).on("click", ".toggle-password", function () {
  const input = $(this).closest(".input-group").find("input");
  const icon = $(this).find("i");

  if (input.attr("type") === "password") {
    input.attr("type", "text");
    icon.removeClass("fa-eye").addClass("fa-eye-slash");
  } else {
    input.attr("type", "password");
    icon.removeClass("fa-eye-slash").addClass("fa-eye");
  }
});
