// ==================== CONFIGURACIÓN DE FIREBASE ====================
// Configuración de Firebase para qwertysport2-81de0
const firebaseConfig = {
    apiKey: "AIzaSyCpmnN8LavF9xmxaWAcJcUNIidaK0f0zRo",
    authDomain: "qwertysport2-81de0.firebaseapp.com",
    databaseURL: "https://qwertysport2-81de0-default-rtdb.firebaseio.com",
    projectId: "qwertysport2-81de0",
    storageBucket: "qwertysport2-81de0.firebasestorage.app",
    messagingSenderId: "756745511045",
    appId: "1:756745511045:web:1113d462b6a4a691ed89ec"
};

// Inicializar Firebase
// Nota: Los scripts de Firebase deben estar cargados antes de este script
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==================== ESTADO DE LA APLICACIÓN ====================
let currentUser = null;
let cart = [];
let products = [];
let currentCategory = 'todos';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Configurar navegación
    setupNavigation();
    
    // Configurar formularios
    setupForms();
    
    // Configurar filtros
    setupFilters();
    
    // Configurar modal
    setupModal();
    
    // Cargar productos desde Firebase
    await loadProductsFromFirebase();
    
    // Verificar si hay usuario logueado
    await checkAuth();
    
    // Cargar carrito del usuario actual
    await loadCartFromFirebase();
    
    // Mostrar página inicial
    showPage('home');
}

// ==================== NAVEGACIÓN ====================
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

// ==================== PRODUCTOS ====================
async function loadProductsFromFirebase() {
    try {
        const productsRef = database.ref('products');
        const snapshot = await productsRef.once('value');
        const productsData = snapshot.val();
        
        if (productsData) {
            // Convertir objeto Firebase a array
            products = Object.values(productsData).filter(p => p.active !== false);
            console.log('Productos cargados desde Firebase:', products.length);
        } else {
            console.warn('No se encontraron productos en Firebase');
            products = [];
        }
    } catch (error) {
        console.error('Error al cargar productos desde Firebase:', error);
        showMessage('Error al cargar productos. Verifica tu conexión a Firebase.', 'error');
        products = [];
    }
}

function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Filtrar productos por categoría
    let filteredProducts = products;
    if (currentCategory !== 'todos') {
        filteredProducts = products.filter(p => p.category === currentCategory);
    }
    
    // Filtrar solo productos activos
    filteredProducts = filteredProducts.filter(p => p.active !== false);
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--light-gray);">No hay productos en esta categoría</p>';
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image || '🛍️'}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
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
        <div class="product-details-image">${product.image || '🛍️'}</div>
        <div class="product-details-info">
            <h2>${product.name}</h2>
            <p>${product.description || ''}</p>
            <div class="price">$${product.price.toFixed(2)}</div>
            <button class="btn-primary" onclick="addToCart(${product.id}); closeModal();" style="width: 100%; margin-bottom: 2rem;">Agregar al Carrito</button>
            <div class="specifications">
                <h3>Especificaciones</h3>
                ${specsHTML || '<p>No hay especificaciones disponibles</p>'}
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

