// Variables globales
let currentTab = "dashboard"
let sidebarActive = false

// Elementos DOM
const sidebar = document.querySelector(".sidebar")
const toggleBtn = document.querySelector(".toggle-btn")
const navItems = document.querySelectorAll(".sidebar .nav li")
const tabContents = document.querySelectorAll(".tab-content")
const logoutBtn = document.getElementById("logoutBtn")

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  initializeAdmin()
  loadDashboardData()
  initializeCharts()
})

// Función de inicialización
function initializeAdmin() {
  // Verificar autenticación
  if (!isAuthenticated()) {
    window.location.href = "index.html"
    return
  }

  // Event listeners para navegación
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      if (this.id === "logoutBtn") {
        logout()
        return
      }

      const tabName = this.getAttribute("data-tab")
      if (tabName) {
        switchTab(tabName)
      }
    })
  })

  // Toggle sidebar en móvil
  toggleBtn.addEventListener("click", () => {
    sidebarActive = !sidebarActive
    sidebar.classList.toggle("active", sidebarActive)
  })

  // Cerrar sidebar al hacer click fuera en móvil
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebarActive && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebarActive = false
      sidebar.classList.remove("active")
    }
  })

  // Event listeners para formularios
  initializeFormHandlers()
}

// Verificar autenticación
function isAuthenticated() {
  // En una implementación real, verificaríamos el token de sesión
  return sessionStorage.getItem("adminAuthenticated") === "true"
}

// Cerrar sesión
function logout() {
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    sessionStorage.removeItem("adminAuthenticated")
    window.location.href = "index.html"
  }
}

// Cambiar entre pestañas
function switchTab(tabName) {
  // Actualizar navegación activa
  navItems.forEach((item) => {
    item.classList.remove("active")
    if (item.getAttribute("data-tab") === tabName) {
      item.classList.add("active")
    }
  })

  // Mostrar contenido de la pestaña
  tabContents.forEach((content) => {
    content.classList.remove("active")
    if (content.id === tabName) {
      content.classList.add("active")
    }
  })

  currentTab = tabName

  // Cargar datos específicos de la pestaña
  loadTabData(tabName)
}

// Cargar datos del dashboard
function loadDashboardData() {
  // Simular datos del dashboard
  const stats = {
    totalOrders: 254,
    revenue: 1254,
    users: 128,
    pending: 15,
  }

  // Actualizar estadísticas (en una implementación real, estos datos vendrían de la API)
  updateDashboardStats(stats)
}

// Actualizar estadísticas del dashboard
function updateDashboardStats(stats) {
  const statCards = document.querySelectorAll(".stat-card")

  if (statCards.length >= 4) {
    statCards[0].querySelector(".stat-value").textContent = stats.totalOrders
    statCards[1].querySelector(".stat-value").textContent = `$${stats.revenue}`
    statCards[2].querySelector(".stat-value").textContent = stats.users
    statCards[3].querySelector(".stat-value").textContent = stats.pending
  }
}

// Cargar datos específicos de cada pestaña
function loadTabData(tabName) {
  switch (tabName) {
    case "orders":
      loadOrdersData()
      break
    case "users":
      loadUsersData()
      break
    case "services":
      loadServicesData()
      break
    case "refunds":
      loadRefundsData()
      break
    case "reports":
      loadReportsData()
      break
    case "settings":
      loadSettingsData()
      break
  }
}

// Cargar datos de pedidos
function loadOrdersData() {
  // Simular carga de pedidos desde la API
  console.log("Cargando datos de pedidos...")

  // En una implementación real, aquí haríamos una llamada a la API
  // fetch('/api/admin/orders')
  //     .then(response => response.json())
  //     .then(data => updateOrdersTable(data));
}

// Cargar datos de usuarios
function loadUsersData() {
  console.log("Cargando datos de usuarios...")
}

// Cargar datos de servicios
function loadServicesData() {
  console.log("Cargando datos de servicios...")
}

// Cargar datos de reembolsos
function loadRefundsData() {
  console.log("Cargando datos de reembolsos...")
}

// Cargar datos de informes
function loadReportsData() {
  console.log("Cargando datos de informes...")
  // Actualizar gráficos de informes
  updateReportCharts()
}

// Cargar configuración
function loadSettingsData() {
  console.log("Cargando configuración...")
}

// Inicializar gráficos (versión simplificada sin Chart.js)
function initializeCharts() {
  console.log("Inicializando gráficos simplificados...")

  // Crear gráficos con CSS y HTML simple
  createSimpleChart("salesChart", "Ventas Mensuales")
  createSimpleChart("servicesChart", "Servicios Populares")
}

