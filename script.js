// Configuración de Supabase
const SUPABASE_URL = "https://your-project-id.supabase.co"
const SUPABASE_ANON_KEY = "your-anon-key"

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Variables globales
let currentUser = null
let userBalance = 0
let selectedPackage = null

// Credenciales de administrador
const ADMIN_EMAIL = "admin@jorling.com"
const ADMIN_PASSWORD = "JorlingAdmin2025!"

// Elementos DOM
const navbar = document.getElementById("navbar")
const userMenu = document.getElementById("userMenu")
const hamburgerMenu = document.getElementById("hamburgerMenu")
const dropdownMenu = document.getElementById("dropdownMenu")
const userDashboard = document.getElementById("userDashboard")
const loginModal = document.getElementById("loginModal")
const registerModal = document.getElementById("registerModal")
const orderModal = document.getElementById("orderModal")

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  checkAuthState()

  // Animar estadísticas cuando el footer sea visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStats()
        observer.unobserve(entry.target)
      }
    })
  })

  const footer = document.getElementById("footer")
  if (footer) {
    observer.observe(footer)
  }
})

// Inicializar aplicación
async function initializeApp() {
  console.log("Inicializando Jorling Seguidores...")

  // Verificar conexión con Supabase silenciosamente
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    if (error) {
      console.warn("Base de datos no conectada, usando modo local")
    }
  } catch (err) {
    console.warn("Trabajando en modo local")
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Navegación
  document.getElementById("loginBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    openModal("loginModal")
  })

  document.getElementById("registerBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    openModal("registerModal")
  })

  // Nuevos botones de navegación
  document.getElementById("serviciosNavBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    if (!currentUser) {
      openModal("registerModal")
    } else {
      showServices()
    }
  })

  document.getElementById("preciosNavBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    openModal("preciosModal")
  })

  document.getElementById("contactoNavBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("footer").scrollIntoView({ behavior: "smooth" })
  })

  document.getElementById("explorarServiciosBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("footer").scrollIntoView({ behavior: "smooth" })
  })

  // Menú hamburguesa
  hamburgerMenu?.addEventListener("click", () => {
    dropdownMenu.classList.toggle("show")
  })

  // Cerrar dropdown al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!userMenu?.contains(e.target)) {
      dropdownMenu?.classList.remove("show")
    }
  })

  // Botones del dropdown
  document.getElementById("dashboardBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    showDashboard()
  })

  document.getElementById("ordersBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    showUserOrders()
  })

  document.getElementById("servicesBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    showServices()
  })

  document.getElementById("fundsBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    showAddFunds()
  })

  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    logout()
  })

  // Formularios
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin)
  document.getElementById("registerForm")?.addEventListener("submit", handleRegister)
  document.getElementById("orderForm")?.addEventListener("submit", handleOrder)

  // Cerrar modales
  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", closeModals)
  })

  // Paquetes de servicios
  document.addEventListener("click", (e) => {
    if (e.target.closest(".package-option")) {
      selectPackage(e.target.closest(".package-option"))
    }
  })

  // Cambio entre modales
  document.getElementById("showRegister")?.addEventListener("click", (e) => {
    e.preventDefault()
    closeModals()
    openModal("registerModal")
  })

  document.getElementById("showLogin")?.addEventListener("click", (e) => {
    e.preventDefault()
    closeModals()
    openModal("loginModal")
  })
}

// Verificar estado de autenticación
async function checkAuthState() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      currentUser = session.user
      await loadUserData()
      showUserInterface()
    }
  } catch (error) {
    console.log("No hay sesión activa")
  }
}

// Manejar login
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  // Verificar si es administrador
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    showNotification("Acceso de administrador concedido", "success")
    setTimeout(() => {
      window.location.href = "admin.html?auth=success"
    }, 1000)
    return
  }

  try {
    showLoading(true)

    // Intentar login con base de datos
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      // Si la base de datos no está disponible, simular login para demo
      if (error.message.includes("fetch") || error.message.includes("network")) {
        simulateLogin(email)
      } else {
        throw new Error("Credenciales incorrectas")
      }
    } else {
      currentUser = data.user
      await loadUserData()
      showUserInterface()
      closeModals()
      showNotification("¡Bienvenido de vuelta!", "success")
    }
  } catch (error) {
    showNotification("Error al iniciar sesión. Verifica tus credenciales.", "error")
  } finally {
    showLoading(false)
  }
}

