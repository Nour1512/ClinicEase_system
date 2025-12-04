$(function () {
  // Success sound (short "cha-ching" tone)
  const successSound = new Audio("audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/8AAEQgAeAC0BACIAAANIAQAACAADEAAAAAgACAAAEAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI");

  var cards = [
    { nome: "mastercard", colore: "#960d0dff", src: "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" },
    { nome: "visa", colore: "#eeff07ff", src: "https://upload.wikimedia.org/wikipedia/commons/3/32/National_Bank_of_Egypt.svg" },
    { nome: "QNB", colore: "#000000ff", src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Logo_Qatar_National_Bank.png" },
    { nome: "Telda", colore: "#c2007eff", src: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Telda_Logo.png" },
    { nome: "CIB", colore: "#0061A8", src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Cib_Logo.svg" },
    { nome: "Masr", colore: "#3b3e3fff", src: "https://upload.wikimedia.org/wikipedia/commons/4/49/Banque_Misr.svg" }

  ];

  var html = document.documentElement;
  var selected_card = -1;

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".ccv").length) {
      $(".card").css("transform", "rotateY(0deg)");
      $(".seccode").css("color", "var(--text-color)");
    }
    if (!$(e.target).closest(".expire").length) {
      $(".date_value").css("color", "var(--text-color)");
    }
    if (!$(e.target).closest(".number").length) {
      $(".card_number").css("color", "var(--text-color)");
    }
    if (!$(e.target).closest(".inputname").length) {
      $(".fullname").css("color", "var(--text-color)");
    }
  });

  // Card Number
  $(".number").on("input", function () {
    let val = $(this).val().replace(/\D/g, "").substring(0, 16);
    let formatted = val.replace(/(.{4})/g, "$1 ").trim();
    $(this).val(formatted);
    $(".card_number").text(formatted || "●●●● ●●●● ●●●● ●●●●");

    selected_card = -1;
    if (/^5[1-5]/.test(val)) selected_card = 0;
    else if (/^4/.test(val)) selected_card = 1;
    else if (/^(36|38|39)/.test(val)) selected_card = 2;
    else if (/^(34|37)/.test(val)) selected_card = 3;
    else if (/^65/.test(val)) selected_card = 4;
    else if (/^5019/.test(val)) selected_card = 5;

    if (selected_card !== -1) { // ✅ FIXED: was "- -1"
      html.style.setProperty("--card-color", cards[selected_card].colore);
      $(".bankid").attr("src", cards[selected_card].src).show();
    } else {
      html.style.setProperty("--card-color", "#cacaca");
      $(".bankid").hide().attr("src", "");
    }
  }).focus(function () {
    $(".card_number").css("color", "white");
  });

  // Cardholder Name
  $(".inputname").on("input", function () {
    $(".fullname").text($(this).val().trim() || "FULL NAME");
  }).focus(function () {
    $(".fullname").css("color", "white");
  });

  // Expiry Date
  $(".expire").on("input", function () {
    let v = $(this).val().replace(/\D/g, "");
    if (v.length >= 2) v = v.substring(0, 2) + " / " + v.substring(2, 6);
    $(this).val(v);
    $(".date_value").text(v || "MM / YYYY");
  }).focus(function () {
    $(".date_value").css("color", "white");
  });

  // CVV
  $(".ccv").on("input", function () {
    let code = $(this).val().replace(/\D/g, "").substring(0, 3);
    $(this).val(code);
    $(".seccode").text(code || "●●●");
  }).focus(function () {
    $(".card").css("transform", "rotateY(180deg)");
    $(".seccode").css("color", "white");
  }).blur(function () {
    $(".card").css("transform", "rotateY(0deg)");
    $(".seccode").css("color", "var(--text-color)");
  });

$(".buy").off("click").on("click", function (e) {
  e.preventDefault();
  
  var $container = $(".container");
  var $card = $(".card");
  var $btn = $(this);
  
  $container.removeClass("purchase-failed");
  $card.removeClass("card-orbit"); 
  var cardNum = $(".number").val().replace(/\s/g, "");
  var name = $(".inputname").val().trim();
  var expiry = $(".expire").val();
  var cvv = $(".ccv").val();

  var valid =
    cardNum.length >= 13 &&
    cardNum.length <= 19 &&
    name !== "" &&
    name !== "FULL NAME" &&
    /^\d{2} \/ \d{4}$/.test(expiry) &&
    /^\d{3}$/.test(cvv);

  if (valid) {
  successSound.play().catch(() => {});
  $card.addClass("card-orbit");
  $btn.text("Paid!");
  
  }else {
    $container.addClass("purchase-failed");
    $btn.text("Failed!");

  setTimeout(() => {
    $card.removeClass("card-orbit");
    $btn.text("Pay --.-- €");
  }, 1600); 
}

    setTimeout(() => {
      $btn.text("Pay --.-- €");
      $container.removeClass("purchase-failed");
    }, 1500);
  });
});