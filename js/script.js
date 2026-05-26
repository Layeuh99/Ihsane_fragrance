
const PRODUCT_KEY = "ihsane_fragrance_products";
const CART_KEY = "ihsane_fragrance_cart";
const WHATSAPP_NUMBER = "221775714346";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

// Configuration pour le stockage externe (JSONBin.io ou autre)
const EXTERNAL_STORAGE_URL = localStorage.getItem('ihsane_storage_url') || '';
const EXTERNAL_STORAGE_KEY = localStorage.getItem('ihsane_storage_key') || '';

async function loadProductsFromJSON() {
  // Essayer d'abord le stockage externe si configuré (JSONBin.io)
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
          console.log('Produits chargés depuis le stockage externe');
          return products;
        }
      }
    } catch (error) {
      console.log('Impossible de charger depuis le stockage externe');
    }
  }

  // Essayer de charger depuis le fichier products.json via PHP API
  try {
    const response = await fetch('../api/products.php');
    if (response.ok) {
      const products = await response.json();
      if (Array.isArray(products) && products.length) {
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
        console.log('Produits chargés depuis products.json via PHP API');
        return products;
      }
    }
  } catch (error) {
    console.log('Impossible de charger depuis products.json via PHP API');
  }

  // Fallback: charger directement le fichier products.json
  try {
    const response = await fetch('../js/products.json');
    if (response.ok) {
      const products = await response.json();
      if (Array.isArray(products) && products.length) {
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
        console.log('Produits chargés depuis products.json directement');
        return products;
      }
    }
  } catch (error) {
    console.log('Impossible de charger products.json directement');
  }

  // Fallback: utiliser le localStorage
  const stored = localStorage.getItem(PRODUCT_KEY);
  if (stored) {
    try {
      const products = JSON.parse(stored);
      if (Array.isArray(products) && products.length) {
        console.log('Utilisation des produits du localStorage');
        return products;
      }
    } catch (e) {
      console.error('Erreur lors de la lecture du localStorage:', e);
    }
  }

  // Si aucune source n'a de données, retourner un tableau vide
  console.log('Aucun produit trouvé, retour d\'un tableau vide');
  return [];
}

async function getProducts() {
  return await loadProductsFromJSON();
}

async function saveProducts(products) {
  // Sauvegarder dans le localStorage
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  console.log('Produits sauvegardés dans le localStorage');

  // Sauvegarder sur le stockage externe si configuré (JSONBin.io)
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

  // Sauvegarder dans le fichier products.json via PHP API
  try {
    const response = await fetch('../api/products.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(products),
    });
    if (response.ok) {
      console.log('Produits sauvegardés dans products.json');
    } else {
      console.error('Erreur lors de la sauvegarde dans products.json');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde via PHP API:', error);
  }
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
  console.log('Début du rendu des produits...');
  await renderProducts();
  console.log('Rendu des produits terminé');
  await renderCart();
})();