// Simular login (modo demo)
function simulateLogin(email) {
  currentUser = {
    id: "demo-user",
    email: email,
    user_metadata: { full_name: "Usuario Demo" },
  }
  userBalance = 25.0 // Saldo inicial de bienvenida
  showUserInterface()
  closeModals()
  showNotification("¡Bienvenido! Tienes $25.00 de saldo de bienvenida", "success")
}

// Manejar registro
async function handleRegister(e) {
  e.preventDefault()

  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("registerConfirmPassword").value

  if (password !== confirmPassword) {
    showNotification("Las contraseñas no coinciden", "error")
    return
  }

  if (password.length < 6) {
    showNotification("La contraseña debe tener al menos 6 caracteres", "error")
    return
  }

  try {
    showLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      // Si la base de datos no está disponible, simular registro
      if (error.message.includes("fetch") || error.message.includes("network")) {
        simulateRegister(email, name)
      } else {
        throw new Error("Error en el registro. Intenta con otro email.")
      }
    } else {
      showNotification("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.", "success")
      closeModals()
      openModal("loginModal")
    }
  } catch (error) {
    showNotification("Error al registrarse. Intenta nuevamente.", "error")
  } finally {
    showLoading(false)
  }
}

// Simular registro (modo demo)
function simulateRegister(email, name) {
  showNotification("¡Registro completado! Ya puedes iniciar sesión.", "success")
  closeModals()
  openModal("loginModal")
}

// Cargar datos del usuario
async function loadUserData() {
  try {
    // Intentar cargar desde la base de datos
    const { data, error } = await supabase.from("users").select("*").eq("id", currentUser.id).single()

    if (data) {
      userBalance = data.balance || 0
    } else {
      // Usar saldo por defecto si no hay datos
      userBalance = 25.0
    }
  } catch (error) {
    // Usar saldo de bienvenida por defecto
    userBalance = 25.0
  }

  updateUserInterface()
}

// Mostrar interfaz de usuario
function showUserInterface() {
  // Ocultar botones de login/register
  document.getElementById("loginBtn").style.display = "none"
  document.getElementById("registerBtn").style.display = "none"

  // Mostrar menú de usuario
  userMenu.style.display = "flex"

  // Actualizar nombre de usuario
  const userName = currentUser.user_metadata?.full_name || currentUser.email.split("@")[0]
  document.getElementById("userName").textContent = userName

  // Mostrar dashboard
  showDashboard()
}

// Actualizar interfaz de usuario
function updateUserInterface() {
  document.getElementById("userBalance").textContent = userBalance.toFixed(2)
}

// Mostrar dashboard
function showDashboard() {
  // Ocultar sección principal
  document.getElementById("inicio").style.display = "none"

  // Mostrar dashboard
  userDashboard.style.display = "block"

  // Cargar pedidos del usuario
  loadUserOrders()

  dropdownMenu.classList.remove("show")
}

// Mostrar servicios
function showServices() {
  document.getElementById("servicesPackages").scrollIntoView({ behavior: "smooth" })
  dropdownMenu.classList.remove("show")
}

// Mostrar pedidos del usuario
function showUserOrders() {
  document.getElementById("userOrders").scrollIntoView({ behavior: "smooth" })
  dropdownMenu.classList.remove("show")
}

// Mostrar añadir fondos
function showAddFunds() {
  showNotification("Para añadir fondos, contacta por WhatsApp: +57 323 413 5603", "info")
  // Abrir WhatsApp automáticamente después de 2 segundos
  setTimeout(() => {
    window.open("https://wa.me/573234135603?text=Hola, quiero añadir fondos a mi cuenta", "_blank")
  }, 2000)
  dropdownMenu.classList.remove("show")
}

// Seleccionar paquete
function selectPackage(packageElement) {
  if (!currentUser) {
    showNotification("Debes iniciar sesión para realizar pedidos", "warning")
    openModal("loginModal")
    return
  }

  // Remover selección anterior
  document.querySelectorAll(".package-option").forEach((el) => {
    el.classList.remove("selected")
  })

  // Seleccionar nuevo paquete
  packageElement.classList.add("selected")

  const servicePackage = packageElement.closest(".service-package")
  const serviceName = servicePackage.querySelector("h5").textContent
  const quantity = packageElement.dataset.quantity
  const price = packageElement.dataset.price

  selectedPackage = {
    service: serviceName,
    quantity: quantity,
    price: Number.parseFloat(price),
    serviceType: servicePackage.dataset.service,
  }

  // Llenar modal de pedido
  document.getElementById("selectedService").value = serviceName
  document.getElementById("selectedQuantity").value = `${quantity} unidades`
  document.getElementById("selectedPrice").value = `$${price}`

  // Abrir modal de pedido
  openModal("orderModal")
}

