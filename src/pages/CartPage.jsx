import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const checkoutCopies = {
  en: {
    steps: ["Cart", "Delivery", "Payment", "Review"],
    deliveryTitle: "Delivery Information",
    deliveryText: "Add your details so we can prepare your antique order safely.",
    fullName: "Full Name",
    phone: "Phone Number",
    city: "City",
    address: "Full Address",
    notes: "Delivery Notes",
    continuePayment: "Continue to Payment",
    paymentTitle: "Payment Method",
    paymentText: "Choose how you want to pay for your order.",
    cash: "Cash on Delivery",
    cashText: "Pay when your order arrives.",
    card: "Card Payment",
    cardText: "Card payment UI only. No real payment gateway is connected yet.",
    continueReview: "Review Order",
    reviewTitle: "Review Your Order",
    reviewText: "Check your items, delivery details, and payment method.",
    customer: "Customer",
    phoneLabel: "Phone",
    addressLabel: "Address",
    paymentLabel: "Payment",
    placeOrder: "Place Order",
    back: "Back",
    checkoutNow: "Checkout Now",
    subtotal: "Items subtotal",
    services: "Packaging & insurance",
    fragilePackaging: "Fragile packaging",
    luxuryInsurance: "Luxury insurance",
  },

  ar: {
    steps: ["السلة", "التوصيل", "الدفع", "المراجعة"],
    deliveryTitle: "بيانات التوصيل",
    deliveryText: "اكتب بياناتك عشان نجهز طلب الأنتيك بعناية.",
    fullName: "الاسم بالكامل",
    phone: "رقم الهاتف",
    city: "المدينة",
    address: "العنوان بالكامل",
    notes: "ملاحظات التوصيل",
    continuePayment: "الانتقال للدفع",
    paymentTitle: "طريقة الدفع",
    paymentText: "اختر الطريقة المناسبة لدفع الطلب.",
    cash: "الدفع عند الاستلام",
    cashText: "ادفع عند وصول الطلب.",
    card: "الدفع بالكارت",
    cardText: "واجهة دفع فقط. لا يوجد بوابة دفع حقيقية متصلة حاليًا.",
    continueReview: "مراجعة الطلب",
    reviewTitle: "مراجعة الطلب",
    reviewText: "راجع المنتجات وبيانات التوصيل وطريقة الدفع.",
    customer: "العميل",
    phoneLabel: "الهاتف",
    addressLabel: "العنوان",
    paymentLabel: "الدفع",
    placeOrder: "تأكيد الطلب",
    back: "رجوع",
    checkoutNow: "إتمام الطلب",
    subtotal: "إجمالي المنتجات",
    services: "التغليف والتأمين",
    fragilePackaging: "تغليف القطع القابلة للكسر",
    luxuryInsurance: "تأمين القطع الفاخرة",
  },
};

