// ======================================================
//  LIST PAGE (gib.html)
// ======================================================
if ($("#example").length > 0) {
  $(document).ready(function () {
    window.table = $("#example").DataTable({
      columnDefs: [{ targets: 0, width: "50px" }],
      processing: true,
      serverSide: false, // PB is server, no need serverSide
      ajax: function (data, callback) {
        pb.collection("gibs")
          .getFullList({ sort: "-created", expand: "bayar" })
          .then((records) => {
            let rows = records.map((r) => ({
              checkbox: `<input type="checkbox" class="row-checkbox" value="${r.id}">`,
              tanggal: formatTanggalIndo(r.tanggal),
              nama_donatur: r.nama_donatur,
              nominal: r.nominal,
              bayar:
                r.expand && r.expand.bayar ? r.expand.bayar.cara_bayar : "-",
            }));

            callback({ data: rows });
          });
      },
      columns: [
        { data: "checkbox", orderable: false, searchable: false },
        { data: "tanggal" },
        { data: "nama_donatur" },
        { data: "nominal" },
        { data: "bayar" },
      ],
    });

    // REALTIME
    pb.collection("gibs").subscribe("*", function () {
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
      window.location.href = BASE_URL + "gib/edit.html?id=" + id;
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
          await pb.collection("gibs").delete(id);
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
//  CREATE FORM PAGE (gib/add.html)
// ======================================================
if ($("#gibForm").length > 0) {
  // load cara bayar dropdown
  // Load Cara Bayar from PB
  async function loadBayarOptions() {
    try {
      const list = await pb
        .collection("bayars")
        .getFullList({ sort: "cara_bayar" });

      list.forEach((item) => {
        $("#bayar").append(
          `<option value="${item.id}">${item.cara_bayar}</option>`
        );
      });

      // Activate Select2
      $("#bayar").select2({
        width: "100%",
        placeholder: "Pilih Cara Bayar",
        allowClear: true,
      });
    } catch (err) {
      console.error("Error loading bayar:", err);
    }
  }

  loadBayarOptions();

  $(document).ready(function () {
    $("#gibForm").on("submit", async function (e) {
      e.preventDefault();

      let data = {
        tanggal: $("#tanggal").val(),
        nama_donatur: $("#nama_donatur").val(),
        nominal: $("#nominal").val(),
        bayar: $("#bayar").val(),
        user: pb.authStore.model ? pb.authStore.model.id : null,
      };

      try {
        await pb.collection("gibs").create(data);

        showToast("Berhasil disimpan!", "success");

        setTimeout(() => {
          window.location.href = "../gib.html";
        }, 1200);
      } catch (err) {
        showToast("Error: " + err.message, "danger");
      }
    });
  });
}

// ======================================================
// EDIT FORM PAGE (gib/edit.html)
// ======================================================
// Get ID from URL (?id=xxxx)
// EDIT FORM PAGE (gib/edit.html)
const urlParams = new URLSearchParams(window.location.search);
const recordId = urlParams.get("id");

if (recordId && $("#gibEditForm").length > 0) {
  async function loadBayarOptionsEdit(selected) {
    const list = await pb
      .collection("bayars")
      .getFullList({ sort: "cara_bayar" });

    // Fill options first
    list.forEach((item) => {
      $("#bayare").append(
        `<option value="${item.id}">${item.cara_bayar}</option>`
      );
    });

    // Initialize select2 AFTER options added
    $("#bayare").select2({ width: "100%" });

    // Apply selected value AFTER select2 is fully initialized
    if (selected) {
      setTimeout(() => {
        $("#bayare").val(selected).trigger("change");
      }, 0);
    }
  }

  async function loadgibData() {
    try {
      const record = await pb.collection("gibs").getOne(recordId);

      $("#gib_id").val(record.id);
      $("#tanggal").val(record.tanggal.substring(0, 10));
      $("#nama_donatur").val(record.nama_donatur);
      $("#nominal").val(record.nominal);
      loadBayarOptionsEdit(record.bayar); // set selected option
    } catch (err) {
      showToast("Failed to load data", "danger");
    }
  }

  loadgibData();

  $("#gibEditForm").on("submit", async function (e) {
    e.preventDefault();

    let data = {
      tanggal: $("#tanggal").val(),
      nama_donatur: $("#nama_donatur").val(),
      nominal: $("#nominal").val(),
      bayar: $("#bayare").val(),
      user: pb.authStore.model ? pb.authStore.model.id : null,
    };

    try {
      await pb.collection("gibs").update(recordId, data);
      showToast("Updated successfully!", "success");

      setTimeout(() => {
        window.location.href = "../gib.html";
      }, 1200);
    } catch (err) {
      showToast("Error updating data: " + err.message, "danger");
    }
  });
}