// Manejar pedido
async function handleOrder(e) {
  e.preventDefault()

  if (!selectedPackage) {
    showNotification("Error: No hay paquete seleccionado", "error")
    return
  }

  const targetUrl = document.getElementById("targetUrl").value

  if (!targetUrl) {
    showNotification("Por favor ingresa la URL de tu perfil o publicación", "error")
    return
  }

  // Validar URL básica
  if (
    !targetUrl.includes("instagram.com") &&
    !targetUrl.includes("facebook.com") &&
    !targetUrl.includes("youtube.com") &&
    !targetUrl.includes("twitter.com") &&
    !targetUrl.includes("x.com")
  ) {
    showNotification("Por favor ingresa una URL válida de red social", "error")
    return
  }

  // Verificar saldo
  if (userBalance < selectedPackage.price) {
    showNotification("Saldo insuficiente. Contacta por WhatsApp para añadir fondos.", "warning")
    return
  }

  try {
    showLoading(true)

    // Crear pedido
    const order = {
      id: generateOrderId(),
      user_id: currentUser.id,
      service: selectedPackage.service,
      service_type: selectedPackage.serviceType,
      quantity: selectedPackage.quantity,
      price: selectedPackage.price,
      target_url: targetUrl,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Intentar guardar en base de datos
    try {
      const { error } = await supabase.from("orders").insert([order])
      if (error && !error.message.includes("fetch")) {
        console.log("Error guardando pedido:", error)
      }
    } catch (supabaseError) {
      // Continuar con el proceso aunque no se pueda guardar
      console.log("Procesando pedido localmente")
    }

    // Actualizar saldo
    userBalance -= selectedPackage.price
    updateUserInterface()

    // Procesar pedido
    processOrderWithBot(order)

    closeModals()
    showNotification("¡Pedido creado exitosamente! Comenzaremos el procesamiento inmediatamente.", "success")

    // Actualizar lista de pedidos
    loadUserOrders()
  } catch (error) {
    showNotification("Error al crear el pedido. Intenta nuevamente.", "error")
  } finally {
    showLoading(false)
  }
}

// Procesar pedido con bot
async function processOrderWithBot(order) {
  try {
    // Simular procesamiento del bot
    setTimeout(() => {
      updateOrderStatus(order.id, "processing")
      showNotification(`Procesando pedido ${order.id}`, "info")
    }, 2000)

    // Simular finalización (en desarrollo real, esto sería manejado por el bot)
    setTimeout(() => {
      updateOrderStatus(order.id, "completed")
      showNotification(`Pedido ${order.id} completado`, "success")
    }, 30000) // 30 segundos para demo
  } catch (error) {
    console.error("Error procesando pedido:", error)
    updateOrderStatus(order.id, "error")
  }
}

// Actualizar estado del pedido
function updateOrderStatus(orderId, status) {
  const orderElement = document.querySelector(`[data-order-id="${orderId}"]`)
  if (orderElement) {
    const statusElement = orderElement.querySelector(".order-status")
    statusElement.className = `order-status status-${status}`
    statusElement.textContent = getStatusText(status)
  }
}

// Obtener texto del estado
function getStatusText(status) {
  const statusTexts = {
    pending: "Pendiente",
    processing: "Procesando",
    completed: "Completado",
    error: "Error",
  }
  return statusTexts[status] || status
}

// Cargar pedidos del usuario
async function loadUserOrders() {
  const ordersList = document.getElementById("ordersList")

  try {
    // Intentar cargar desde base de datos
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })

    if (error && !error.message.includes("fetch")) {
      throw error
    }

    const orders = data || getDemoOrders()
    displayOrders(orders)
  } catch (error) {
    // Mostrar pedidos de ejemplo
    displayOrders(getDemoOrders())
  }
}

// Obtener pedidos demo
function getDemoOrders() {
  return [
    {
      id: "DEMO001",
      service: "Seguidores Instagram",
      quantity: 1000,
      price: 10.0,
      target_url: "https://instagram.com/demo",
      status: "completed",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "DEMO002",
      service: "Likes Instagram",
      quantity: 500,
      price: 10.0,
      target_url: "https://instagram.com/p/demo",
      status: "processing",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]
}

// Mostrar pedidos
function displayOrders(orders) {
  const ordersList = document.getElementById("ordersList")

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="no-orders">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--primary-color); opacity: 0.5;"></i>
        <p>No tienes pedidos aún</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Selecciona un paquete para comenzar</p>
      </div>
    `
    return
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
    <div class="order-item" data-order-id="${order.id}">
      <div class="order-info">
        <h4>${order.service}</h4>
        <p>Cantidad: ${order.quantity}</p>
        <p>URL: ${order.target_url}</p>
        <small>Pedido: ${order.id}</small>
      </div>
      <div class="order-details">
        <div class="order-price">$${order.price.toFixed(2)}</div>
        <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
        <small>${formatDate(order.created_at)}</small>
      </div>
    </div>
  `,
    )
    .join("")
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Generar ID de pedido
function generateOrderId() {
  return "JOR" + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase()
}

