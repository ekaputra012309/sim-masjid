// COMPANY EDIT PAGE (company_edit.html)

$(document).ready(function () {
  if (!pb.authStore.isValid) {
    showToast("You must be logged in", "danger");
    return;
  }

  if ($("#companyEditForm").length > 0) {
    let companyId = null;
    // -----------------------------
    // Load company data
    // -----------------------------
    async function loadCompanyData() {
      try {
        const company = await pb.collection("companies").getFirstListItem("");

        companyId = company.id;

        // isi ke form
        $("#companyEditForm input[name='name']").val(company.name || "");
        $("#companyEditForm input[name='email']").val(company.email || "");
        $("#companyEditForm input[name='phone']").val(company.phone || "");
        $("#companyEditForm textarea[name='address']").val(
          company.address || ""
        );
      } catch (err) {
        showToast("Company data not found", "danger");
      }
    }

    loadCompanyData();

    // -----------------------------
    // Update company
    // -----------------------------
    $("#companyEditForm").on("submit", async function (e) {
      e.preventDefault();

      const data = {
        name: $("#companyEditForm input[name='name']").val(),
        email: $("#companyEditForm input[name='email']").val(),
        phone: $("#companyEditForm input[name='phone']").val(),
        address: $("#companyEditForm textarea[name='address']").val(),
      };

      try {
        await pb.collection("companies").update(companyId, data);

        showToast("Perusahaan berhasil diupdate!", "success");

        setTimeout(() => {
          window.location.href = "company.html";
        }, 1200);
      } catch (err) {
        console.error(err);
        showToast("Error updating company: " + err.message, "danger");
      }
    });
  }
});
