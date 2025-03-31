import { saveOrder } from "../model/Order.js";
import { getAllOrders } from "../model/Order.js";
import { getAllCustomers } from "../model/Customer.js";
import { getAllItems, updateItem } from "../model/Item.js";

var itemId;
var itemQty;
var orderQty;
let getItems = [];

$(document).ready(function () {
  refresh();
});

$(".orderManageBtn").click(function () {
  refresh();
});

function refresh() {
  if (!$("#OrderManage .orderId").val() && !$("#OrderManage .searchOrderId").val()) {
    $("#OrderManage .orderId").val(generateId());
  }
  $("#OrderManage .orderDate").val(new Date().toISOString().split("T")[0]);
  loadCustomer();
  loadItems();
}

$("#OrderManage .searchOrderId").on("change", function() {
  let orderId = $(this).val();
  if (orderId) {
    clearAllFields();
    loadOrderDetails(orderId);
  }
});

function loadOrderDetails(orderId) {
  let orders = getAllOrders();
  let order = orders.find(o => o.orderId === orderId);
  
  if (order) {
    $("#OrderManage .orderId").val(order.orderId);
    $("#OrderManage .orderDate").val(order.orderDate);
    $("#OrderManage .Total").text(order.total);
    $("#OrderManage .Discount").val(order.discount);
    $("#OrderManage .SubTotal").text(order.subTotal);
    $("#OrderManage .Cash").val(order.cash);
    $("#OrderManage .Balance").val(order.balance);
    
    let customer = getAllCustomers().find(c => c.custId === order.custId);
    if (customer) {
      $("#OrderManage .customers").val(customer.custId);
      $("#OrderManage .custId").val(customer.custId);
      $("#OrderManage .custName").val(customer.custName);
      $("#OrderManage .custAddress").val(customer.custAddress);
      $("#OrderManage .custSalary").val(customer.custSalary);
    }
    
    getItems = order.items || [];
    loadTable();
    $("#OrderManage .searchOrderId").val(order.orderId);
  } else {
    showAlert("Order not found!", "error");
  }
}

function generateId() {
  let orders = getAllOrders();

  if (orders.length === 0) {
    return "OID-001";
  } else {
    let lastOrder = orders[orders.length - 1];
    let orderId = lastOrder && lastOrder.orderId ? lastOrder.orderId : "OID-000";
    
    let number = extractNumber(orderId);
    number++;
    return "OID-" + padNumber(number, 3);
  }
}

function extractNumber(id) {
  var match = id.match(/OID-(\d+)/);
  if (match && match.length > 1) {
    return parseInt(match[1]);
  }
  return 0; 
}

