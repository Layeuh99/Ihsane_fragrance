const adminProducts = document.querySelector("#adminProducts");
const productForm = document.querySelector("#productForm");
const resetProducts = document.querySelector("#resetProducts");
const adminLogin = document.querySelector("#adminLogin");
const adminPrivate = document.querySelector("#adminPrivate");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const logoutButton = document.querySelector(".admin-logout");

const ADMIN_ACCOUNTS = [
  { email: "diawabdallah08@gmail.com", password: "LayeDiaw631" },
  { email: "antandiaye072917@gmail.com", password: "AntaNdiaye1712" },
  { email: "admin1@ihsane-fragrance.com", password: "ChangeMoi@2026" },
  { email: "admin2@ihsane-fragrance.com", password: "ChangeMoi@2026" },
  { email: "admin3@ihsane-fragrance.com", password: "ChangeMoi@2026" },
];

function showAdmin(isConnected) {
  adminLogin.hidden = isConnected;
  adminPrivate.hidden = !isConnected;
  logoutButton.hidden = !isConnected;
  if (isConnected) renderAdminProducts();
}

function canLogin(email, password) {
  return ADMIN_ACCOUNTS.some((account) => (
    account.email.toLowerCase() === email.toLowerCase() && account.password === password
  ));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderAdminProducts() {
  const products = getProducts();
  adminProducts.innerHTML = products.map((product) => `
    <article class="admin-product">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h3>${product.name}</h3>
        <p>${product.category} · ${formatPrice(Number(product.price))}</p>
      </div>
      <button type="button" data-delete-product="${product.id}">Supprimer</button>
    </article>
  `).join("");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim();
  const password = data.get("password");

  if (!canLogin(email, password)) {
    loginError.textContent = "Email ou mot de passe incorrect.";
    return;
  }

  loginError.textContent = "";
  loginForm.reset();
  showAdmin(true);
});

logoutButton.addEventListener("click", () => {
  showAdmin(false);
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(productForm);
  const name = data.get("name").trim();
  const products = getProducts();
  const id = `${slugify(name)}-${Date.now()}`;

  products.unshift({
    id,
    name,
    category: data.get("category"),
    price: Number(data.get("price")),
    badge: data.get("badge").trim(),
    image: data.get("image").trim(),
  });

  saveProducts(products);
  productForm.reset();
  renderAdminProducts();
});

adminProducts.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-product]");
  if (!deleteButton) return;

  const products = getProducts().filter((product) => product.id !== deleteButton.dataset.deleteProduct);
  saveProducts(products);
  renderAdminProducts();
});

resetProducts.addEventListener("click", () => {
  saveProducts(DEFAULT_PRODUCTS);
  renderAdminProducts();
});

showAdmin(false);
