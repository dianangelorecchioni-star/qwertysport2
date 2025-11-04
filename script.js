// Estado de la aplicación
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let currentCategory = 'todos';

// Productos de ejemplo (serán reemplazados por datos de la base de datos remota)
const exampleProducts = [
    {
        id: 1,
        name: 'Zapatillas Running Pro',
        category: 'calzado',
        price: 89.99,
        description: 'Zapatillas deportivas de alta calidad para running',
        image: '👟',
        specifications: {
            'Talla': '38-45',
            'Material': 'Malla transpirable',
            'Color': 'Azul/Negro',
            'Peso': '280g',
            'Tipo': 'Running'
        }
    },
    {
        id: 2,
        name: 'Camiseta Deportiva',
        category: 'ropa',
        price: 29.99,
        description: 'Camiseta transpirable y cómoda para entrenamientos',
        image: '👕',
        specifications: {
            'Talla': 'S, M, L, XL',
            'Material': 'Poliester',
            'Color': 'Negro',
            'Cuidado': 'Lavable en máquina'
        }
    },
    {
        id: 3,
        name: 'Pelota de Fútbol',
        category: 'equipamiento',
        price: 34.99,
        description: 'Pelota oficial de fútbol de cuero sintético',
        image: '⚽',
        specifications: {
            'Talla': '5 (Adulto)',
            'Material': 'Cuero sintético',
            'Peso': '410-450g',
            'Circunferencia': '68-70 cm'
        }
    },
    {
        id: 4,
        name: 'Mochila Deportiva',
        category: 'accesorios',
        price: 49.99,
        description: 'Mochila espaciosa con múltiples compartimentos',
        image: '🎒',
        specifications: {
            'Capacidad': '30L',
            'Material': 'Nylon resistente',
            'Compartimentos': '5',
            'Correas': 'Ajustables'
        }
    },
    {
        id: 5,
        name: 'Pantalón Deportivo',
        category: 'ropa',
        price: 39.99,
        description: 'Pantalón cómodo para entrenamientos y gimnasio',
        image: '👖',
        specifications: {
            'Talla': 'S, M, L, XL',
            'Material': 'Algodón/Elastano',
            'Color': 'Negro',
            'Ajuste': 'Ajustado'
        }
    },
    {
        id: 6,
        name: 'Raqueta de Tenis',
        category: 'equipamiento',
        price: 79.99,
        description: 'Raqueta profesional de tenis con buen equilibrio',
        image: '🎾',
        specifications: {
            'Peso': '280g',
            'Tamaño': '100 pulgadas²',
            'Balance': 'Equilibrado',
            'Cuerdas': 'Incluidas'
        }
    },
    {
        id: 7,
        name: 'Gorra Deportiva',
        category: 'accesorios',
        price: 19.99,
        description: 'Gorra ajustable con protección UV',
        image: '🧢',
        specifications: {
            'Talla': 'Única (Ajustable)',
            'Material': 'Poliester',
            'Color': 'Negro/Azul',
            'UV Protection': 'UPF 50+'
        }
    },
    {
        id: 8,
        name: 'Zapatillas Crossfit',
        category: 'calzado',
        price: 94.99,
        description: 'Zapatillas especializadas para crossfit y entrenamiento funcional',
        image: '👟',
        specifications: {
            'Talla': '38-45',
            'Material': 'Sintético',
            'Color': 'Negro',
            'Peso': '300g',
            'Tipo': 'Crossfit'
        }
    }
];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Cargar productos (por ahora desde ejemplo, luego desde base de datos remota)
    products = exampleProducts;
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar formularios
    setupForms();
    
    // Configurar filtros
    setupFilters();
    
    // Configurar modal
    setupModal();
    
    // Cargar carrito
    updateCartUI();
    
    // Verificar si hay usuario logueado
    checkAuth();
    
    // Mostrar página inicial
    showPage('home');
}

// Navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                showPage(page);
            }
            navMenu.classList.remove('active');
        });
    });
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function showPage(pageId) {
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar la página seleccionada
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Cargar contenido según la página
    if (pageId === 'tienda') {
        loadProducts();
    } else if (pageId === 'cart') {
        loadCart();
    }
}

// Productos
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Filtrar productos por categoría
    let filteredProducts = products;
    if (currentCategory !== 'todos') {
        filteredProducts = products.filter(p => p.category === currentCategory);
    }
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--light-gray);">No hay productos en esta categoría</p>';
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">Agregar al Carrito</button>
                    <button class="btn-view-details" onclick="showProductDetails(${product.id})">Ver Detalles</button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            loadProducts();
        });
    });
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const details = document.getElementById('product-details');
    
    const specsHTML = Object.entries(product.specifications || {}).map(([key, value]) => `
        <div class="spec-item">
            <span>${key}:</span>
            <span>${value}</span>
        </div>
    `).join('');
    
    details.innerHTML = `
        <div class="product-details-image">${product.image}</div>
        <div class="product-details-info">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <div class="price">$${product.price.toFixed(2)}</div>
            <button class="btn-primary" onclick="addToCart(${product.id}); closeModal();" style="width: 100%; margin-bottom: 2rem;">Agregar al Carrito</button>
            <div class="specifications">
                <h3>Especificaciones</h3>
                ${specsHTML}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function setupModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showMessage('Producto agregado al carrito', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    loadCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
        loadCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--light-gray); padding: 2rem;">Tu carrito está vacío</p>';
        if (cartSubtotal) cartSubtotal.textContent = '$0.00';
        if (cartTotal) cartTotal.textContent = '$5.00';
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Precio unitario: $${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) {
        showMessage('Tu carrito está vacío', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Por favor inicia sesión para continuar', 'error');
        showPage('login');
        return;
    }
    
    // Aquí se conectará con la base de datos remota para procesar la compra
    showMessage('Procesando pedido... (Conectar con base de datos remota)', 'success');
    // TODO: Implementar conexión con base de datos remota para guardar el pedido
}

// Autenticación
function setupForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Por ahora simulación, luego se conectará con base de datos remota
    try {
        // TODO: Reemplazar con llamada a API de base de datos remota
        // const response = await fetch('TU_API_URL/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password })
        // });
        // const user = await response.json();
        
        // Simulación temporal
        const user = {
            id: 1,
            name: 'Usuario Demo',
            email: email
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateAuthUI();
        showPage('home');
        showMessage('Bienvenido de nuevo!', 'success');
        e.target.reset();
    } catch (error) {
        showMessage('Error al iniciar sesión. Verifica tus credenciales.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        // TODO: Reemplazar con llamada a API de base de datos remota
        // const response = await fetch('TU_API_URL/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name, email, password })
        // });
        // const user = await response.json();
        
        // Simulación temporal
        const user = {
            id: Date.now(),
            name: name,
            email: email
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateAuthUI();
        showPage('home');
        showMessage('Cuenta creada exitosamente!', 'success');
        e.target.reset();
    } catch (error) {
        showMessage('Error al crear la cuenta. Intenta nuevamente.', 'error');
    }
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const profileLink = document.getElementById('profile-link');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (userName) userName.textContent = currentUser.name;
        if (userEmail) userEmail.textContent = currentUser.email;
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showPage('home');
    showMessage('Sesión cerrada', 'success');
}

// Utilidades
function showMessage(message, type = 'success') {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Insertar al inicio del body o del contenedor activo
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        activePage.insertBefore(messageEl, activePage.firstChild);
    } else {
        document.body.insertBefore(messageEl, document.body.firstChild);
    }
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Funciones globales para acceso desde HTML
window.showPage = showPage;
window.addToCart = addToCart;
window.showProductDetails = showProductDetails;
window.closeModal = closeModal;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.logout = logout;
