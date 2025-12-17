// ======================================================
//  LIST PAGE (outcome.html)
// ======================================================
if ($("#example").length > 0) {
  $(document).ready(function () {
    window.table = $("#example").DataTable({
      columnDefs: [{ targets: 0, width: "50px" }],
      processing: true,
      serverSide: false, // PB is server, no need serverSide
      ajax: function (data, callback) {
        pb.collection("outcomes")
          .getFullList({ sort: "-created" })
          .then((records) => {
            let rows = records.map((r) => ({
              checkbox: `<input type="checkbox" class="row-checkbox" value="${r.id}">`,
              nama_list_out: r.nama_list_out,
            }));

            callback({ data: rows });
          });
      },
      columns: [
        { data: "checkbox", orderable: false, searchable: false },
        { data: "nama_list_out" },
      ],
    });

    // REALTIME
    pb.collection("outcomes").subscribe("*", function () {
      table.ajax.reload(null, false);
      showToast("Data updated (realtime)", "success");
    });

    // Select all
    $(document).on("click", "#select-all", function () {
      $(".row-checkbox").prop("checked", this.checked);
    });

    // Edit
    $("#edit-btn").on("click", function () {
      let selected = $(".row-checkbox:checked");
      if (selected.length !== 1) {
        showToast("Select 1 item to edit", "danger");
        return;
      }
      let id = selected.val();
      window.location.href = BASE_URL + "v/outcome/edit.html?id=" + id;
    });

    let idsToDelete = [];

    // Open modal
    $("#delete-btn").on("click", function () {
      let selected = $(".row-checkbox:checked");
      if (selected.length === 0) {
        showToast("Select items first", "danger");
        return;
      }

      // collect IDs
      idsToDelete = selected
        .map(function () {
          return $(this).val();
        })
        .get();

      // show modal
      $("#confirmDeleteModal").modal("show");
    });

    // Handle DELETE after confirm
    $("#confirmDeleteBtn").on("click", async function () {
      $("#confirmDeleteModal").modal("hide");

      // delete one by one
      for (const id of idsToDelete) {
        try {
          await pb.collection("outcomes").delete(id);
        } catch (err) {
          showToast("Error deleting ID: " + id, "danger");
        }
      }

      showToast("Deleted successfully", "success");

      setTimeout(() => {
        table.ajax.reload(null, false);
      }, 500);
    });
  });
}

// ======================================================
//  CREATE FORM PAGE (outcome/add.html)
// ======================================================
if ($("#outcomeForm").length > 0) {
  $(document).ready(function () {
    $("#outcomeForm").on("submit", async function (e) {
      e.preventDefault();

      let data = {
        nama_list_out: $("#nama_list_out").val(),
        user: pb.authStore.model ? pb.authStore.model.id : null,
      };

      try {
        await pb.collection("outcomes").create(data);

        showToast("Berhasil disimpan!", "success");

        setTimeout(() => {
          window.location.href = "/v/outcome";
        }, 1200);
      } catch (err) {
        showToast("Error: " + err.message, "danger");
      }
    });
  });
}

// ======================================================
// EDIT FORM PAGE (outcome/edit.html)
// ======================================================
// Get ID from URL (?id=xxxx)
// EDIT FORM PAGE (outcome/edit.html)
const urlParams = new URLSearchParams(window.location.search);
const recordId = urlParams.get("id");

if (recordId && $("#outcomeEditForm").length > 0) {
  async function loadoutcomeData() {
    try {
      const record = await pb.collection("outcomes").getOne(recordId);

      $("#outcome_id").val(record.id);
      $("#nama_list_out").val(record.nama_list_out);
    } catch (err) {
      showToast("Failed to load data", "danger");
    }
  }

  loadoutcomeData();

  $("#outcomeEditForm").on("submit", async function (e) {
    e.preventDefault();

    let data = {
      nama_list_out: $("#nama_list_out").val(),
      user: pb.authStore.model ? pb.authStore.model.id : null,
    };

    try {
      await pb.collection("outcomes").update(recordId, data);
      showToast("Updated successfully!", "success");

      setTimeout(() => {
        window.location.href = "/v/outcome";
      }, 1200);
    } catch (err) {
      showToast("Error updating data: " + err.message, "danger");
    }
  });
}