// Crear gráfico simple con CSS
function createSimpleChart(canvasId, title) {
  const canvas = document.getElementById(canvasId)
  if (canvas) {
    // Reemplazar canvas con un div simple
    const chartDiv = document.createElement("div")
    chartDiv.className = "simple-chart"
    chartDiv.innerHTML = `
      <div class="chart-placeholder">
        <i class="fas fa-chart-line" style="font-size: 3rem; color: #4cc9f0; opacity: 0.5;"></i>
        <p style="margin-top: 10px; color: #666;">Gráfico: ${title}</p>
        <p style="font-size: 0.8rem; color: #999;">Los datos se cargarán automáticamente</p>
      </div>
    `
    chartDiv.style.cssText = `
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 5px;
      text-align: center;
    `

    canvas.parentNode.replaceChild(chartDiv, canvas)
  }
}

// Actualizar gráficos de informes (versión simplificada)
function updateReportCharts() {
  console.log("Actualizando gráficos de informes...")

  // Crear placeholders para los gráficos de informes
  const reportCharts = ["monthlyReportChart", "topServicesChart", "platformRevenueChart", "newUsersChart"]

  reportCharts.forEach((chartId) => {
    const canvas = document.getElementById(chartId)
    if (canvas) {
      createSimpleChart(
        chartId,
        chartId
          .replace("Chart", "")
          .replace(/([A-Z])/g, " $1")
          .trim(),
      )
    }
  })
}

// Inicializar manejadores de formularios
function initializeFormHandlers() {
  // Formularios de configuración
  const settingsForms = document.querySelectorAll(".settings-section form")
  settingsForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault()
      handleSettingsSubmit(this)
    })
  })

  // Botones de acción en tablas
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("action-btn")) {
      handleActionButton(e.target)
    }
  })

  // Filtros
  const filterBtns = document.querySelectorAll(".filter-btn")
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      handleFilter(this)
    })
  })
}

// Manejar envío de configuración
function handleSettingsSubmit(form) {
  const formData = new FormData(form)

  // Simular guardado de configuración
  console.log("Guardando configuración...", Object.fromEntries(formData))

  // Mostrar mensaje de éxito
  showNotification("Configuración guardada exitosamente", "success")
}

// Manejar botones de acción
function handleActionButton(button) {
  const action = button.classList.contains("view")
    ? "view"
    : button.classList.contains("edit")
      ? "edit"
      : button.classList.contains("delete")
        ? "delete"
        : button.classList.contains("approve")
          ? "approve"
          : button.classList.contains("reject")
            ? "reject"
            : null

  if (!action) return

  const row = button.closest("tr")
  const id = row.querySelector("td").textContent

  switch (action) {
    case "view":
      viewItem(id)
      break
    case "edit":
      editItem(id)
      break
    case "delete":
      deleteItem(id)
      break
    case "approve":
      approveRefund(id)
      break
    case "reject":
      rejectRefund(id)
      break
  }
}

// Funciones de acción
function viewItem(id) {
  console.log("Ver item:", id)
  showNotification(`Viendo detalles del item ${id}`, "info")
}

function editItem(id) {
  console.log("Editar item:", id)
  showNotification(`Editando item ${id}`, "info")
}

function deleteItem(id) {
  if (confirm(`¿Estás seguro de que quieres eliminar el item ${id}?`)) {
    console.log("Eliminar item:", id)
    showNotification(`Item ${id} eliminado`, "success")
  }
}

function approveRefund(id) {
  if (confirm(`¿Aprobar reembolso ${id}?`)) {
    console.log("Aprobar reembolso:", id)
    showNotification(`Reembolso ${id} aprobado`, "success")
  }
}

function rejectRefund(id) {
  if (confirm(`¿Rechazar reembolso ${id}?`)) {
    console.log("Rechazar reembolso:", id)
    showNotification(`Reembolso ${id} rechazado`, "warning")
  }
}

// Manejar filtros
function handleFilter(button) {
  const filterContainer = button.closest(".filter-container")
  const filters = {}

  // Recopilar valores de filtros
  filterContainer.querySelectorAll("select, input").forEach((input) => {
    if (input.value) {
      filters[input.name || input.type] = input.value
    }
  })

  console.log("Aplicando filtros:", filters)
  showNotification("Filtros aplicados", "info")
}

// Mostrar notificaciones
function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Estilos de la notificación
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `

  // Colores según el tipo
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  }

  notification.style.backgroundColor = colors[type] || colors.info

  // Agregar al DOM
  document.body.appendChild(notification)

  // Animar entrada
  setTimeout(() => {
    notification.style.opacity = "1"
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Funciones de utilidad para la API (simuladas)
function fetchData(endpoint) {
  // Simular llamada a API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: [] })
    }, 1000)
  })
}

function postData(endpoint, data) {
  // Simular envío de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1000)
  })
}

// Configurar autenticación al cargar la página
if (window.location.pathname.includes("admin.html")) {
  // Verificar si viene de un login exitoso
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("auth") === "success") {
    sessionStorage.setItem("adminAuthenticated", "true")
    // Limpiar la URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

// Manejo de responsive
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebarActive = false
    sidebar.classList.remove("active")
  }
})
