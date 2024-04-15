const VAT = 1.17;

function getInvoices() {
  return JSON.parse(localStorage.getItem("invoices")) ?? [];
}

function storeInvoices(invoices) {
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function themeChangeListener() {
  const themeSelectors = document.querySelectorAll("#dark, #light");

  themeSelectors.forEach((theme) => {
    theme.addEventListener("click", () => {
      document.documentElement.setAttribute("data-theme", theme.id);
    });
  });
}

function addFormListener() {
  const form = document.querySelector("#add-invoice-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    addInvoice({
      desc: document.querySelector("#desc").value,
      quantity: document.querySelector("#quantity").value,
      price: document.querySelector("#price").value,
    });

    reloadTable();

    document.querySelector("#add-invoice-form").reset();
  });
}

function addListeners(buttons, fn) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      fn(button.parentElement.dataset.id);
      reloadTable();
      if (button.classList.contains("edit")) {
        toggleButtons();
      }
    });
  });
}

function createTableFooter() {
  const invoices = getInvoices();
  let subtotal = 0;
  invoices.forEach((invoice) => {
    subtotal += invoice.quantity * invoice.price;
  });
  let total = (subtotal * VAT).toFixed(2);
  let taxes = (total - subtotal).toFixed(2);
  return `
    <tfoot>
        <tr>
            <td class="footer-data" colspan="2">Subtotal: ${subtotal}</td>
            <td class="footer-data" colspan="2">VAT total: ${taxes}</td>
            <td class="footer-data" colspan="4">Total: ${total}</td>
        </tr>
    </tfoot>`;
}

function createInvoiceRow(invoice, index) {
  const subtotal = (invoice.quantity * invoice.price).toFixed(2);
  const total = (subtotal * VAT).toFixed(2);

  return `
    <tr>
        <td>${index + 1}</td>
        <td class="invoice-desc editable">${invoice.desc}</td>
        <td class="invoice-quantity editable">${invoice.quantity}</td>
        <td class="invoice-price editable">${invoice.price}</td>
        <td>${subtotal}</td>
        <td>${total}</td>
        <td>
            <div class="action-buttons d-flex justify-content-center gap-4" data-id="${index}">
                <button class="fw-bold btn btn-primary px-3 edit">
                EDIT
                </button>
                <button class="fw-bold btn btn-primary px-3 delete">
                DELETE
                </button>
            </div>
        </td>
    </tr>`;
}

function reloadTable() {
  const invoices = getInvoices();
  const tableBody = document.querySelector("#table-body");

  tableBody.innerHTML = "";

  invoices.forEach((invoice, index) => {
    tableBody.insertAdjacentHTML("beforeend", createInvoiceRow(invoice, index));
  });

  tableBody.insertAdjacentHTML("beforeend", createTableFooter());

  addListeners(document.querySelectorAll(".delete"), deleteInvoice);

  addListeners(document.querySelectorAll(".edit"), editInvoice);
}

function addInvoice(invoice) {
  const invoices = getInvoices();

  invoices.push(invoice);

  storeInvoices(invoices);

  reloadTable();
}

function toggleButtons() {
  // Freeze all other buttons when we are in edit mode
  const editButtons = document.querySelectorAll(".edit, .delete");
  editButtons.forEach((button) => {
    button.disabled = !button.disabled;
  });
}

function editInvoice(i) {
  const addButton = document.querySelector("#add-invoice");
  const invoices = getInvoices();
  const invoice = invoices[i];
  const form = document.querySelector("#add-invoice-form");
  const inputs = {
    desc: document.querySelector("#desc"),
    quantity: document.querySelector("#quantity"),
    price: document.querySelector("#price"),
  };

  for (const key in inputs) {
    inputs[key].value = invoice[key];
  }

  addButton.style.display = "none";

  form.insertAdjacentHTML(
    "beforeend",
    `<button id="edit-invoice" class="fw-bold btn px-5">EDIT INVOICE #${
      +i + 1
    }</button>`
  );

  const editButton = document.querySelector("#edit-invoice");

  editButton.addEventListener("click", (e) => {
    e.preventDefault();
    for (const key in inputs) {
      invoice[key] = inputs[key].value;
    }

    storeInvoices(invoices);
    form.reset();
    addButton.style.display = "block";
    editButton.remove(true);

    reloadTable();
  });
}

async function deleteInvoice(i) {
  const invoices = getInvoices();

  Swal.fire({
    title: "Are you sure you want to delete the invoice?",
    showCancelButton: true,
    confirmButtonColor: "#59d0ff",
    cancelButtonColor: "#ff4646",
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
      invoices.splice(i, 1);
      Swal.fire({
        title: "Invoice deleted",
      });
    }
    storeInvoices(invoices);
    reloadTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  themeChangeListener();
  addFormListener();
  reloadTable();
});
