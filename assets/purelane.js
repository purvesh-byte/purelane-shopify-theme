(() => {
  "use strict";

  const cartAddUrl =
    (window.theme && window.theme.routes && window.theme.routes.cart_add_url) ||
    (window.routes && window.routes.cart_add_url) ||
    "/cart/add.js";

  const getButtonLabel = (button) =>
    button.querySelector("[data-cart-button-label]") || button;

  const setButtonState = (button, state, message) => {
    const label = getButtonLabel(button);

    if (state === "loading") {
      button.dataset.originalLabel = label.textContent.trim();
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      label.textContent = "Adding…";
      return;
    }

    button.disabled = false;
    button.removeAttribute("aria-busy");
    label.textContent =
      message || button.dataset.originalLabel || label.textContent.trim();
  };

  const getStatus = (button) => {
    const scope =
      button.closest("[data-cart-action-scope]") || button.parentElement;
    let status = scope && scope.querySelector("[data-cart-status]");

    if (!status && scope) {
      status = document.createElement("p");
      status.className = "pl-cart-status";
      status.setAttribute("data-cart-status", "");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      scope.appendChild(status);
    }

    return status;
  };

  const announce = (button, message, isError = false) => {
    const status = getStatus(button);
    if (!status) return;

    status.textContent = message;
    status.classList.toggle("is-error", isError);
    status.classList.toggle("is-success", !isError);
  };

  const addItems = async (items) => {
    const response = await fetch(cartAddUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ items }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      // A non-JSON response still produces a useful generic error below.
    }

    if (!response.ok) {
      throw new Error(
        (payload && (payload.description || payload.message)) ||
          "Unable to add this item to your cart. Please try again.",
      );
    }

    return payload;
  };

  const parseVariantIds = (button) =>
    (button.dataset.variantIds || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .map((id) => ({ id: Number(id), quantity: 1 }))
      .filter((item) => Number.isFinite(item.id) && item.id > 0);

  const handleCartButton = async (button) => {
    if (button.disabled) return;

    const items = button.dataset.variantId
      ? [{ id: Number(button.dataset.variantId), quantity: 1 }]
      : parseVariantIds(button);

    if (
      !items.length ||
      items.some((item) => !Number.isFinite(item.id) || item.id <= 0)
    ) {
      announce(button, "This product is currently unavailable.", true);
      return;
    }

    setButtonState(button, "loading");
    announce(button, "Adding to cart…");

    try {
      await addItems(items);
      const message =
        items.length > 1
          ? "Products added to your cart."
          : "Added to your cart.";
      setButtonState(button, "complete", "Added");
      announce(button, message);
      document.dispatchEvent(
        new CustomEvent("purelane:cart:updated", {
          detail: { itemCount: items.length },
        }),
      );
    } catch (error) {
      setButtonState(button, "error");
      announce(
        button,
        error && error.message
          ? error.message
          : "Unable to add to cart. Please try again.",
        true,
      );
    }
  };

  const initialiseReveals = () => {
    const items = document.querySelectorAll(
      ".pl-rv:not([data-pl-reveal-ready])",
    );
    if (!items.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((item) => {
        item.dataset.plRevealReady = "true";
        item.classList.add("in");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    items.forEach((item) => {
      item.dataset.plRevealReady = "true";
      observer.observe(item);
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest(
      "[data-add-to-cart], [data-add-products-to-cart]",
    );
    if (!button) return;

    event.preventDefault();
    handleCartButton(button);
  });

  document.addEventListener("DOMContentLoaded", initialiseReveals);
  document.addEventListener("shopify:section:load", initialiseReveals);
})();