function padNumber(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function loadCustomer() {
    let cmb = $("#OrderManage .customers");
    cmb.empty();
    let customers = getAllCustomers();

    cmb.append($("<option>").val("").text("Select Customer").attr("selected", true));

    $.each(customers, function (index, customer) {
        cmb.append($("<option>").val(customer.custId).text(customer.custId));
    });
}

function loadItems() {
    let cmb = $("#OrderManage .itemCmb");
    cmb.empty();
    let items = getAllItems();
    
    cmb.append($("<option>").val("").text("Select Item").attr("selected", true));
    
    $.each(items, function (index, item) {
      cmb.append($("<option>").val(item.itemId).text(item.itemId));
    });
}

$("#OrderManage .customers").change(function () {
  let customer = getAllCustomers().find((c) => c.custId === $(this).val());
  $("#OrderManage .custId").val(customer.custId);
  $("#OrderManage .custName").val(customer.custName);
  $("#OrderManage .custAddress").val(customer.custAddress);
  $("#OrderManage .custSalary").val(customer.custSalary);
});

$("#OrderManage .itemCmb").change(function () {
  let item = getAllItems().find((i) => i.itemId === $(this).val());
  itemId = item.itemId;
  itemQty = item.itemQty;
  $("#OrderManage .addBtn").text("Add");
  $("#OrderManage .itemCode").val(item.itemId);
  $("#OrderManage .itemName").val(item.itemName);
  $("#OrderManage .itemQty").val(item.itemQty);
  $("#OrderManage .itemPrice").val(item.itemPrice);
});

function clear(tableCount) {
  if (tableCount === 1) {
    $("#OrderManage .itemCode").val("");
    $("#OrderManage .itemName").val("");
    $("#OrderManage .itemPrice").val("");
    $("#OrderManage .itemQty").val("");
    $("#OrderManage .orderQty").val("");
    $("#OrderManage .SubTotal").text("");
    $("#OrderManage .Cash").val("");
    $("#OrderManage .Total").text("");
    $("#OrderManage .Discount").val("");
    $("#OrderManage .itemCmb").val("");
  } else {
    $("#OrderManage .custId").val("");
    $("#OrderManage .custName").val("");
    $("#OrderManage .custAddress").val("");
    $("#OrderManage .custSalary").val("");
    $("#OrderManage .itemCode").val("");
    $("#OrderManage .itemName").val("");
    $("#OrderManage .itemPrice").val("");
    $("#OrderManage .itemQty").val("");
    $("#OrderManage .orderQty").val("");
  }
}

$("#OrderManage .addBtn").click(function () {
    if ($("#OrderManage .addBtn").text() === "delete") {
      dropItem();
    } else {
      let getItem = {
        itemCode: $("#OrderManage .itemCode").val(),
        getItems: $("#OrderManage .itemName").val(),
        itemPrice: parseFloat($("#OrderManage .itemPrice").val()),
        itemQty: parseInt($("#OrderManage .orderQty").val(), 10),
        total:
          parseFloat($("#OrderManage .itemPrice").val()) *
          parseInt($("#OrderManage .orderQty").val(), 10),
      };
  
      let itemQty = parseInt($("#OrderManage .itemQty").val(), 10); 
      let orderQty = parseInt($("#OrderManage .orderQty").val(), 10); 
  
      let existingItem = getItems.find((I) => I.itemCode === getItem.itemCode);
      let totalRequestedQty = orderQty + (existingItem ? existingItem.itemQty : 0);
  
      if (itemQty >= totalRequestedQty) {
        if (
          $("#OrderManage .custId").val() !== "" &&
          $("#OrderManage .custName").val() !== null
        ) {
          if (orderQty > 0) {
            if (existingItem) {
              existingItem.itemQty += getItem.itemQty;
              existingItem.total = existingItem.itemPrice * existingItem.itemQty;
            } else {
              getItems.push(getItem);
            }
            loadTable();
            clear(1);
            setTotal();
            updateBalance();
          } else {
            showAlert("Invalid Quantity!", "error");
          }
        } else {
          showAlert("Invalid Customer!", "error");
        }
      } else {
        showAlert("Not Enough Quantity!", "error");
      }
    }
});

function dropItem() {
  let itemCode = $("#OrderManage .itemCode").val();
  let item = getItems.find((I) => I.itemCode === itemCode);
  let index = getItems.findIndex((I) => I.itemCode === itemCode);
  getItems.splice(index, 1);
  loadTable();
  clear(1);
  setTotal();
  updateBalance();
}

function loadTable() {
  $("#OrderManage .tableRows").empty();
  for (let i = 0; i < getItems.length; i++) {
    $("#OrderManage .tableRows").append(
      "<div> " +
        "<div>" +
        getItems[i].itemCode +
        "</div>" +
        "<div>" +
        getItems[i].getItems +
        "</div>" +
        "<div>" +
        getItems[i].itemPrice +
        "</div>" +
        "<div>" +
        getItems[i].itemQty +
        "</div>" +
        "<div>" +
        getItems[i].total +
        "</div>" +
        "</tr>"
    );
  }
}

function setTotal() {
  let total = 0;
  for (let i = 0; i < getItems.length; i++) {
    total += getItems[i].total;
  }
  $("#OrderManage .Total").text(total);
}

$("#OrderManage .Cash, #OrderManage .Discount").on("input", function() {
  updateBalance();
});

function updateBalance() {
  let cash = parseFloat($("#OrderManage .Cash").val()) || 0;
  let total = parseFloat($("#OrderManage .Total").text()) || 0;
  let discount = parseFloat($("#OrderManage .Discount").val()) || 0;
  
  if (total > 0) {
    let subTotal = total - (total * discount) / 100;
    $("#OrderManage .SubTotal").text(subTotal.toFixed(2));
    
    let balance = cash - subTotal;
    $("#OrderManage .Balance").val(balance.toFixed(2));
  }
}

$("#OrderManage .placeOrder").click(function () {
    let cash = parseFloat($("#OrderManage .Cash").val());
    let total = parseFloat($("#OrderManage .Total").text());
    let discount = parseFloat($("#OrderManage .Discount").val());
  
    if (cash >= total) {
      if (discount >= 0 && discount <= 100) {
        let subTotal = total - (total * discount) / 100;
        $("#OrderManage .SubTotal").text(subTotal.toFixed(2));
  
        let balance = cash - subTotal;
        $("#OrderManage .Balance").val(balance.toFixed(2));
  
        let Order = {
          orderId: $("#OrderManage .orderId").val(),
          orderDate: $("#OrderManage .orderDate").val(),
          custId: $("#OrderManage .custId").val(),
          items: getItems,
          total: total,
          discount: discount,
          subTotal: subTotal,
          cash: cash,
          balance: balance,
        };
  
        saveOrder(Order);
        updateItemData();
  
        clearAllFields();
        
        $("#OrderManage .orderId").val(generateId());
        refresh();

        showAlert("Place Order successfully!", "success");
      } else {
        showAlert("Invalid Discount!", "error");
      }
    } else {
      showAlert("Not Enough Cash!", "error");
    }
});
  
function clearAllFields() {
    let currentSearch = $("#OrderManage .searchOrderId").val();
    
    $("#OrderManage .orderDate").val("");
    $("#OrderManage .Total").text("0.00");
    $("#OrderManage .Discount").val("");
    $("#OrderManage .SubTotal").text("0.00");
    $("#OrderManage .Cash").val("");
    $("#OrderManage .Balance").val("");
    
    $("#OrderManage .customers").val("");
    $("#OrderManage .custId").val("");
    $("#OrderManage .custName").val("");
    $("#OrderManage .custAddress").val("");
    $("#OrderManage .custSalary").val("");
    
    $("#OrderManage .itemCmb").val("");
    $("#OrderManage .itemCode").val("");
    $("#OrderManage .itemName").val("");
    $("#OrderManage .itemPrice").val("");
    $("#OrderManage .itemQty").val("");
    $("#OrderManage .orderQty").val("");
    
    getItems = [];
    loadTable();
    
    $("#OrderManage .searchOrderId").val(currentSearch);
    
    if (!currentSearch) {
      $("#OrderManage .orderId").val(generateId());
    }
}
  
function updateItemData() {
  let items = getAllItems();
  for (let i = 0; i < getItems.length; i++) {
    let item = items.find((I) => I.itemId === getItems[i].itemCode);
    item.itemQty -= getItems[i].itemQty;
    let index = items.findIndex((I) => I.itemId === getItems[i].itemCode);
    updateItem(index, item);
  }
}

$(".mainTable .tableRows").on("click", "div", function () {
  let itemCode = $(this).children("div:eq(0)").text();
  let itemName = $(this).children("div:eq(1)").text();
  let price = $(this).children("div:eq(2)").text();
  let qty = $(this).children("div:eq(3)").text();

  $("#OrderManage .itemCode").val(itemCode);
  $("#OrderManage .itemName").val(itemName);
  $("#OrderManage .itemPrice").val(price);
  $("#OrderManage .orderQty").val(qty);

  $("#OrderManage .ItemSelect .addBtn").text("delete");
});

function showAlert(message, type) {
  const $alert = $(`
    <div class="custom-alert alert-${type}">
      ${message}
      <span class="close-alert">&times;</span>
    </div>
  `).appendTo("body");

  $alert.find(".close-alert").click(function() {
    $alert.remove();
  });

  setTimeout(() => $alert.fadeOut(500, () => $alert.remove()), 3000);
}