function CartPage({
  cartItems,
  cartSummary,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  clearCart,
  handleCheckout,
}) {
  const { t, language, productName } = useLanguage();
  const copy = checkoutCopies[language];

  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryData, setDeliveryData] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const steps = ["cart", "delivery", "payment", "review"];
  const currentStepIndex = steps.indexOf(checkoutStep);

  function updateDeliveryData(event) {
    const { name, value } = event.target;

    setDeliveryData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function startCheckout() {
    if (cartItems.length === 0) {
      handleCheckout();
      return;
    }

    setCheckoutStep("delivery");
  }

  function submitDelivery(event) {
    event.preventDefault();
    setCheckoutStep("payment");
  }

  function submitPayment(event) {
    event.preventDefault();
    setCheckoutStep("review");
  }

  function placeOrder() {
    handleCheckout({
      items: cartItems,
      total: cartSummary.total,
      delivery: deliveryData,
      paymentMethod,
    });

    setCheckoutStep("cart");
    setPaymentMethod("cash");
    setDeliveryData({
      fullName: "",
      phone: "",
      city: "",
      address: "",
      notes: "",
    });
  }

  function goBack() {
    if (checkoutStep === "delivery") {
      setCheckoutStep("cart");
    }

    if (checkoutStep === "payment") {
      setCheckoutStep("delivery");
    }

    if (checkoutStep === "review") {
      setCheckoutStep("payment");
    }
  }

  return (
    <section className="section-block products-section">
      <div className="container">
        <div className="section-heading">
          <span>{t.cart.label}</span>
          <h2>{t.cart.title}</h2>
          <p>{t.cart.description}</p>
        </div>

        {cartItems.length > 0 && (
          <div className="checkout-steps">
            {copy.steps.map((step, index) => (
              <div
                className={`checkout-step ${
                  index === currentStepIndex ? "active" : ""
                } ${index < currentStepIndex ? "done" : ""}`}
                key={step}
              >
                <strong>{index + 1}</strong>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-state">
            {t.cart.empty}
            <br />
            <br />
            <Link to="/products">{t.cart.goProducts}</Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8 mb-4">
              {checkoutStep === "cart" && (
                <>
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="row align-items-center">
                        <div className="col-md-3 mb-3">
                          <div className="product-image-box">
                            <img src={item.image} alt={productName(item.name)} />
                          </div>
                        </div>

                        <div className="col-md-5 mb-3">
                          <strong>{productName(item.name)}</strong>
                          <span>{item.price} EGP</span>
                        </div>

                        <div className="col-md-2 mb-3">
                          <div className="quantity-actions">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="col-md-2 mb-3">
                          <button
                            type="button"
                            className="remove-button"
                            onClick={() => removeFromCart(item.id)}
                          >
                            {t.cart.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {checkoutStep === "delivery" && (
                <form className="checkout-form" onSubmit={submitDelivery}>
                  <h3>{copy.deliveryTitle}</h3>
                  <p>{copy.deliveryText}</p>

                  <div className="checkout-form-grid">
                    <input
                      type="text"
                      name="fullName"
                      placeholder={copy.fullName}
                      value={deliveryData.fullName}
                      onChange={updateDeliveryData}
                      required
                    />

                    <input
                      type="tel"
                      name="phone"
                      placeholder={copy.phone}
                      value={deliveryData.phone}
                      onChange={updateDeliveryData}
                      required
                    />

                    <input
                      type="text"
                      name="city"
                      placeholder={copy.city}
                      value={deliveryData.city}
                      onChange={updateDeliveryData}
                      required
                    />

                    <input
                      type="text"
                      name="address"
                      placeholder={copy.address}
                      value={deliveryData.address}
                      onChange={updateDeliveryData}
                      required
                    />
                  </div>

                  <textarea
                    name="notes"
                    placeholder={copy.notes}
                    rows="4"
                    value={deliveryData.notes}
                    onChange={updateDeliveryData}
                  ></textarea>

                  <div className="checkout-buttons">
                    <button type="button" onClick={goBack}>
                      {copy.back}
                    </button>

                    <button type="submit">{copy.continuePayment}</button>
                  </div>
                </form>
              )}

              {checkoutStep === "payment" && (
                <form className="checkout-form" onSubmit={submitPayment}>
                  <h3>{copy.paymentTitle}</h3>
                  <p>{copy.paymentText}</p>

                  <div className="payment-methods">
                    <label
                      className={`payment-card ${
                        paymentMethod === "cash" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      />

                      <strong>{copy.cash}</strong>
                      <span>{copy.cashText}</span>
                    </label>

                    <label
                      className={`payment-card ${
                        paymentMethod === "card" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      />

                      <strong>{copy.card}</strong>
                      <span>{copy.cardText}</span>
                    </label>
                  </div>

                  <div className="checkout-buttons">
                    <button type="button" onClick={goBack}>
                      {copy.back}
                    </button>

                    <button type="submit">{copy.continueReview}</button>
                  </div>
                </form>
              )}

              {checkoutStep === "review" && (
                <div className="checkout-form">
                  <h3>{copy.reviewTitle}</h3>
                  <p>{copy.reviewText}</p>

                  <div className="review-box">
                    <div>
                      <span>{copy.customer}</span>
                      <strong>{deliveryData.fullName}</strong>
                    </div>

                    <div>
                      <span>{copy.phoneLabel}</span>
                      <strong>{deliveryData.phone}</strong>
                    </div>

                    <div>
                      <span>{copy.addressLabel}</span>
                      <strong>
                        {deliveryData.city} - {deliveryData.address}
                      </strong>
                    </div>

                    <div>
                      <span>{copy.paymentLabel}</span>
                      <strong>
                        {paymentMethod === "cash" ? copy.cash : copy.card}
                      </strong>
                    </div>
                  </div>

                  <div className="checkout-buttons">
                    <button type="button" onClick={goBack}>
                      {copy.back}
                    </button>

                    <button type="button" onClick={placeOrder}>
                      {copy.placeOrder}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4 mb-4">
              <div className="story-panel">
                <span>{t.cart.orderSummary}</span>
                <h2>{t.cart.total}</h2>
                <h3>{cartSummary.total} EGP</h3>

                <div className="checkout-summary-list">
                  {cartSummary.items.map((item) => (
                    <div key={item.id}>
                      <span>
                        {productName(item.name)} × {item.quantity}
                      </span>
                      <strong>{item.price * item.quantity} EGP</strong>
                      {item.addOns.map((addOn) => (
                        <small key={addOn.name}>
                          {addOn.name === "Fragile Packaging" ? copy.fragilePackaging : copy.luxuryInsurance}
                          {" × "}{item.quantity}: {addOn.price * item.quantity} EGP
                        </small>
                      ))}
                    </div>
                  ))}
                  <div><span>{copy.subtotal}</span><strong>{cartSummary.subtotal} EGP</strong></div>
                  <div><span>{copy.services}</span><strong>{cartSummary.servicesTotal} EGP</strong></div>
                </div>

                {checkoutStep === "cart" && (
                  <div className="cart-footer">
                    <button type="button" onClick={clearCart}>
                      {t.cart.clear}
                    </button>

                    <button type="button" onClick={startCheckout}>
                      {copy.checkoutNow}
                    </button>
                  </div>
                )}

                <br />

                <Link to="/products" style={{ color: "#f5e6c8" }}>
                  {t.cart.continueShopping}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CartPage;
