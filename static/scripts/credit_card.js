$(function () {
  // ----------------------------
  // SUCCESS SOUND
  // ----------------------------
  const successSound = new Audio(
    "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/8AAEQgAeAC0BACIAAANIAQAACAADEAAAAAgACAAAEAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI"
  );

  const cards = [
    { name: "mastercard", color: "#960d0dff", src: "/static/imgs/Mastercard-logo.png"},
    { name: "visa",        color: "#eeff07ff", src: "/static/imgs/visa.jpg"},
    { name: "QNB",         color: "#000000ff", src: "/static/imgs/Logo_Qatar_National_Bank.png"},
    { name: "Telda",       color: "#040404ff", src: "/static/imgs/Telda_Logo.png"},
    { name: "CIB",         color: "#0061A8",   src: "/static/imgs/Cib_Logo.svg"},
    { name: "Masr",        color: "#3b3e3fff", src: "/static/imgs/Banque_Misr.png"},
  ];

  let selected_card = -1;
  const html = document.documentElement;

  // ----------------------------
  // CLICK OUTSIDE RESET LOGIC
  // ----------------------------
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".ccv").length) {
      $(".card").css("transform", "rotateY(0deg)");
      $(".seccode").css("color", "var(--text-color)");
    }
    if (!$(e.target).closest(".expire").length) $(".date_value").css("color", "var(--text-color)");
    if (!$(e.target).closest(".number").length) $(".card_number").css("color", "var(--text-color)");
    if (!$(e.target).closest(".inputname").length) $(".fullname").css("color", "var(--text-color)");
  });

  // ----------------------------
  // CARD NUMBER
  // ----------------------------
  $(".number")
    .on("input", function () {
      const raw = $(this).val().replace(/\D/g, "").substring(0, 16);
      const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
      $(this).val(formatted);
      $(".card_number").text(formatted || "●●●● ●●●● ●●●● ●●●●");

      selected_card = -1;
      if (/^5[1-5]/.test(raw)) selected_card = 0;
      else if (/^4/.test(raw)) selected_card = 1;
      else if (/^(36|38|39)/.test(raw)) selected_card = 2;
      else if (/^(34|37)/.test(raw)) selected_card = 3;
      else if (/^65/.test(raw)) selected_card = 4;
      else if (/^5019/.test(raw)) selected_card = 5;

      if (selected_card !== -1) {
        html.style.setProperty("--card-color", cards[selected_card].color);
        $(".bankid").attr("src", cards[selected_card].src).show();
      } else {
        html.style.setProperty("--card-color", "#cacaca");
        $(".bankid").hide().attr("src", "");
      }
    })
    .focus(function () { $(".card_number").css("color", "white"); });

  $(".inputname")
    .on("input", function () { $(".fullname").text($(this).val().trim() || "FULL NAME"); })
    .focus(function () { $(".fullname").css("color", "white"); });

  $(".expire")
    .on("input", function () {
      let v = $(this).val().replace(/\D/g, "");
      let formatted = "";
      if (v.length >= 2) {
        formatted = v.substring(0, 2) + " / ";
        if (v.length > 2) formatted += v.substring(2, 6);
      } else formatted = v;
      $(this).val(formatted);
      $(".date_value").text(formatted || "MM / YYYY");
    })
    .focus(function () { $(".date_value").css("color", "white"); });

  $(".ccv")
    .on("input", function () {
      const code = $(this).val().replace(/\D/g, "").substring(0, 3);
      $(this).val(code);
      $(".seccode").text(code || "●●●");
    })
    .focus(function () {
      $(".card").css("transform", "rotateY(180deg)");
      $(".seccode").css("color", "white");
    })
    .blur(function () {
      $(".card").css("transform", "rotateY(0deg)");
      $(".seccode").css("color", "var(--text-color)");
    });

  // ----------------------------
  // PAY BUTTON & LOCALSTORAGE CART
  // ----------------------------
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  cart.forEach(item => total += item.price * item.Quantity);

  const payButton = $("#pay-button");
  const amountInput = $("#amount");
  payButton.html(`<i class="material-icons">lock</i> Pay ${total.toFixed(2)} EGP`);
  amountInput.val(total.toFixed(2));

  $(".buy").off("click").on("click", async function (e) {
    e.preventDefault();

    if (cart.length === 0) return alert("Cart is empty!");

    const cardNum = $(".number").val().replace(/\s/g, "");
    const name = $(".inputname").val().trim();
    const expiry = $(".expire").val();
    const cvv = $(".ccv").val();
    const purchaseId = $("#purchase_id").val();

    const valid =
      cardNum.length >= 13 && cardNum.length <= 19 &&
      name !== "" &&
      /^\d{2} \/ \d{4}$/.test(expiry) &&
      /^\d{3}$/.test(cvv) &&
      purchaseId;

    if (!valid) return alert("Please fill all fields correctly.");

    try {
      // Call the /buy API for each item
      for (const item of cart) {
        const res = await fetch(`/pharmacy/api/medicines/${item.Medicine_id}/buy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qty: item.Quantity })
        });
        const data = await res.json();
        if (!data.ok) {
          alert(`Failed to buy medicine ID ${item.Medicine_id}: ${data.error}`);
          return;
        }
      }

      // Now call your payments/create endpoint
      $.ajax({
        url: "/payments/create",
        method: "POST",
        data: {
          purchase_id: purchaseId,
          card_number: cardNum,
          cardholder_name: name,
          expiry_date: expiry,
          cvv: cvv,
          amount: total.toFixed(2)
        },
        success: function(res) {
          if (res.success) {
            successSound.play().catch(() => {});
            $(".card").addClass("card-orbit");
            payButton.text("Paid!");
            localStorage.removeItem("cart");

            setTimeout(() => {
              $(".card").removeClass("card-orbit").css("transform", "rotateY(0deg)");
            }, 1600);

            setTimeout(() => {
              window.location.href = res.redirect_url;
            }, 2200);
          } else {
            showError(res.message);
          }
        },
        error: function() { showError("Network error. Please try again."); }
      });

    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Please try again.");
    }

    function showError(msg) {
      $(".container").addClass("purchase-failed");
      payButton.text("Failed!");
      setTimeout(() => {
        $(".card").css("transform", "rotateY(0deg)");
        payButton.html(`<i class="material-icons">lock</i> Pay ${total.toFixed(2)} EGP`);
        $(".container").removeClass("purchase-failed");
      }, 1500);
      console.error(msg);
    }
  });
});
