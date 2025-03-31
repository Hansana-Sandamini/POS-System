import { saveCustomer, getAllCustomers, updateCustomer, deleteCustomer } from "../model/Customer.js";

$(document).ready(function () {
  initializeCustomerController();
});

function initializeCustomerController() {
  refresh();
  setupEventListeners();
  setupValidation();
}

function setupEventListeners() {
  document.querySelector("#CustomerManage #customerForm").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  $("#CustomerManage .saveBtn").click(handleSave);
  $("#CustomerManage .updateBtn").click(handleUpdate);
  $("#CustomerManage .removeBtn").click(handleDelete);
  $("#CustomerManage .searchBtn").click(handleSearch);
  $("#CustomerManage .clearBtn").click(refresh);

  $("#CustomerManage .tableRow").on("click", "tr", function () {
    const cells = $(this).children("td");
    $("#CustomerManage .custId").val(cells.eq(0).text()).trigger("input");
    $("#CustomerManage .custName").val(cells.eq(1).text()).trigger("input");
    $("#CustomerManage .custAddress").val(cells.eq(2).text()).trigger("input");
    $("#CustomerManage .custSalary").val(cells.eq(3).text()).trigger("input");
  });
}

function setupValidation() {
  $("#CustomerManage .custId, #CustomerManage .custName, #CustomerManage .custAddress, #CustomerManage .custSalary")
    .on("input", function() {
      validateField($(this));
    })
    .on("focus", function() {
      if (!$(this).val()) showValidationMessage(this);
    });
}

function validateField($input) {
  const field = $input.attr("class").split(" ")[0];
  const value = $input.val();
  let isValid = false;

  switch(field) {
    case 'custId':
      isValid = /^C00-\d{3}$/.test(value);
      setValidationState($input, isValid, "Cus ID is a required field : Pattern C00-001");
      break;
    case 'custName':
      isValid = value.length >= 5 && value.length <= 20 && /^[A-Za-z ]+$/.test(value);
      setValidationState($input, isValid, "Cus Name is a required field : Minimum 5, Max 20, Spaces Allowed");
      break;
    case 'custAddress':
      isValid = value.length >= 7;
      setValidationState($input, isValid, "Cus Address is a required field : Minimum 7");
      break;
    case 'custSalary':
      isValid = value && parseFloat(value) > 0;
      setValidationState($input, isValid, "Cus Salary is a required field : Pattern 100.00 or 100");
      break;
  }
}

function setValidationState($input, isValid, errorMessage) {
  const fieldClass = $input.attr("class").split(" ")[0];
  const $errorElement = $(`#CustomerManage .invalid${fieldClass.charAt(0).toUpperCase() + fieldClass.slice(1)}`);

  $input.removeClass("valid-field invalid-field");
  
  if ($input.val().length === 0) {
    $errorElement.text("");
    return;
  }

  if (isValid) {
    $input.addClass("valid-field");
    $errorElement.text("");
  } else {
    $input.addClass("invalid-field");
    $errorElement.text(errorMessage);
  }
}

function showValidationMessage(input) {
  const $input = $(input);
  const field = $input.attr("class").split(" ")[0];
  let message = "";

  switch(field) {
    case 'custId': message = "Cus ID is a required field : Pattern C00-001"; break;
    case 'custName': message = "Cus Name is a required field : Minimum 5, Max 20, Spaces Allowed"; break;
    case 'custAddress': message = "Cus Address is a required field : Minimum 7"; break;
    case 'custSalary': message = "Cus Salary is a required field : Pattern 100.00 or 100"; break;
  }

  $(`#CustomerManage .invalid${field.charAt(0).toUpperCase() + field.slice(1)}`).text(message);
}

function handleSave() {
  if (!validateAllFields()) {
    showAlert("Please fix validation errors", "danger");
    return;
  }

  const customer = getFormData();
  
  if (getAllCustomers().some(c => c.custId === customer.custId)) {
    $("#CustomerManage .custId").addClass("invalid-field");
    $("#CustomerManage .invalidCustId").text("Customer ID already exists!");
    showAlert("Customer ID already exists!", "danger");
    return;
  }

  saveCustomer(customer);
  showAlert("Customer saved successfully!", "success");
  refresh();
}

function handleUpdate() {
  if (!validateAllFields()) {
    showAlert("Please fix validation errors", "danger");
    return;
  }

  const customer = getFormData();
  const customers = getAllCustomers();
  const index = customers.findIndex(c => c.custId === customer.custId);

  if (index === -1) {
    showAlert("Customer not found!", "danger");
    return;
  }

  updateCustomer(index, customer);
  showAlert("Customer updated successfully!", "success");
  refresh();
}

function handleDelete() {
  const id = $("#CustomerManage .custId").val();
  const customers = getAllCustomers();
  const index = customers.findIndex(c => c.custId === id);

  if (index === -1) {
    showAlert("Customer not found!", "danger");
    return;
  }

  if (!confirm("Are you sure you want to delete this customer?")) return;

  deleteCustomer(index);
  showAlert("Customer deleted successfully!", "success");
  refresh();
}

function handleSearch() {
  const customer = searchCustomer($("#CustomerManage .custId").val());
  if (customer) {
    $("#CustomerManage .custName").val(customer.custName).trigger("input");
    $("#CustomerManage .custAddress").val(customer.custAddress).trigger("input");
    $("#CustomerManage .custSalary").val(customer.custSalary).trigger("input");
  } else {
    showAlert("Customer not found!", "danger");
  }
}

function validateAllFields() {
  let isValid = true;
  
  $("#CustomerManage .custId, #CustomerManage .custName, #CustomerManage .custAddress, #CustomerManage .custSalary")
    .each(function() {
      validateField($(this));
      if ($(this).hasClass("invalid-field")) isValid = false;
    });

  return isValid;
}

function getFormData() {
  return {
    custId: $("#CustomerManage .custId").val(),
    custName: $("#CustomerManage .custName").val(),
    custAddress: $("#CustomerManage .custAddress").val(),
    custSalary: $("#CustomerManage .custSalary").val()
  };
}

function refresh() {
  $("#CustomerManage .custId").val(createCustomerId());
  $("#CustomerManage .custName, #CustomerManage .custAddress, #CustomerManage .custSalary").val("");

  $(".invalidCustId, .invalidCustName, .invalidCustAddress, .invalidCustSalary").text("");
  $("#CustomerManage input").removeClass("valid-field invalid-field");

  reloadTable();
}

function reloadTable() {
  const $tableBody = $("#CustomerManage .tableRow");
  $tableBody.empty();
  
  getAllCustomers().forEach(customer => {
    $tableBody.append(`
      <tr>
        <td>${customer.custId}</td>
        <td>${customer.custName}</td>
        <td>${customer.custAddress}</td>
        <td>${customer.custSalary}</td>
      </tr>
    `);
  });
}

function searchCustomer(id) {
  return getAllCustomers().find(c => c.custId === id);
}

function createCustomerId() {
  const customers = getAllCustomers();
  if (!customers.length) return "C00-001";

  const lastId = customers[customers.length - 1].custId || "C00-000";
  const nextNum = parseInt(lastId.split("-")[1]) + 1;
  return `C00-${nextNum.toString().padStart(3, "0")}`;
}

function showAlert(message, type) {
  const $alert = $(`
    <div class="custom-alert alert-${type}">
      ${message}
      <span class="close-alert">&times;</span>
    </div>
  `).appendTo("body");

  setTimeout(() => $alert.fadeOut(500, () => $alert.remove()), 3000);
}


