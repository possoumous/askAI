
let stripe = Stripe("pk_live_51NC7o1L3wnbtBH2ic3SyI2wP1vcBWnO1ZRiV8sjeCyFNcC9lEanp9TYBRcQoSZqAUJwQXijLQogKO6OrCau3F2FQ00uBc0yBO1")
let elements;
function resetUI() {
  document.getElementById("error-message").textContent = "";
  const submitBtn = document.getElementById("submit");
  submitBtn.disabled = false;
  submitBtn.textContent = "Pay";
  document.getElementById("payment-element").innerHTML = "";
}
async function initialize(courierPhone) {
  document.getElementById("initializedCourierPhone").innerHTML = courierPhone; 
  const res = await fetch("/create-payment-intent/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  courierPhone: courierPhone,
  userPhone: phone_number
})

	  
  });

  const { clientSecret } = await res.json();

  elements = stripe.elements({ clientSecret });

  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();

  if (!elements || !stripe) {
    showError("Payment system not ready.");
    return;
  }

  const submitBtn = document.getElementById("submit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.href,
    },
    redirect: "if_required"
  });

  if (error) {
    showError(error.message);
    resetButton();
    return;
  }

  switch (paymentIntent.status) {
    case "succeeded":
      showSuccess();
      break;
    case "processing":
      showError("Payment is still processing. Please wait.");
      resetButton();
      break;
    case "requires_payment_method":
      showError("Payment failed. Please try another method.");
      resetButton();
      break;
    default:
      showError("Unexpected status: " + paymentIntent.status);
      resetButton();
  }
}

function showError(msg) {
  document.getElementById("error-message").textContent = msg;
}

function resetButton() {
  const submitBtn = document.getElementById("submit");
  submitBtn.disabled = false;
  submitBtn.textContent = "Pay $50";
}

function showSuccess() {
  document.getElementById("payment-form").innerHTML = `
    <div class="text-center space-y-4">
      <h2 class="text-xl font-semibold text-green-700">✅ Payment Successful</h2>
      <p class="text-gray-600">Thanks for paying your courier. You're all set!</p>
    </div>
  `;
}

document.getElementById("stripe-payment-form").addEventListener("submit", handleSubmit);
initialize();


