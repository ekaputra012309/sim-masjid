// ======================================================
//  LIST PAGE (saldo.html)
// ======================================================
if ($("#example").length > 0) {
  $(document).ready(function () {
    window.table = $("#example").DataTable({
      columnDefs: [{ targets: 0, width: "50px" }],
      processing: true,
      serverSide: false, // PB is server, no need serverSide
      ajax: function (data, callback) {
        pb.collection("saldo")
          .getFullList({ sort: "-created" })
          .then((records) => {
            let rows = records.map((r) => ({
              checkbox: `<input type="checkbox" class="row-checkbox" value="${r.id}">`,
              saldo_awal: r.saldo_awal,
            }));

            callback({ data: rows });
          });
      },
      columns: [
        { data: "checkbox", orderable: false, searchable: false },
        { data: "saldo_awal" },
      ],
    });

    // REALTIME
    pb.collection("saldo").subscribe("*", function () {
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
      window.location.href = BASE_URL + "saldo/edit.html?id=" + id;
    });
  });
}

// ======================================================
// EDIT FORM PAGE (saldo/edit.html)
// ======================================================
// Get ID from URL (?id=xxxx)
// EDIT FORM PAGE (saldo/edit.html)
const urlParams = new URLSearchParams(window.location.search);
const recordId = urlParams.get("id");

if (recordId && $("#saldoEditForm").length > 0) {
  async function loadsaldoData() {
    try {
      const record = await pb.collection("saldo").getOne(recordId);

      $("#saldo_id").val(record.id);
      $("#saldo_awal").val(record.saldo_awal);
    } catch (err) {
      showToast("Failed to load data", "danger");
    }
  }

  loadsaldoData();

  $("#saldoEditForm").on("submit", async function (e) {
    e.preventDefault();

    let data = {
      saldo_awal: $("#saldo_awal").val(),
      user: pb.authStore.model ? pb.authStore.model.id : null,
    };

    try {
      await pb.collection("saldo").update(recordId, data);
      showToast("Updated successfully!", "success");

      setTimeout(() => {
        window.location.href = "../saldo.html";
      }, 1200);
    } catch (err) {
      showToast("Error updating data: " + err.message, "danger");
    }
  });
}
