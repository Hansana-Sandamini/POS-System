import { saveItem, getAllItems, updateItem, deleteItem } from "../model/Item.js";

$(document).ready(function () {
  initializeItemController();
});

function initializeItemController() {
  refresh();
  setupEventListeners();
  setupValidation();
}

function setupEventListeners() {
  document.querySelector("#ItemManage #ItemForm").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  $("#ItemManage .saveBtn").click(handleSave);
  $("#ItemManage .removeBtn").click(handleDelete);
  $("#ItemManage .updateBtn").click(handleUpdate);
  $("#ItemManage .searchBtn").click(handleSearch);
  $("#ItemManage .clearBtn").click(refresh);

  $("#ItemManage .tableRow").on("click", "tr", function () {
    const cells = $(this).children("td");
    $("#ItemManage .itemId").val(cells.eq(0).text()).trigger("input");
    $("#ItemManage .itemName").val(cells.eq(1).text()).trigger("input");
    $("#ItemManage .itemQty").val(cells.eq(2).text()).trigger("input");
    $("#ItemManage .itemPrice").val(cells.eq(3).text()).trigger("input");
  });
}

function setupValidation() {
  $("#ItemManage .itemId, #ItemManage .itemName, #ItemManage .itemQty, #ItemManage .itemPrice")
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
    case 'itemId':
      isValid = /^I00-\d{3}$/.test(value);
      setValidationState($input, isValid, "Item ID is a required field : Pattern I00-001");
      break;
    case 'itemName':
      isValid = value.length >= 5 && value.length <= 20 && /^[A-Za-z ]+$/.test(value);
      setValidationState($input, isValid, "Item Name is a required field : Minimum 5, Max 20, Spaces Allowed");
      break;
    case 'itemQty':
      isValid = value && parseInt(value) > 0;
      setValidationState($input, isValid, "Item Quantity is a required field : Only positive numbers");
      break;
    case 'itemPrice':
      isValid = value && parseFloat(value) > 0;
      setValidationState($input, isValid, "Item Price is a required field : Pattern 100.00 or 100");
      break;
  }
}

function setValidationState($input, isValid, errorMessage) {
  const fieldClass = $input.attr("class").split(" ")[0];
  const errorClass = fieldClass.replace("item", "invalid");
  const $errorElement = $(`#ItemManage .${errorClass}`);

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
    case 'itemId': message = "Item ID is a required field : Pattern I00-001"; break;
    case 'itemName': message = "Item Name is a required field : Minimum 5, Max 20, Spaces Allowed"; break;
    case 'itemQty': message = "Item Quantity is a required field : Only positive numbers"; break;
    case 'itemPrice': message = "Item Price is a required field : Pattern 100.00 or 100"; break;
  }

  const errorClass = field.replace("item", "invalid");
  $(`#ItemManage .${errorClass}`).text(message);
}

function handleSave() {
  if (!validateAllFields()) {
    showAlert("Please fix validation errors", "danger");
    return;
  }

  const item = getFormData();
  
  if (getAllItems().some(i => i.itemId === item.itemId)) {
    $("#ItemManage .itemId").addClass("invalid-field");
    $("#ItemManage .invalidCode").text("Item ID already exists!");
    showAlert("Item ID already exists!", "danger");
    return;
  }

  saveItem(item);
  showAlert("Item saved successfully!", "success");
  refresh();
}

function handleUpdate() {
  if (!validateAllFields()) {
    showAlert("Please fix validation errors", "danger");
    return;
  }

  const item = getFormData();
  const items = getAllItems();
  const index = items.findIndex(i => i.itemId === item.itemId);

  if (index === -1) {
    showAlert("Item not found!", "danger");
    return;
  }

  updateItem(index, item);
  showAlert("Item updated successfully!", "success");
  refresh();
}

function handleDelete() {
  const id = $("#ItemManage .itemId").val();
  const items = getAllItems();
  const index = items.findIndex(i => i.itemId === id);

  if (index === -1) {
    showAlert("Item not found!", "danger");
    return;
  }

  if (!confirm("Are you sure you want to delete this item?")) return;

  deleteItem(index);
  showAlert("Item deleted successfully!", "success");
  refresh();
}

function handleSearch() {
  const items = getAllItems();
  if (items.length === 0) {
    showAlert("No items found!", "info");
    return;
  }
  reloadTable();
  showAlert("All items loaded!", "success");
}

function validateAllFields() {
  let isValid = true;
  
  $("#ItemManage .itemId, #ItemManage .itemName, #ItemManage .itemQty, #ItemManage .itemPrice")
    .each(function() {
      validateField($(this));
      if ($(this).hasClass("invalid-field")) isValid = false;
    });

  return isValid;
}

function getFormData() {
  return {
    itemId: $("#ItemManage .itemId").val(),
    itemName: $("#ItemManage .itemName").val(),
    itemQty: $("#ItemManage .itemQty").val(),
    itemPrice: $("#ItemManage .itemPrice").val()
  };
}

function refresh() {
  $("#ItemManage .itemId").val(generateItemId());
  $("#ItemManage .itemName, #ItemManage .itemQty, #ItemManage .itemPrice").val("");

  $(".invalidCode, .invalidName, .invalidQty, .invalidPrice").text("");
  $("#ItemManage input").removeClass("valid-field invalid-field");

  reloadTable();
}

function reloadTable() {
  const $tableBody = $("#ItemManage .tableRow");
  $tableBody.empty();
  
  getAllItems().forEach(item => {
    $tableBody.append(`
      <tr>
        <td>${item.itemId}</td>
        <td>${item.itemName}</td>
        <td>${item.itemQty}</td>
        <td>${item.itemPrice}</td>
      </tr>
    `);
  });
}

function generateItemId() {
  const items = getAllItems();
  if (!items.length) return "I00-001";

  const lastId = items[items.length - 1].itemId || "I00-000";
  const nextNum = parseInt(lastId.split("-")[1]) + 1;
  return `I00-${nextNum.toString().padStart(3, "0")}`;
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