const DEFAULT_PRODUCTS = [
  {
    id: "parfum-al-saraha-blend",
    name: "Al Saraha Blend",
    category: "Parfums",
    price: 18000,
    badge: "Best seller",
    image: "/Ihsane_fragrance/images/produits/Parfums/Al-saraha-blend.jpeg",
  },
  {
    id: "parfum-al-saraha-candys",
    name: "Al Saraha Candys",
    category: "Parfums",
    price: 18000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Parfums/Al-saraha-candys.jpeg",
  },
  {
    id: "parfum-al-saraha-pastiche",
    name: "Al Saraha Pastiche",
    category: "Parfums",
    price: 18000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Parfums/Al-saraha-pastiche.jpeg",
  },
  {
    id: "huile-ambroise-kim-k",
    name: "Ambroise Kim K",
    category: "Huiles parfumées",
    price: 7000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Huiles parfumées/Ambroise Kim K.jpeg",
  },
  {
    id: "huile-bianco-latte",
    name: "Bianco Latte Poussière d'Or Interdit Soft",
    category: "Huiles parfumées",
    price: 7500,
    badge: "Nouveau",
    image: "/Ihsane_fragrance/images/produits/Huiles parfumées/Bianco latte Poussière d'or interdit Soft,Kayali 81 Hypnotic Candy love.jpeg",
  },
  {
    id: "huile-interdit-hypnotic",
    name: "Interdit Hypnotic Poussière d'Or Scandale",
    category: "Huiles parfumées",
    price: 7500,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Huiles parfumées/Interdit Hypnotic Poussiere d'or scandale.jpeg",
  },
  {
    id: "huile-kayali-28",
    name: "Kayali 28 Bianco Latte Ambroisie Scandale",
    category: "Huiles parfumées",
    price: 8000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Huiles parfumées/Kayali 28 Bianco Latte Ambroisie Scandale.jpeg",
  },
  {
    id: "huile-ambroise",
    name: "Ambroise Huile Parfumée",
    category: "Huiles parfumées",
    price: 7000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Huiles parfumées/ambroise-huile-parfumee.jpeg",
  },
  {
    id: "extrait-collection-kayali",
    name: "Collection Kayali",
    category: "Extraits",
    price: 12000,
    badge: "Premium",
    image: "/Ihsane_fragrance/images/produits/Extraits/collection-kayali.jpeg",
  },
  {
    id: "extrait-femme-luxe",
    name: "Extraits Femme Luxe",
    category: "Extraits",
    price: 12000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Extraits/extraits-femme-luxe.jpeg",
  },
  {
    id: "extrait-kim-k-ambroise",
    name: "Kim K vs Ambroise",
    category: "Extraits",
    price: 12000,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Extraits/kim-k-vs-ambroise.jpeg",
  },
  {
    id: "brume-parfumees-color",
    name: "Brumes Parfumées Color",
    category: "Brumes",
    price: 8500,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Brumes/brumes-parfumees-color.jpeg",
  },
  {
    id: "musc-ambroisie",
    name: "Musc Ambroisie",
    category: "Musc",
    price: 6500,
    badge: "Doux",
    image: "/Ihsane_fragrance/images/produits/Musc/musc-ambroisie.jpeg",
  },
  {
    id: "musc-intime-premium",
    name: "Musc Intime Premium",
    category: "Musc",
    price: 6500,
    badge: "",
    image: "/Ihsane_fragrance/images/produits/Musc/musc-intime-premium.jpeg",
  },
];

const PRODUCT_KEY = "ihsane_fragrance_products";
const CART_KEY = "ihsane_fragrance_cart";
const WHATSAPP_NUMBER = "221775714346";
const PRODUCTS_VERSION = "v4_github_pages_paths";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

// Configuration pour le stockage externe (JSONBin.io ou autre)
const EXTERNAL_STORAGE_URL = localStorage.getItem('ihsane_storage_url') || '';
const EXTERNAL_STORAGE_KEY = localStorage.getItem('ihsane_storage_key') || '';