// ==================== CARRITO ====================
async function addToCart(productId) {
    if (!currentUser) {
        showMessage('Por favor inicia sesión para agregar productos al carrito', 'error');
        showPage('login');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('Producto no encontrado', 'error');
        return;
    }
    
    try {
        const cartRef = database.ref(`carts/${currentUser.id}/${productId}`);
        const snapshot = await cartRef.once('value');
        const existingItem = snapshot.val();
        
        if (existingItem) {
            // Actualizar cantidad
            await cartRef.update({
                quantity: existingItem.quantity + 1
            });
        } else {
            // Agregar nuevo item
            await cartRef.set({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        await loadCartFromFirebase();
        updateCartUI();
        showMessage('Producto agregado al carrito', 'success');
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        showMessage('Error al agregar producto al carrito', 'error');
    }
}

async function removeFromCart(productId) {
    if (!currentUser) return;
    
    try {
        await database.ref(`carts/${currentUser.id}/${productId}`).remove();
        await loadCartFromFirebase();
        updateCartUI();
        loadCart();
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        showMessage('Error al eliminar producto', 'error');
    }
}

async function updateQuantity(productId, change) {
    if (!currentUser) return;
    
    try {
        const cartRef = database.ref(`carts/${currentUser.id}/${productId}`);
        const snapshot = await cartRef.once('value');
        const item = snapshot.val();
        
        if (!item) return;
        
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            await removeFromCart(productId);
        } else {
            await cartRef.update({ quantity: newQuantity });
            await loadCartFromFirebase();
            updateCartUI();
            loadCart();
        }
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        showMessage('Error al actualizar cantidad', 'error');
    }
}

async function loadCartFromFirebase() {
    if (!currentUser) {
        cart = [];
        updateCartUI();
        return;
    }
    
    try {
        const cartRef = database.ref(`carts/${currentUser.id}`);
        const snapshot = await cartRef.once('value');
        const cartData = snapshot.val();
        
        if (cartData) {
            cart = Object.values(cartData);
        } else {
            cart = [];
        }
        
        updateCartUI();
    } catch (error) {
        console.error('Error al cargar carrito desde Firebase:', error);
        cart = [];
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
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
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.image || '🛍️'}</div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Precio unitario: $${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity || 1}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-price">$${(item.price * (item.quantity || 1)).toFixed(2)}</div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

async function checkout() {
    if (cart.length === 0) {
        showMessage('Tu carrito está vacío', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Por favor inicia sesión para continuar', 'error');
        showPage('login');
        return;
    }
    
    try {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const shipping = 5.00;
        const total = subtotal + shipping;
        
        const order = {
            userId: currentUser.id,
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Guardar pedido en Firebase
        const ordersRef = database.ref('orders');
        const newOrderRef = ordersRef.push();
        await newOrderRef.set(order);
        
        // Limpiar carrito
        await database.ref(`carts/${currentUser.id}`).remove();
        await loadCartFromFirebase();
        
        showMessage('¡Pedido realizado exitosamente!', 'success');
        showPage('home');
    } catch (error) {
        console.error('Error al procesar pedido:', error);
        showMessage('Error al procesar el pedido. Intenta nuevamente.', 'error');
    }
}

// ==================== AUTENTICACIÓN ====================
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
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        // Buscar usuario en Firebase por email
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        const userData = snapshot.val();
        
        if (!userData) {
            showMessage('Email o contraseña incorrectos', 'error');
            return;
        }
        
        // Obtener el primer usuario encontrado
        const userId = Object.keys(userData)[0];
        const user = userData[userId];
        
        // Verificar contraseña (en producción deberías usar Firebase Auth o hash)
        // Por ahora, verificamos que la contraseña esté guardada (esto es solo para demo)
        // En producción, NO guardes contraseñas en texto plano. Usa Firebase Authentication.
        if (user.password && user.password === password) {
            currentUser = {
                id: userId,
                name: user.name,
                email: user.email
            };
            
            updateAuthUI();
            await loadCartFromFirebase();
            showPage('home');
            showMessage('Bienvenido de nuevo!', 'success');
            e.target.reset();
        } else {
            showMessage('Email o contraseña incorrectos', 'error');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showMessage('Error al iniciar sesión. Intenta nuevamente.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (!name || !email || !password) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirm) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        // Verificar si el email ya existe
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        
        if (snapshot.exists()) {
            showMessage('Este email ya está registrado', 'error');
            return;
        }
        
        // Crear nuevo usuario
        const newUserRef = usersRef.push();
        const userId = newUserRef.key;
        
        const userData = {
            id: userId,
            name: name,
            email: email,
            password: password, // ⚠️ ADVERTENCIA: En producción, usa Firebase Authentication
            createdAt: new Date().toISOString(),
            role: 'customer'
        };
        
        await newUserRef.set(userData);
        
        currentUser = {
            id: userId,
            name: name,
            email: email
        };
        
        updateAuthUI();
        showPage('home');
        showMessage('Cuenta creada exitosamente!', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Error al crear cuenta:', error);
        showMessage('Error al crear la cuenta. Intenta nuevamente.', 'error');
    }
}

async function checkAuth() {
    // Verificar sesión del usuario (solo en memoria durante la sesión del navegador)
    // Todo se guarda en Firebase remoto - no se usa almacenamiento local
    if (currentUser) {
        updateAuthUI();
        await loadCartFromFirebase();
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
    cart = [];
    updateAuthUI();
    updateCartUI();
    showPage('home');
    showMessage('Sesión cerrada', 'success');
}

// ==================== UTILIDADES ====================
function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        activePage.insertBefore(messageEl, activePage.firstChild);
    } else {
        document.body.insertBefore(messageEl, document.body.firstChild);
    }
    
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
