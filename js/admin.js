let adminProducts, productForm, cancelEdit, exportJSON, importJSON, importFile, storageConfigForm, clearStorageConfig;
let adminLogin, adminPrivate, loginForm, loginError, logoutButton, loginTitle, loginSubmit, confirmPasswordField;
let imageSource, urlField, uploadField, imageUrl, imageFile, imageHidden;

const ADMIN_CREDENTIALS_KEY = "ihsane_fragrance_admin_credentials";

// Debug flag - set to false in production
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

function debugError(...args) {
  if (DEBUG) console.error(...args);
}

function initAdminDOMElements() {
  adminProducts = document.querySelector("#adminProducts");
  productForm = document.querySelector("#productForm");
  cancelEdit = document.querySelector("#cancelEdit");
  exportJSON = document.querySelector("#exportJSON");
  importJSON = document.querySelector("#importJSON");
  importFile = document.querySelector("#importFile");
  storageConfigForm = document.querySelector("#storageConfigForm");
  clearStorageConfig = document.querySelector("#clearStorageConfig");
  adminLogin = document.querySelector("#adminLogin");
  adminPrivate = document.querySelector("#adminPrivate");
  loginForm = document.querySelector("#loginForm");
  loginError = document.querySelector("#loginError");
  logoutButton = document.querySelector(".admin-logout");
  loginTitle = document.querySelector("#loginTitle");
  loginSubmit = document.querySelector("#loginSubmit");
  confirmPasswordField = document.querySelector("#confirmPasswordField");
  imageSource = document.querySelector("#imageSource");
  urlField = document.querySelector("#urlField");
  uploadField = document.querySelector("#uploadField");
  imageUrl = document.querySelector("#imageUrl");
  imageFile = document.querySelector("#imageFile");
  imageHidden = document.querySelector("#imageHidden");
}

// ⚠️ SÉCURITÉ: Les identifiants sont stockés en clair pour simplifier le développement.
// En production, utilisez un backend sécurisé avec authentification serveur.
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

  return AUTHORIZED_ACCOUNTS.some(account =>
    account.email.toLowerCase() === normalizedEmail && account.password === password
  );
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

// Helper function to save products to external storage (JSONBin.io)
async function saveToExternalStorage(products) {
  const externalStorageUrl = localStorage.getItem('ihsane_storage_url');
  const externalStorageKey = localStorage.getItem('ihsane_storage_key');
  if (externalStorageUrl && externalStorageKey) {
    try {
      const response = await fetch(externalStorageUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': externalStorageKey,
        },
        body: JSON.stringify(products),
      });
      if (response.ok) {
        debugLog('Produits sauvegardés sur le stockage externe');
      } else {
        debugError('Erreur lors de la sauvegarde sur le stockage externe');
      }
    } catch (error) {
      debugError('Erreur lors de la sauvegarde sur le stockage externe:', error);
    }
  }
}

// Helper function to load products from localStorage
function loadProductsFromLocalStorage() {
  const stored = localStorage.getItem(PRODUCT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      debugError('Erreur lors de la lecture du localStorage:', e);
      return [];
    }
  }
  return [];
}

// Validation function for product data
function validateProductData(name, category, price, image) {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "Le nom du produit est requis" };
  }
  if (!category || category.trim().length === 0) {
    return { valid: false, message: "La catégorie est requise" };
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return { valid: false, message: "Le prix doit être un nombre positif" };
  }
  if (!image || image.trim().length === 0) {
    return { valid: false, message: "L'image est requise" };
  }
  return { valid: true };
}

async function renderAdminProducts() {
  // Admin utilise uniquement localStorage pour éviter les dépendances externes
  let products = loadProductsFromLocalStorage();

  // Si localStorage vide, charger depuis products.json
  if (!products || products.length === 0) {
    try {
      const response = await fetch('../js/products.json');
      if (response.ok) {
        products = await response.json();
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
      }
    } catch (error) {
      debugError('Erreur lors du chargement de products.json:', error);
    }
  }

  adminProducts.innerHTML = products.map((product) => `
    <article class="admin-product" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h3>${product.name}</h3>
        <p>${product.category} · ${formatPrice(Number(product.price))}</p>
      </div>
      <div class="admin-product-actions">
        <button type="button" data-edit-product="${product.id}" class="edit-btn">Modifier</button>
        <button type="button" data-delete-product="${product.id}" class="delete-btn">Supprimer</button>
      </div>
    </article>
  `).join("");
}

