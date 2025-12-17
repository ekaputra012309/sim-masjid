// ======================================================
//  LIST PAGE (pengeluaran.html)
// ======================================================
if ($("#example").length > 0) {
  $(document).ready(function () {
    window.table = $("#example").DataTable({
      columnDefs: [{ targets: 0, width: "50px" }],
      processing: true,
      serverSide: false, // PB is server, no need serverSide
      ajax: function (data, callback) {
        pb.collection("pengeluaran_headers")
          .getFullList({ sort: "-tanggal", expand: "user" })
          .then((records) => {
            let rows = records.map((r) => ({
              checkbox: `<input type="checkbox" class="row-checkbox" value="${r.id}">`,
              tanggal: formatTanggalIndoFull(r.tanggal),
              total: r.total.toLocaleString(),
              user: r.expand && r.expand.user ? r.expand.user.fullname : "-",
              aksi: `<button class="btn btn-sm btn-secondary detail-btn" data-id="${r.id}">
                        <i class="fas fa-search"></i> Detail
                    </button>`,
            }));

            callback({ data: rows });
          });
      },
      columns: [
        { data: "checkbox", orderable: false, searchable: false },
        { data: "tanggal" },
        { data: "total" },
        { data: "user" },
        { data: "aksi", orderable: false, searchable: false },
      ],
    });

    // REALTIME
    pb.collection("pengeluaran_headers").subscribe("*", function () {
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
      window.location.href = BASE_URL + "v/pengeluaran/edit.html?id=" + id;
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

      for (const id of idsToDelete) {
        try {
          // 1️⃣ Ambil semua DETAIL yang terkait header ini
          const details = await pb
            .collection("pengeluaran_details")
            .getFullList({
              filter: `pengeluaran_header="${id}"`,
            });

          // 2️⃣ Hapus DETAIL satu per satu
          for (const d of details) {
            await pb.collection("pengeluaran_details").delete(d.id);
          }

          // 3️⃣ Hapus HEADER
          await pb.collection("pengeluaran_headers").delete(id);
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

  // CLICK DETAIL BUTTON
  $(document).on("click", ".detail-btn", async function () {
    let id = $(this).data("id");

    $("#detailContent").html("Loading...");
    $("#detailModal").modal("show");

    try {
      // Get HEADER data
      const header = await pb.collection("pengeluaran_headers").getOne(id, {
        expand: "user",
      });

      // Get related DETAILS
      const details = await pb.collection("pengeluaran_details").getFullList({
        filter: `pengeluaran_header="${id}"`,
        sort: "created",
        expand: "outcome",
      });

      let html = `
        <h5>Tanggal: ${formatTanggalIndoFull(header.tanggal)}</h5>
        <h5>Total: Rp ${header.total.toLocaleString()}</h5>
        <h5>User: ${header.expand?.user?.fullname ?? "-"}</h5>
  
        <table class="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Rincian</th>
              <th>Nominal</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
      `;

      details.forEach((d) => {
        html += `
          <tr>
            <td>${
              d.expand?.outcome?.nama_list_out ?? d.custom_rincian ?? "-"
            }</td>
            <td class="d-flex justify-content-between">
              <span>Rp</span>
              <span>${d.nominal.toLocaleString()}</span>
            </td>
            <td>${d.keterangan ?? ""}</td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      $("#detailContent").html(html);
    } catch (err) {
      console.log(err);
      $("#detailContent").html(
        `<div class="text-danger">Error loading detail</div>`
      );
    }
  });
}

// ======================================================
//  CREATE FORM PAGE (pengeluaran/add.html)
// ======================================================
if ($("#pengeluaranForm").length > 0) {
  // load cara outcome dropdown
  // Load Cara outcome from PB
  async function loadoutcomeOptions(selectElem) {
    try {
      if (!selectElem || selectElem.length === 0) {
        console.error("outcome select element not found");
        return;
      }

      // Clear old options
      selectElem.empty();

      selectElem.append(`<option value="">-- Pilih Rincian --</option>`);

      const list = await pb.collection("outcomes").getFullList({
        sort: "nama_list_out",
      });

      // Fill dropdown
      list.forEach((item) => {
        selectElem.append(
          `<option value="${item.id}">${item.nama_list_out}</option>`
        );
      });

      // Add CUSTOM OPTION
      selectElem.append(`<option value="custom">-- Custom Rincian --</option>`);
    } catch (err) {
      console.error("Error load outcomes:", err);
    }
  }

  $(document).ready(function () {
    loadoutcomeOptions($(".outcome-select").first());
  });

  $(document).on("change", ".outcome-select", function () {
    let customInput = $(this).closest("td").find(".custom-input");

    if ($(this).val() === "custom") {
      customInput.removeClass("d-none").focus();
      $(this).addClass("d-none");
    } else {
      customInput.addClass("d-none");
      customInput.val("");
    }
  });

  $("#addRow").on("click", function () {
    let rowCount = $("#detailTable tbody tr").length;

    let newRow = `
        <tr>
            <td>
                <select name="details[${rowCount}][outcome_id]" class="form-control outcome-select"></select>
                <input type="text" name="details[${rowCount}][custom_rincian]" class="form-control mt-2 custom-input d-none" placeholder="Masukkan Rincian Custom">
            </td>
            <td><input type="number" name="details[${rowCount}][nominal]" class="form-control"></td>
            <td><input type="text" name="details[${rowCount}][keterangan]" class="form-control"></td>
            <td>
                <button type="button" class="btn btn-danger btn-sm removeRow">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;

    $("#detailTable tbody").append(newRow);

    let newSelect = $("#detailTable tbody tr").last().find(".outcome-select");
    loadoutcomeOptions(newSelect);
  });

  $(document).on("click", ".removeRow", function () {
    $(this).closest("tr").remove();
  });

  $(document).ready(function () {
    $("#pengeluaranForm").on("submit", async function (e) {
      e.preventDefault();

      try {
        let details = [];
        let total = 0;

        // 🔹 COLLECT ALL DETAILS FIRST
        $("#detailTable tbody tr").each(function () {
          let outcome_id = $(this).find(".outcome-select").val();
          let custom_rincian = $(this).find(".custom-input").val();
          let nominal = parseInt($(this).find("input[name*='nominal']").val());
          let keterangan = $(this).find("input[name*='keterangan']").val();

          details.push({
            outcome: outcome_id === "custom" ? null : outcome_id,
            custom_rincian: outcome_id === "custom" ? custom_rincian : "",
            nominal,
            keterangan,
          });

          total += nominal;
        });

        // 🔹 STEP 2 — Save header WITH total
        const header = await pb.collection("pengeluaran_headers").create({
          tanggal: $("#tanggal").val(),
          user: pb.authStore.model ? pb.authStore.model.id : null,
          total: total,
        });

        // 🔹 STEP 3 — Save each detail (await 1 by 1)
        for (let d of details) {
          await pb.collection("pengeluaran_details").create({
            pengeluaran_header: header.id,
            outcome: d.outcome,
            custom_rincian: d.custom_rincian,
            nominal: d.nominal,
            keterangan: d.keterangan,
          });
        }

        showToast("Berhasil disimpan!", "success");

        setTimeout(() => {
          window.location.href = "/v/pengeluaran";
        }, 1200);
      } catch (err) {
        showToast("Error: " + err.message, "danger");
      }
    });
  });
}

// // Get ID from URL (?id=xxxx)
// // EDIT FORM PAGE (pengeluaran/edit.html)
if ($("#pengeluaranFormEdit").length > 0) {
  let headerId = null; // <<< GLOBAL

  async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    headerId = urlParams.get("id"); // <<< SET GLOBAL
    $("#header_id").val(headerId);

    await loadAlloutcomes();
    await loadEditData(headerId);
  }

  init();

  async function loadEditData(headerId) {
    try {
      const header = await pb
        .collection("pengeluaran_headers")
        .getOne(headerId);
      $("#tanggal").val(header.tanggal.substring(0, 10));

      const details = await pb.collection("pengeluaran_details").getFullList({
        filter: `pengeluaran_header="${headerId}"`,
        sort: "created",
        expand: "outcome",
      });

      $("#detailTableEdit tbody").empty();

      details.forEach((d) => {
        $("#detailTableEdit tbody").append(`
        <tr data-detail-id="${d.id}">
          <td>
            <select class="form-control outcome-select"></select>
            <input type="text" class="form-control mt-2 custom-input ${
              d.custom_rincian ? "" : "d-none"
            }" value="${d.custom_rincian ?? ""}">
          </td>
          <td><input type="number" class="form-control nominal-input" value="${
            d.nominal
          }"></td>
          <td><input type="text" class="form-control ket-input" value="${
            d.keterangan
          }"></td>
          <td>
            <button type="button" class="btn btn-danger btn-sm removeRowEdit" data-id="${
              d.id
            }">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `);

        let selectedoutcomeId =
          d.outcome || (d.expand?.outcome ? d.expand.outcome.id : null);

        loadoutcomeOptions(
          $("#detailTableEdit tbody tr").last().find(".outcome-select"),
          selectedoutcomeId,
          d.custom_rincian
        );
      });
    } catch (err) {
      console.error(err);
      showToast("Error loading edit data", "danger");
    }
  }

  let outcomeList = [];

  async function loadAlloutcomes() {
    outcomeList = await pb.collection("outcomes").getFullList({
      sort: "nama_list_out",
    });
  }

  function loadoutcomeOptions(
    selectElem,
    selectedValue = null,
    customText = ""
  ) {
    if (!selectElem || selectElem.length === 0) return;

    const parentTd = selectElem.closest("td");
    const customInput = parentTd.find(".custom-input");

    // reset
    selectElem.removeClass("d-none");
    customInput.addClass("d-none");

    selectElem.empty();
    selectElem.append(`<option value="">-- Pilih Rincian --</option>`);

    outcomeList.forEach((item) => {
      selectElem.append(
        `<option value="${item.id}">${item.nama_list_out}</option>`
      );
    });

    selectElem.append(`<option value="custom">-- Custom Rincian --</option>`);

    // CASE 1: Has outcome → select dropdown
    if (selectedValue && selectedValue !== "custom") {
      selectElem.val(selectedValue);
    }

    // CASE 2: Has custom rincian → hide dropdown and show custom input
    else if (customText && customText.trim() !== "") {
      selectElem.val("custom");
      selectElem.addClass("d-none");
      customInput.removeClass("d-none").val(customText);
    }

    // CASE 3: No outcome & no custom → leave empty
  }

  let deletedDetails = [];

  $(document).on("click", ".removeRowEdit", function () {
    let id = $(this).data("id");

    if (id) deletedDetails.push(id);

    $(this).closest("tr").remove();
  });

  // Delegated handler — works for both create & edit tables and for dynamically added rows
  $(document).on("change", ".outcome-select", function () {
    const $select = $(this);
    const $td = $select.closest("td");
    const $customInput = $td.find(".custom-input");

    // If user selects "custom" -> show input, hide select (keputusan desain Anda)
    if ($select.val() === "custom") {
      $customInput.removeClass("d-none").focus();
      $select.addClass("d-none");
    } else {
      // If user selects a normal outcome -> hide custom input and clear it
      $customInput.addClass("d-none").val("");
      // If select was hidden because previously custom, show it again
      $select.removeClass("d-none");
    }
  });

  $("#addRow").on("click", function () {
    const newRow = `
      <tr data-detail-id="">
        <td>
          <select class="form-control outcome-select"></select>
          <input type="text" class="form-control mt-2 custom-input d-none" placeholder="Masukkan Rincian Custom">
        </td>
        <td><input type="number" class="form-control nominal-input"></td>
        <td><input type="text" class="form-control ket-input"></td>
        <td>
          <button type="button" class="btn btn-danger btn-sm removeRowEdit">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;

    $("#detailTableEdit tbody").append(newRow);

    let newSelect = $("#detailTableEdit tbody tr")
      .last()
      .find(".outcome-select");
    loadoutcomeOptions(newSelect);
  });

  $("#updateBtn").on("click", async function () {
    try {
      let total = 0;
      let updateDetails = [];
      let newDetails = [];

      // Collect all rows
      $("#detailTableEdit tbody tr").each(function () {
        let detailId = $(this).data("detail-id");

        let outcome_val = $(this).find(".outcome-select").val();
        let custom_val = $(this).find(".custom-input").val();
        let nominal = parseInt($(this).find(".nominal-input").val());
        let ket = $(this).find(".ket-input").val();

        total += nominal;

        let data = {
          outcome: outcome_val === "custom" ? null : outcome_val,
          custom_rincian: outcome_val === "custom" ? custom_val : "",
          nominal,
          keterangan: ket,
        };

        if (detailId) {
          updateDetails.push({ id: detailId, data });
        } else {
          newDetails.push(data);
        }
      });

      // UPDATE HEADER
      await pb.collection("pengeluaran_headers").update(headerId, {
        tanggal: $("#tanggal").val(),
        total: total,
      });

      // DELETE REMOVED DETAILS
      for (let id of deletedDetails) {
        await pb.collection("pengeluaran_details").delete(id);
      }

      // UPDATE existing details
      for (let d of updateDetails) {
        await pb.collection("pengeluaran_details").update(d.id, d.data);
      }

      // CREATE new details
      for (let d of newDetails) {
        await pb.collection("pengeluaran_details").create({
          pengeluaran_header: headerId,
          ...d,
        });
      }

      showToast("Berhasil diupdate!", "success");
      setTimeout(() => (window.location.href = "/v/pengeluaran"), 800);
    } catch (err) {
      console.log(err);
      showToast("Error: " + err.message, "danger");
    }
  });
}
