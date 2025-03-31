$(document).ready(function () {
$("#homePage").show().css('display', 'flex');
$(".sectionName").text("POS System");
$("header").css("background-color", "#3498db");

$(".nav-link").click(function (event) {
    event.preventDefault();

    $("section").hide();

    var targetSection = $(this).attr("href");

    $(targetSection).show();
    switch (targetSection) {
        case "#CustomerManage":
            $(".sectionName").text("Customer Manage");
            break;
        case "#ItemManage":
            $(".sectionName").text("Item Manage");
            break;
        case "#OrderManage":
            $(".sectionName").text("Order Manage");
            break;
        default:
            $(".sectionName").text("POS System");
        }
    });
});