function initAdminEventListeners() {
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
      const category = data.get("category");
      const price = data.get("price");

      // Charger les produits depuis localStorage
      let products = loadProductsFromLocalStorage();

      const submitButton = productForm.querySelector('button[type="submit"]');
      const editingId = submitButton.dataset.editingId;

      let imageUrl = data.get("imageUrl")?.trim() || "";
      const imageSource = data.get("imageSource");
      const originalImage = data.get("image");

      if (imageSource === 'upload') {
        const file = data.get("imageFile");
        if (file && file.size > 0) {
          try {
            imageUrl = await fileToBase64(file);
          } catch (error) {
            debugError("Erreur lors de la conversion de l'image:", error);
            alert("Erreur lors du chargement de l'image. Veuillez réessayer.");
            return;
          }
        } else {
          // Conserver l'image originale si pas de nouveau fichier
          imageUrl = originalImage;
        }
      }

      // Valider les données du produit
      const validation = validateProductData(name, category, price, imageUrl);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      if (editingId) {
        // Mode édition : mettre à jour le produit existant
        const productIndex = products.findIndex((p) => p.id === editingId);
        if (productIndex !== -1) {
          products[productIndex] = {
            id: editingId,
            name,
            category,
            price: Number(price),
            badge: data.get("badge").trim(),
            image: imageUrl,
          };
        }
        // Réinitialiser le bouton
        submitButton.textContent = "Ajouter le produit";
        delete submitButton.dataset.editingId;
        if (cancelEdit) cancelEdit.hidden = true;
      } else {
        // Mode ajout : créer un nouveau produit
        const id = `${slugify(name)}-${Date.now()}`;
        products.unshift({
          id,
          name,
          category,
          price: Number(price),
          badge: data.get("badge").trim(),
          image: imageUrl,
        });
      }

      // Sauvegarder dans localStorage
      localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
      debugLog('Produits sauvegardés dans localStorage');

      // Sauvegarder sur le stockage externe si configuré
      await saveToExternalStorage(products);

      productForm.reset();
      handleImageSourceChange();
      await renderAdminProducts();
    });
  }

  if (adminProducts) {
    adminProducts.addEventListener("click", async (event) => {
      const deleteButton = event.target.closest("[data-delete-product]");
      const editButton = event.target.closest("[data-edit-product]");

      if (deleteButton) {
        // Charger les produits depuis localStorage
        let products = loadProductsFromLocalStorage();
        products = products.filter((product) => product.id !== deleteButton.dataset.deleteProduct);
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
        debugLog('Produit supprimé, sauvegardé dans localStorage');

        // Sauvegarder sur le stockage externe si configuré
        await saveToExternalStorage(products);

        await renderAdminProducts();
      }

      if (editButton) {
        const productId = editButton.dataset.editProduct;
        // Charger les produits depuis localStorage
        let products = loadProductsFromLocalStorage();
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        // Remplir le formulaire avec les données du produit
        if (productForm) {
          productForm.querySelector('[name="name"]').value = product.name;
          productForm.querySelector('[name="category"]').value = product.category;
          productForm.querySelector('[name="price"]').value = product.price;
          productForm.querySelector('[name="badge"]').value = product.badge || "";

          // Gérer l'image
          if (product.image.startsWith('data:')) {
            productForm.querySelector('[name="imageSource"]').value = 'upload';
            productForm.querySelector('#urlField').hidden = true;
            productForm.querySelector('#uploadField').hidden = false;
            productForm.querySelector('#imageUrl').required = false;
            productForm.querySelector('#imageFile').required = false;
          } else {
            productForm.querySelector('[name="imageSource"]').value = 'url';
            productForm.querySelector('[name="imageUrl"]').value = product.image;
            productForm.querySelector('#urlField').hidden = false;
            productForm.querySelector('#uploadField').hidden = true;
            productForm.querySelector('#imageUrl').required = true;
            productForm.querySelector('#imageFile').required = false;
          }

          // Changer le bouton submit pour "Mettre à jour"
          const submitButton = productForm.querySelector('button[type="submit"]');
          submitButton.textContent = "Mettre à jour le produit";
          submitButton.dataset.editingId = productId;

          // Afficher le bouton annuler
          if (cancelEdit) cancelEdit.hidden = false;

          // Stocker l'image originale
          productForm.querySelector('#imageHidden').value = product.image;
        }
      }
    });
  }

  if (cancelEdit) {
    cancelEdit.addEventListener("click", () => {
      productForm.reset();
      handleImageSourceChange();
      const submitButton = productForm.querySelector('button[type="submit"]');
      submitButton.textContent = "Ajouter le produit";
      delete submitButton.dataset.editingId;
      cancelEdit.hidden = true;
    });
  }

  // Export JSON
  if (exportJSON) {
    exportJSON.addEventListener("click", async () => {
      // Charger les produits depuis localStorage
      let products = loadProductsFromLocalStorage();
      const dataStr = JSON.stringify(products, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "products.json";
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  // Import JSON
  if (importJSON && importFile) {
    importJSON.addEventListener("click", () => {
      importFile.click();
    });

    importFile.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const products = JSON.parse(text);
        if (!Array.isArray(products)) throw new Error("Format invalide");

        // Sauvegarder dans localStorage
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
        debugLog('Produits importés, sauvegardés dans localStorage');

        // Sauvegarder sur le stockage externe si configuré
        await saveToExternalStorage(products);

        await renderAdminProducts();
        alert("Produits importés avec succès !");
      } catch (error) {
        alert("Erreur lors de l'import : " + error.message);
      }

      importFile.value = "";
    });
  }

  // Configuration du stockage externe
  if (storageConfigForm) {
    // Charger la configuration existante
    const existingUrl = localStorage.getItem('ihsane_storage_url');
    const existingKey = localStorage.getItem('ihsane_storage_key');
    if (existingUrl) storageConfigForm.querySelector('[name="storageUrl"]').value = existingUrl;
    if (existingKey) storageConfigForm.querySelector('[name="storageKey"]').value = existingKey;

    storageConfigForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(storageConfigForm);
      const url = data.get("storageUrl").trim();
      const key = data.get("storageKey").trim();

      localStorage.setItem('ihsane_storage_url', url);
      localStorage.setItem('ihsane_storage_key', key);

      alert("Configuration sauvegardée ! Rechargez la page pour appliquer les changements.");
    });
  }

  if (clearStorageConfig) {
    clearStorageConfig.addEventListener("click", () => {
      localStorage.removeItem('ihsane_storage_url');
      localStorage.removeItem('ihsane_storage_key');
      if (storageConfigForm) {
        storageConfigForm.querySelector('[name="storageUrl"]').value = '';
        storageConfigForm.querySelector('[name="storageKey"]').value = '';
      }
      alert("Configuration effacée ! Rechargez la page pour appliquer les changements.");
    });
  }

  if (imageSource) {
    imageSource.addEventListener("change", handleImageSourceChange);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    initAdminDOMElements();
    initAdminEventListeners();
    showAdmin(false);
    initLoginInterface();
    handleImageSourceChange();
  });
} else {
  initAdminDOMElements();
  initAdminEventListeners();
  showAdmin(false);
  initLoginInterface();
  handleImageSourceChange();
}

// Écouter les changements de localStorage pour synchroniser entre onglets
window.addEventListener('storage', (event) => {
  if (event.key === PRODUCT_KEY && event.newValue) {
    debugLog('Changement détecté dans localStorage depuis un autre onglet');
    renderAdminProducts();
  }
});

if (imageSource) {
  imageSource.addEventListener("change", handleImageSourceChange);
}