async function loadProductsFromJSON() {
  // Essayer d'abord le stockage externe si configuré
  if (EXTERNAL_STORAGE_URL && EXTERNAL_STORAGE_KEY) {
    try {
      const response = await fetch(EXTERNAL_STORAGE_URL, {
        headers: {
          'X-Master-Key': EXTERNAL_STORAGE_KEY,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const products = data.record || data;
        if (Array.isArray(products) && products.length) {
          localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
          localStorage.setItem(PRODUCT_KEY + "_version", PRODUCTS_VERSION);
          console.log('Produits chargés depuis le stockage externe');
          return products;
        }
      }
    } catch (error) {
      console.log('Impossible de charger depuis le stockage externe');
    }
  }

  // Ne pas écraser le localStorage - utiliser ce qui existe ou DEFAULT_PRODUCTS
  const stored = localStorage.getItem(PRODUCT_KEY);
  if (stored) {
    try {
      const products = JSON.parse(stored);
      if (Array.isArray(products) && products.length) {
        console.log('Utilisation des produits du localStorage');
        return products;
      }
    } catch (e) {
      // Si erreur, utiliser DEFAULT_PRODUCTS
    }
  }

  // Utiliser DEFAULT_PRODUCTS seulement si localStorage est vide
  console.log('Utilisation des produits par défaut avec vraies images');
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  localStorage.setItem(PRODUCT_KEY + "_version", PRODUCTS_VERSION);
  return DEFAULT_PRODUCTS;
}

async function getProducts() {
  return await loadProductsFromJSON();
}

async function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));

  // Sauvegarder sur le stockage externe si configuré
  if (EXTERNAL_STORAGE_URL && EXTERNAL_STORAGE_KEY) {
    try {
      const response = await fetch(EXTERNAL_STORAGE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': EXTERNAL_STORAGE_KEY,
        },
        body: JSON.stringify(products),
      });
      if (response.ok) {
        console.log('Produits sauvegardés sur le stockage externe');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde sur le stockage externe:', error);
    }
  }

  // Note: Pour le mode local sans stockage externe, utilisez Exporter JSON
  // et remplacez manuellement js/products.json sur le serveur
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

async function renderProducts() {
  if (!productGrid) {
    console.log('productGrid non trouvé');
    return;
  }
  const products = await getProducts();
  console.log('Produits chargés:', products.length);
  const visibleProducts = activeFilter === "Tous"
    ? products
    : products.filter((product) => product.category === activeFilter);

  console.log('Produits visibles:', visibleProducts.length);
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
  console.log('HTML généré, longueur:', productGrid.innerHTML.length);
}

async function renderCart() {
  if (!cartItems) return;
  const cart = getCart();
  const products = await getProducts();
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

async function addToCart(id) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  await renderCart();
  openCart();
}

async function updateCart(id, direction) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) return;

  item.qty += direction;
  const nextCart = cart.filter((cartItem) => cartItem.qty > 0);
  saveCart(nextCart);
  await renderCart();
}

function openCart() {
  cartDrawer?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", async (event) => {
  const addButton = event.target.closest(".add-to-cart");
  if (addButton) await addToCart(addButton.dataset.id);

  const filter = event.target.closest("[data-filter]");
  if (filter && (filter.classList.contains("filter") || filter.classList.contains("category-card"))) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll(".filter").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === activeFilter);
    });
    await renderProducts();
  }

  const cartAction = event.target.closest("[data-cart-action]");
  if (cartAction) await updateCart(cartAction.dataset.id, cartAction.dataset.cartAction === "increase" ? 1 : -1);

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

// Initialisation async
(async function init() {
  // Nettoyer le localStorage seulement si la version a changé
  const currentVersion = localStorage.getItem(PRODUCT_KEY + "_version");
  if (currentVersion !== PRODUCTS_VERSION) {
    console.log('Version changée, rechargement des produits...');
    localStorage.removeItem(PRODUCT_KEY);
    localStorage.removeItem(PRODUCT_KEY + "_version");
  }

  console.log('Début du rendu des produits...');
  await renderProducts();
  console.log('Rendu des produits terminé');
  await renderCart();
})();
