const adminProducts = document.querySelector("#adminProducts");
const productForm = document.querySelector("#productForm");
const resetProducts = document.querySelector("#resetProducts");
const adminLogin = document.querySelector("#adminLogin");
const adminPrivate = document.querySelector("#adminPrivate");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const logoutButton = document.querySelector(".admin-logout");
const loginTitle = document.querySelector("#loginTitle");
const loginSubmit = document.querySelector("#loginSubmit");
const confirmPasswordField = document.querySelector("#confirmPasswordField");
const imageSource = document.querySelector("#imageSource");
const urlField = document.querySelector("#urlField");
const uploadField = document.querySelector("#uploadField");
const imageUrl = document.querySelector("#imageUrl");
const imageFile = document.querySelector("#imageFile");
const imageHidden = document.querySelector("#imageHidden");

const ADMIN_CREDENTIALS_KEY = "ihsane_fragrance_admin_credentials";

const AUTHORIZED_ACCOUNTS = [
  { email: "diawabdallah08@gmail.com", password: "LayeDiaw631" },
  { email: "antandiaye072917@gmail.com", password: "AntaNdiaye1712" }
];

function showAdmin(isConnected) {
  if (adminLogin) adminLogin.hidden = isConnected;
  if (adminPrivate) adminPrivate.hidden = !isConnected;
  if (logoutButton) logoutButton.hidden = !isConnected;
  if (isConnected) renderAdminProducts();
}

function getAdminCredentials() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_CREDENTIALS_KEY));
  } catch {
    return null;
  }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveAdminCredentials(email, password) {
  const credentials = {
    email: email.toLowerCase().trim(),
    password: await hashPassword(password)
  };
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
}

async function canLogin(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = await hashPassword(password);

  return AUTHORIZED_ACCOUNTS.some(account =>
    account.email.toLowerCase() === normalizedEmail && account.password === password
  );
}

function hasAdminCredentials() {
  return true;
}

function deleteAdminCredentials() {
  localStorage.removeItem(ADMIN_CREDENTIALS_KEY);
}

function initLoginInterface() {
  if (loginTitle) loginTitle.textContent = "Connexion admin";
  if (loginSubmit) loginSubmit.textContent = "Se connecter";
  if (confirmPasswordField) confirmPasswordField.hidden = true;
  if (loginError) loginError.textContent = "";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function handleImageSourceChange() {
  if (!imageSource) return;
  const source = imageSource.value;
  if (urlField) urlField.hidden = source !== 'url';
  if (uploadField) uploadField.hidden = source !== 'upload';
  if (imageUrl) imageUrl.required = source === 'url';
  if (imageFile) imageFile.required = source === 'upload';
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

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = data.get("email").trim();
    const password = data.get("password");

    if (!(await canLogin(email, password))) {
      if (loginError) loginError.textContent = "Email ou mot de passe incorrect.";
      return;
    }

    if (loginError) loginError.textContent = "";
    loginForm.reset();
    showAdmin(true);
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    showAdmin(false);
  });
}

if (productForm) {
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(productForm);
    const name = data.get("name").trim();
    const products = getProducts();
    const id = `${slugify(name)}-${Date.now()}`;

    let imageUrl = data.get("imageUrl")?.trim() || "";
    const imageSource = data.get("imageSource");

    if (imageSource === 'upload') {
      const file = data.get("imageFile");
      if (file && file.size > 0) {
        try {
          imageUrl = await fileToBase64(file);
        } catch (error) {
          console.error("Erreur lors de la conversion de l'image:", error);
          alert("Erreur lors du chargement de l'image. Veuillez réessayer.");
          return;
        }
      }
    }

    if (!imageUrl) {
      alert("Veuillez fournir une image (URL ou upload).");
      return;
    }

    products.unshift({
      id,
      name,
      category: data.get("category"),
      price: Number(data.get("price")),
      badge: data.get("badge").trim(),
      image: imageUrl,
    });

    saveProducts(products);
    productForm.reset();
    handleImageSourceChange();
    renderAdminProducts();
  });
}

if (adminProducts) {
  adminProducts.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-product]");
    if (!deleteButton) return;

    const products = getProducts().filter((product) => product.id !== deleteButton.dataset.deleteProduct);
    saveProducts(products);
    renderAdminProducts();
  });
}

if (resetProducts) {
  resetProducts.addEventListener("click", () => {
    saveProducts(DEFAULT_PRODUCTS);
    renderAdminProducts();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    showAdmin(false);
    initLoginInterface();
    handleImageSourceChange();
  });
} else {
  showAdmin(false);
  initLoginInterface();
  handleImageSourceChange();
}

if (imageSource) {
  imageSource.addEventListener("change", handleImageSourceChange);
}
