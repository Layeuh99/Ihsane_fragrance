const DEFAULT_PRODUCTS = [
  {
    id: "parfum-royal-oud",
    name: "Royal Oud",
    category: "Parfums",
    price: 18000,
    badge: "Best seller",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "huile-ambre-doux",
    name: "Ambre Doux",
    category: "Huiles parfumées",
    price: 7000,
    badge: "",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "extrait-musc-blanc",
    name: "Musc Blanc Intense",
    category: "Extraits",
    price: 12000,
    badge: "Nouveau",
    image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "brume-rose-velours",
    name: "Rose Velours",
    category: "Brumes",
    price: 8500,
    badge: "",
    image: "https://images.unsplash.com/photo-1595425964071-2c1ecb2c3b9d?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "musc-soie",
    name: "Musc de Soie",
    category: "Musc",
    price: 6500,
    badge: "Promo",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "parfum-nuit-doree",
    name: "Nuit Dorée",
    category: "Parfums",
    price: 22000,
    badge: "",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "huile-vanille-privee",
    name: "Vanille Privée",
    category: "Huiles parfumées",
    price: 7500,
    badge: "",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "brume-coton-musc",
    name: "Coton Musc",
    category: "Brumes",
    price: 8000,
    badge: "Doux",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=700&q=85",
  },
];

const PRODUCT_KEY = "ihsane_fragrance_products";
const CART_KEY = "ihsane_fragrance_cart";
const WHATSAPP_NUMBER = "221775714346";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

function getProducts() {
  const stored = localStorage.getItem(PRODUCT_KEY);
  if (!stored) return DEFAULT_PRODUCTS;

  try {
    const products = JSON.parse(stored);
    return Array.isArray(products) && products.length ? products : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `${money.format(value)} FCFA`;
}

const productGrid = document.querySelector("#productGrid");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutLink = document.querySelector(".checkout-whatsapp");
const googleMap = document.querySelector(".google-map");
const mapChoices = document.querySelectorAll(".map-choice");
const mapOpenLink = document.querySelector(".map-open-link");
const mapPins = document.querySelectorAll("[data-map-pin]");
let activeFilter = "Tous";

const MAPS = {
  fass: {
    title: "Carte Google Maps Fass Paillote",
    src: "https://maps.google.com/maps?q=14.692891,-17.454564&z=18&output=embed",
    href: "https://maps.app.goo.gl/9uBWEdzb5NmZ7shS6",
  },
  mbour: {
    title: "Carte Google Maps Mbour",
    src: "https://maps.google.com/maps?q=14.424409,-16.944840&z=18&output=embed",
    href: "https://maps.app.goo.gl/5qogU1r7cvU6SBYM6",
  },
};

function setMapLocation(mapKey) {
  if (!googleMap || !MAPS[mapKey]) return;

  const map = MAPS[mapKey];
  googleMap.src = map.src;
  googleMap.title = map.title;
  if (mapOpenLink) mapOpenLink.href = map.href;

  mapChoices.forEach((button) => {
    button.classList.toggle("active", button.dataset.map === mapKey);
  });
  mapPins.forEach((pin) => {
    pin.classList.toggle("active", pin.dataset.mapPin === mapKey);
  });
}

function renderProducts() {
  if (!productGrid) return;
  const products = getProducts();
  const visibleProducts = activeFilter === "Tous"
    ? products
    : products.filter((product) => product.category === activeFilter);

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
      <img src="${product.image}" alt="${product.name}">
      <div class="product-content">
        <p class="eyebrow">${product.category}</p>
        <h3>${product.name}</h3>
        <div class="product-meta">
          <span class="price">${formatPrice(Number(product.price))}</span>
        </div>
        <button class="add-to-cart" type="button" data-id="${product.id}">Ajouter au panier</button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  if (!cartItems) return;
  const cart = getCart();
  const products = getProducts();
  const detailedCart = cart
    .map((item) => ({ ...products.find((product) => product.id === item.id), qty: item.qty }))
    .filter((item) => item.id);

  const totalQty = detailedCart.reduce((sum, item) => sum + item.qty, 0);
  const total = detailedCart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  cartCount.textContent = totalQty;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.style.display = detailedCart.length ? "none" : "block";

  cartItems.innerHTML = detailedCart.map((item) => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <span>${formatPrice(Number(item.price))}</span>
      </div>
      <div class="qty-actions">
        <button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Retirer">-</button>
        <strong>${item.qty}</strong>
        <button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Ajouter">+</button>
      </div>
    </article>
  `).join("");

  const details = detailedCart.map((item) => `${item.qty} x ${item.name} (${formatPrice(Number(item.price))})`).join("%0A");
  const message = detailedCart.length
    ? `Bonjour Ihsane Fragrance, je souhaite commander:%0A${details}%0ATotal: ${formatPrice(total)}`
    : "Bonjour Ihsane Fragrance, je souhaite passer une commande.";
  checkoutLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  renderCart();
  openCart();
}

function updateCart(id, direction) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) return;

  item.qty += direction;
  const nextCart = cart.filter((cartItem) => cartItem.qty > 0);
  saveCart(nextCart);
  renderCart();
}

function openCart() {
  cartDrawer?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-to-cart");
  if (addButton) addToCart(addButton.dataset.id);

  const filter = event.target.closest("[data-filter]");
  if (filter && (filter.classList.contains("filter") || filter.classList.contains("category-card"))) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll(".filter").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === activeFilter);
    });
    renderProducts();
  }

  const cartAction = event.target.closest("[data-cart-action]");
  if (cartAction) updateCart(cartAction.dataset.id, cartAction.dataset.cartAction === "increase" ? 1 : -1);

  if (event.target.closest(".cart-button")) openCart();
  if (event.target.closest(".close-cart") || event.target.classList.contains("cart-backdrop")) closeCart();

  if (event.target.closest(".nav-toggle")) {
    const nav = document.querySelector(".main-nav");
    const toggle = document.querySelector(".nav-toggle");
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(nav.classList.contains("open")));
  }

  if (event.target.closest(".main-nav a")) {
    document.querySelector(".main-nav")?.classList.remove("open");
    document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
  }

  const mapChoice = event.target.closest(".map-choice");
  if (mapChoice) setMapLocation(mapChoice.dataset.map);
});

mapChoices.forEach((button) => {
  button.addEventListener("click", () => setMapLocation(button.dataset.map));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.14 });

document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

renderProducts();
renderCart();
