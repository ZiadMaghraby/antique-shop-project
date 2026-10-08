import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Navbar from "../components/Navbar";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import HomePage from "./HomePage";
import CollectionsPage from "./CollectionsPage";
import ProductsPage from "./ProductsPage";
import ProductDetailsPage from "./ProductDetailsPage";
import StoryPage from "./StoryPage";
import ContactPage from "./ContactPage";
import CartPage from "./CartPage";

import { useLanguage } from "../context/LanguageContext";

import chairImg from "../assets/products/chair.png";
import vaseImg from "../assets/products/vase.png";
import clockImg from "../assets/products/clock.png";
import teaSetImg from "../assets/products/tea-set.png";
import tableImg from "../assets/products/table.png";

import { createProduct } from "../patterns/factory/ProductFactory";
import CartObserver from "../patterns/observer/CartObserver";
import { validateCheckout } from "../patterns/chain/CheckoutValidationChain";
import { calculateCartTotals } from "../patterns/decorator/ProductDecorators";
import {
  AddToCartCommand,
  ClearCartCommand,
  DecreaseQuantityCommand,
  IncreaseQuantityCommand,
  RemoveFromCartCommand,
} from "../patterns/command/CartCommand";
import { createCheckoutState } from "../patterns/state/CheckoutState";

const productImages = {
  chair: chairImg,
  vase: vaseImg,
  clock: clockImg,
  teaSet: teaSetImg,
  table: tableImg,
};