// Cerrar sesión
async function logout() {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.log("Error al cerrar sesión:", error)
  }

  currentUser = null
  userBalance = 0

  // Mostrar interfaz de invitado
  document.getElementById("loginBtn").style.display = "inline-block"
  document.getElementById("registerBtn").style.display = "inline-block"
  userMenu.style.display = "none"
  userDashboard.style.display = "none"
  document.getElementById("inicio").style.display = "block"

  showNotification("Sesión cerrada", "info")
}

// Funciones de utilidad
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block"
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none"
  })
}

function showLoading(show) {
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    if (show) {
      form.classList.add("loading")
    } else {
      form.classList.remove("loading")
    }
  })
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${message}</span>
  `

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    color: white;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    border: 2px solid;
  `

  const colors = {
    success: { bg: "rgba(57, 255, 20, 0.9)", border: "#39ff14" },
    error: { bg: "rgba(255, 20, 147, 0.9)", border: "#ff1493" },
    warning: { bg: "rgba(255, 255, 0, 0.9)", border: "#ffff00", color: "#000" },
    info: { bg: "rgba(0, 191, 255, 0.9)", border: "#00bfff" },
  }

  const style = colors[type] || colors.info
  notification.style.background = style.bg
  notification.style.borderColor = style.border
  notification.style.boxShadow = `0 0 20px ${style.border}`

  if (style.color) {
    notification.style.color = style.color
  }

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = "1"
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 4000)
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  }
  return icons[type] || "info-circle"
}

// Funciones para menú móvil
function showMenu() {
  document.getElementById("navLinks").style.right = "0"
}

function hideMenu() {
  document.getElementById("navLinks").style.right = "-200px"
}

// Cerrar modales al hacer click fuera
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    closeModals()
  }
})

// Efectos visuales adicionales
document.addEventListener("mousemove", (e) => {
  const cursor = document.querySelector(".cursor-glow")
  if (!cursor) {
    const glowCursor = document.createElement("div")
    glowCursor.className = "cursor-glow"
    glowCursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, var(--primary-color), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.3;
      transition: all 0.1s ease;
    `
    document.body.appendChild(glowCursor)
  }

  const glowElement = document.querySelector(".cursor-glow")
  glowElement.style.left = e.clientX - 10 + "px"
  glowElement.style.top = e.clientY - 10 + "px"
})

// Inicializar efectos de partículas
function initParticleEffects() {
  const particleContainer = document.createElement("div")
  particleContainer.className = "particle-container"
  particleContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  `

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: var(--primary-color);
      border-radius: 50%;
      animation: float ${Math.random() * 10 + 5}s linear infinite;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.2};
    `
    particleContainer.appendChild(particle)
  }

  document.body.appendChild(particleContainer)
}

// Animar estadísticas
function animateStats() {
  const stats = [
    { id: "totalUsers", target: 2847, increment: 47 },
    { id: "totalOrders", target: 15392, increment: 123 },
    { id: "onlineUsers", target: 127, increment: 3 },
  ]

  stats.forEach((stat) => {
    const element = document.getElementById(stat.id)
    if (element) {
      let current = 0
      const increment = Math.ceil(stat.target / 100)

      const timer = setInterval(() => {
        current += increment
        if (current >= stat.target) {
          current = stat.target
          clearInterval(timer)
        }
        element.textContent = current.toLocaleString()
      }, 20)

      // Actualizar periódicamente
      setInterval(() => {
        const newValue = stat.target + Math.floor(Math.random() * stat.increment)
        element.textContent = newValue.toLocaleString()
      }, 30000) // Cada 30 segundos
    }
  })
}

// Inicializar efectos al cargar
setTimeout(() => {
  initParticleEffects()
  animateStats()
}, 1000)

console.log("🚀 Jorling Seguidores iniciado correctamente")
// Remover las líneas que muestran credenciales de admin en consola para usuarios normales