const cartObserver = new CartObserver();

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PageFrame({
  isLoggedIn,
  userName,
  cartCount,
  onLogout,
  footerText,
  children,
}) {
  return (
    <ProtectedRoute isLoggedIn={isLoggedIn}>
      <div className="site-page">
        <Navbar userName={userName} cartCount={cartCount} onLogout={onLogout} />

        {children}

        <footer className="footer">
          <p>{footerText}</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  const { t } = useLanguage();

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("antiqueUser")),
  );

  const [userName, setUserName] = useState(
    () => localStorage.getItem("antiqueUser") || "Guest",
  );

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  /*
    [PATTERN: STATE]
    We keep the checkout flow in a clear state:
    idle -> validating -> success / failed.
    This avoids using random booleans like isLoading, isSuccess, isFailed.
  */
  const [checkoutStateName, setCheckoutStateName] = useState("idle");

  const toastTimer = useRef(null);

  const checkoutState = useMemo(
    () => createCheckoutState(checkoutStateName),
    [checkoutStateName],
  );

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        const productsWithImages = data.map((product) =>
          createProduct(product.category.toLowerCase(), {
            ...product,
            image: productImages[product.imageKey],
          }),
        );

        setProducts(productsWithImages);
      })
      .catch((error) => console.error("Error loading products:", error));
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  function showToast(message) {
    const toastTop = window.scrollY + window.innerHeight / 2;

    setToast({
      message,
      top: toastTop,
    });

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  }

  function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (!matchedUser) {
      showToast("Invalid email or password");
      return;
    }

    localStorage.setItem("antiqueUser", matchedUser.name);

    setUserName(matchedUser.name);
    setIsLoggedIn(true);

    showToast(t.messages.welcomeBack);
  }

  function handleSignUp(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (password.length < 6) {
      showToast("Password must be at least 6 characters");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      showToast("This email already exists");
      return;
    }

    const newUser = {
      name,
      email,
      password,
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("antiqueUser", name);

    setUserName(name);
    setIsLoggedIn(true);

    showToast(t.messages.accountCreated);
  }

  function continueAsGuest() {
    localStorage.setItem("antiqueUser", "Guest");
    setUserName("Guest");
    setIsLoggedIn(true);
    showToast(t.messages.guestMode);
  }

  function handleLogout() {
    localStorage.removeItem("antiqueUser");
    setIsLoggedIn(false);
    setUserName("Guest");
    setCartItems([]);
    setLastOrder(null);
    setCheckoutStateName("idle");
    showToast(t.messages.loggedOut);
  }

  /*
    [PATTERN: COMMAND]
    Every cart action is wrapped inside a command object.
    App.jsx only runs the command, and the command knows how to change cartItems.
    This keeps add/remove/increase/decrease logic organized and reusable.
  */
  function runCartCommand(command) {
    setCartItems((currentItems) => command.execute(currentItems));
  }

  function addToCart(product) {
    const currentQuantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;
    if (!Number.isInteger(product.stock) || currentQuantity >= product.stock) {
      showToast("No more stock available for this product");
      return;
    }
    const command = new AddToCartCommand(product);

    runCartCommand(command);

    cartObserver.notifyProductAdded(product, 1);
    showToast("Added to cart successfully");
  }

  function decreaseQuantity(productId) {
    const command = new DecreaseQuantityCommand(productId);

    runCartCommand(command);
  }

  function increaseQuantity(productId) {
    const product = cartItems.find((item) => item.id === productId);
    if (!product || !Number.isInteger(product.stock) || product.quantity >= product.stock) {
      showToast("No more stock available for this product");
      return;
    }
    const command = new IncreaseQuantityCommand(productId);

    runCartCommand(command);

    if (product) {
      cartObserver.notifyProductAdded(product, 1);
    }
  }

  function removeFromCart(productId) {
    const product = cartItems.find((item) => item.id === productId);
    const command = new RemoveFromCartCommand(productId);

    runCartCommand(command);

    if (product) {
      cartObserver.notifyProductRemoved(product.name);
    }

    showToast(t.messages.removedFromCart);
  }

  function clearCart() {
    const command = new ClearCartCommand();

    runCartCommand(command);
    showToast(t.messages.cartCleared);
  }

  function handleCheckout(orderDetails = {}) {
    if (!checkoutState.canCheckout()) {
      showToast(checkoutState.getMessage());
      return;
    }

    setCheckoutStateName("validating");

    const orderData = {
      cartItems,
      delivery: orderDetails.delivery || null,
      paymentMethod: orderDetails.paymentMethod || "cash",
    };

    /*
      [PATTERN: CHAIN OF RESPONSIBILITY]
      Checkout validation is split into multiple validation steps.
      Each step checks one responsibility, like cart, stock, payment, and delivery.
    */
    const validation = validateCheckout(orderData);

    if (!validation.isValid) {
      setCheckoutStateName("failed");
      showToast(validation.message);
      return;
    }

    /*
      [PATTERN: DECORATOR]
      We decorate cart items at checkout time with extra services.
      Example: fragile packaging or luxury insurance.
      The original cart item stays clean, and the decorated item has final price.
    */
    const { items: decoratedItems, subtotal, total, servicesTotal } = calculateCartTotals(cartItems);
    const orderNumber = `AS-${Date.now().toString().slice(-6)}`;

    const order = {
      orderNumber,
      items: decoratedItems,
      subtotal,
      servicesTotal,
      total,
      delivery: orderData.delivery,
      paymentMethod: orderData.paymentMethod,
      state: "success",
      createdAt: new Date().toLocaleString(),
    };

    setCheckoutStateName("success");
    setLastOrder(order);
    setOrderMessage(
      `Your order has been placed successfully. Order number: ${orderNumber}`,
    );

    setCartItems([]);
    showToast(t.messages.checkoutDone);
  }

  function closeOrderMessage() {
    setOrderMessage("");
    setCheckoutStateName("idle");
  }

  const categories = useMemo(() => {
    const uniqueCategories = products.map((product) => product.category);

    return ["All", ...new Set(uniqueCategories)];
  }, [products]);

  const cartSummary = calculateCartTotals(cartItems);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const pageFrameProps = {
    isLoggedIn,
    userName,
    cartCount,
    onLogout: handleLogout,
    footerText: t.footer,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginPage
                onLogin={handleLogin}
                onGuest={continueAsGuest}
                showToast={showToast}
              />
            )
          }
        />

        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <SignupPage onSignUp={handleSignUp} onGuest={continueAsGuest} />
            )
          }
        />

        <Route
          path="/home"
          element={
            <PageFrame {...pageFrameProps}>
              <HomePage />
            </PageFrame>
          }
        />

        <Route
          path="/collections"
          element={
            <PageFrame {...pageFrameProps}>
              <CollectionsPage categories={categories} />
            </PageFrame>
          }
        />

        <Route
          path="/products"
          element={
            <PageFrame {...pageFrameProps}>
              <ProductsPage
                products={products}
                categories={categories}
                addToCart={addToCart}
              />
            </PageFrame>
          }
        />

        <Route
          path="/product/:productId"
          element={
            <PageFrame {...pageFrameProps}>
              <ProductDetailsPage products={products} addToCart={addToCart} />
            </PageFrame>
          }
        />

        <Route
          path="/story"
          element={
            <PageFrame {...pageFrameProps}>
              <StoryPage />
            </PageFrame>
          }
        />

        <Route
          path="/contact"
          element={
            <PageFrame {...pageFrameProps}>
              <ContactPage showToast={showToast} />
            </PageFrame>
          }
        />

        <Route
          path="/cart"
          element={
            <PageFrame {...pageFrameProps}>
              <CartPage
                cartItems={cartItems}
                cartSummary={cartSummary}
                decreaseQuantity={decreaseQuantity}
                increaseQuantity={increaseQuantity}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                handleCheckout={handleCheckout}
              />
            </PageFrame>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {orderMessage && (
        <div className="modal-backdrop-custom">
          <div className="success-modal">
            <button
              type="button"
              className="modal-close"
              onClick={closeOrderMessage}
            >
              ×
            </button>

            <div className="success-icon">✓</div>

            <h2>{t.cart.checkout}</h2>

            <p>{orderMessage}</p>

            {lastOrder && (
              <div className="review-box">
                <div>
                  <span>Order Number</span>
                  <strong>{lastOrder.orderNumber}</strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>{lastOrder.subtotal} EGP</strong>
                </div>

                <div>
                  <span>Extra Services</span>
                  <strong>{lastOrder.servicesTotal} EGP</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{lastOrder.total} EGP</strong>
                </div>
              </div>
            )}

            <button type="button" onClick={closeOrderMessage}>
              {t.cart.continueShopping}
            </button>
          </div>
        </div>
      )}

      {toast &&
        createPortal(
          <div
            className="toast-message"
            style={{ "--toast-top": `${toast.top}px` }}
          >
            {toast.message}
          </div>,
          document.body,
        )}
    </BrowserRouter>
  );
}

export default App;
