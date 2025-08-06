
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBmSay4GcodjXJaTlrmGB4fqEPLA5b2V9o",
    authDomain: "granafacil-58053.firebaseapp.com",
    projectId: "granafacil-58053",
    storageBucket: "granafacil-58053.appspot.com",
    messagingSenderId: "162272759269",
    appId: "1:162272759269:web:e023deddb8bbde6fec730c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variaveis GLOBAIS
let currentUser = null;
let currentCharts = [];
let activeListeners = [];
let currentUnsubscribe = null;
const mainContent = document.getElementById('main-content');
const sidebarContainer = document.getElementById('sidebar');
const categories = {
    income: ['Salário', 'Freelance', 'Vendas', 'Investimentos', 'Presente', 'Outros'],
    expense: ['Comida', 'Transporte', 'Moradia', 'Contas', 'Lazer', 'Saúde', 'Compras', 'Educação', 'Outros']
};

// CONTROLE DE AUTENTICÇAO E SETUP
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('auth-flow-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        setupApp();
    } else {
        currentUser = null;
        document.getElementById('auth-flow-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
        setupAuthListeners();
    }
});
setupAuthListeners();

function setupApp() {
    renderSidebar();
    navigateTo('welcome');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        const toggleSidebar = (event) => { event.preventDefault(); sidebarContainer.classList.toggle('open'); };
        toggleBtn.addEventListener('click', toggleSidebar);
        toggleBtn.addEventListener('touchstart', toggleSidebar);
    }
}

function setupAuthListeners() {
    activeListeners.forEach(remove => remove());
    activeListeners = [];
    const addListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
            activeListeners.push(() => element.removeEventListener(event, handler));
        }
    };
    addListener('login-btn', 'click', login);
    addListener('signup-btn', 'click', signup);
    addListener('toggle-to-signup', 'click', toggleAuth);
    addListener('toggle-to-login', 'click', toggleAuth);
    addListener('login-eye-icon', 'click', () => togglePasswordVisibility('login-password', 'login-eye-icon'));
    addListener('signup-eye-icon', 'click', () => togglePasswordVisibility('signup-password', 'signup-eye-icon'));
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', sendPasswordReset);
        activeListeners.push(() => forgotPasswordLink.removeEventListener('click', sendPasswordReset));
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    if (!email || !password) return alert("Por favor, preencha email e senha.");
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (error) { alert("Erro ao fazer login: " + error.message); }
}
async function signup() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const username = document.getElementById("signup-username").value;
    if (!username || !email || !password) return alert("Por favor, preencha todos os campos.");
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
    } catch (error) { alert("Erro ao criar conta: " + error.message); }
}
async function sendPasswordReset(event) {
    if (event) event.preventDefault();
    const email = document.getElementById("login-email").value;
    if (!email) return showCustomConfirm("Por favor, digite seu email no campo de email para redefinir a senha.", () => {}, true);
    try { 
        await sendPasswordResetEmail(auth, email); 
        showCustomConfirm("Email de redefinição enviado! Verifique sua caixa de entrada.", () => {}, true);
    }
    catch (error) { alert("Erro ao enviar email de redefinição: " + error.message); }
}
function togglePasswordVisibility(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!passwordInput || !icon) return;
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}
function toggleAuth(event) {
    if (event) event.preventDefault();
    document.getElementById("auth-container").classList.toggle("hidden");
    document.getElementById("signup-container").classList.toggle("hidden");
}

// 4 ROTEADOR DE TELAS
function navigateTo(view, params = {}) {
    if (currentUnsubscribe) currentUnsubscribe();
    currentCharts.forEach(chart => chart.destroy());
    currentCharts = [];
    activeListeners.forEach(remove => remove());
    activeListeners = [];
    mainContent.innerHTML = '';
    document.querySelectorAll('.sidebar-menu a.sidebar-link').forEach(l => l.classList.remove('active'));
    const linkSelector = params.category ? `.sidebar-menu a.sidebar-link[data-category='${params.category}']` : `.sidebar-menu a.sidebar-link[data-view='${view}']`;
    document.querySelector(linkSelector)?.classList.add('active');
    switch (view) {
        case 'welcome': renderWelcomeView(); break;
        case 'dashboard_completo': renderDashboardCompletoView(); break;
        case 'dashboard_categoria': renderCategoryDashboard(params.type, params.category); break;
        default: renderWelcomeView(); break;
    }
}

// RENDERIZAÇAO DA SIDEBAR
function renderSidebar() {
    const createSubMenu = (type, categoryList) => categoryList.map(cat =>
        `<li><a class="sidebar-link" href="#" data-view="dashboard_categoria" data-type="${type}" data-category="${cat}">${cat}</a></li>`
    ).join('');
    sidebarContainer.innerHTML = `
        <div class="sidebar-header"><h3>Your money Your life</h3></div>
        <ul class="sidebar-menu">
            <li class="sidebar-menu-item">
                <a class="sidebar-link" href="#"><i class="fa-solid fa-arrow-up-wide-short"></i><span>Receitas</span><i class="fa-solid fa-chevron-right toggle-icon"></i></a>
                <ul class="submenu">${createSubMenu('income', categories.income)}</ul>
            </li>
            <li class="sidebar-menu-item">
                <a class="sidebar-link" href="#"><i class="fa-solid fa-arrow-down-wide-short"></i><span>Despesas</span><i class="fa-solid fa-chevron-right toggle-icon"></i></a>
                <ul class="submenu">${createSubMenu('expense', categories.expense)}</ul>
            </li>
            <hr>
            <li><a class="sidebar-link" href="#" data-view="dashboard_completo"><i class="fa-solid fa-table-columns"></i><span>Dashboard Completo</span></a></li>
        </ul>
        <div class="sidebar-footer">
            <div id="user-profile"><span id="sidebar-username">${currentUser.displayName || 'Usuário'}</span></div>
            <a href="#" id="logout-btn-sidebar"><i class="fa-solid fa-right-from-bracket"></i><span>Sair</span></a>
        </div>
    `;
    sidebarContainer.querySelectorAll('.sidebar-menu a.sidebar-link').forEach(item => {
        const parentLi = item.parentElement;
        if (parentLi.classList.contains('sidebar-menu-item')) {
            item.addEventListener('click', (e) => { e.preventDefault(); parentLi.classList.toggle('open'); });
        } else {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item.dataset.view, { type: item.dataset.type, category: item.dataset.category });
            });
        }
    });
    sidebarContainer.querySelector('#logout-btn-sidebar').addEventListener('click', async () => {
        showCustomConfirm("Tem certeza que deseja sair?", async () => {
            currentCharts.forEach(chart => chart.destroy());
            if (currentUnsubscribe) currentUnsubscribe();
            await signOut(auth);
            location.reload();
        });
    });
}

// FUNÇOES QUE DESENHAM CADA TELA
function renderWelcomeView() {
    mainContent.innerHTML = `<div class="welcome-view"><h1>Seja Bem-vindo, ${currentUser.displayName}!</h1><p>É muito bom tê-lo de volta. Selecione uma opção no menu.</p></div>`;
}

function renderDashboardCompletoView() {
    let currentDate = new Date();
    let timeFrame = 'monthly';
    let chartType = 'column';
    let transactionsData = [];

    const updateView = () => {
        const isMonthly = timeFrame === 'monthly';
        mainContent.innerHTML = `
            <div class="page-header">
                <h1>Dashboard Completo</h1>
                <div class="view-toggle">
                    <button id="monthly-view-btn" class="view-toggle-btn ${isMonthly ? 'active' : ''}">Mensal</button>
                    <button id="annual-view-btn" class="view-toggle-btn ${!isMonthly ? 'active' : ''}">Anual</button>
                </div>
            </div>
            <div class="date-navigation">
                <button id="prev-btn" class="btn-nav">‹ ${isMonthly ? 'Mês' : 'Ano'} Anterior</button>
                <h2 id="current-period-display"></h2>
                <button id="next-btn" class="btn-nav">Próximo ${isMonthly ? 'Mês' : 'Ano'} ›</button>
            </div>
            <p class="saldo">Saldo do Período: <span id="balance">R$ 0,00</span></p>
            <div class="form-transacao">
                <h3>Adicionar Nova Transação</h3>
                <div class="form-grid">
                    <select id="type"></select>
                    <select id="category"></select>
                    <input type="number" id="amount" placeholder="Valor (ex: 50.75)">
                    <input type="text" id="description" placeholder="Descrição (Opcional)">
                    <button class="btn btn-primary" id="addBtn">Adicionar</button>
                </div>
            </div>
            <div class="dashboard-content">
                <h3>Histórico do Período</h3>
                <ul id="history-list"></ul>
                <div class="chart-controls">
                    <button id="column-chart-btn" class="chart-toggle-btn"><i class="fa-solid fa-chart-column"></i> Colunas</button>
                    <button id="bar-chart-btn" class="chart-toggle-btn"><i class="fa-solid fa-chart-bar"></i> Barras</button>
                    <button id="pie-chart-btn" class="chart-toggle-btn"><i class="fa-solid fa-chart-pie"></i> Pizza</button>
                </div>
                <div class="charts" id="charts-container"></div>
            </div>
        `;
        setupListeners();
        loadData();
    };
    const setupListeners = () => {
        const addListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
                activeListeners.push(() => element.removeEventListener(event, handler));
            }
        };
        addListener('monthly-view-btn', 'click', () => { timeFrame = 'monthly'; updateView(); });
        addListener('annual-view-btn', 'click', () => { timeFrame = 'annual'; updateView(); });
        addListener('prev-btn', 'click', () => {
            if (timeFrame === 'monthly') currentDate.setMonth(currentDate.getMonth() - 1);
            else currentDate.setFullYear(currentDate.getFullYear() - 1);
            loadData();
        });
        addListener('next-btn', 'click', () => {
            if (timeFrame === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
            else currentDate.setFullYear(currentDate.getFullYear() + 1);
            loadData();
        });
        addListener('addBtn', 'click', addTransactionFromForm);
        addListener('type', 'change', updateCategoryOptions);
        addListener('column-chart-btn', 'click', () => { chartType = 'column'; renderTransactionList(transactionsData, true, chartType); });
        addListener('bar-chart-btn', 'click', () => { chartType = 'bar'; renderTransactionList(transactionsData, true, chartType); });
        addListener('pie-chart-btn', 'click', () => { chartType = 'pie'; renderTransactionList(transactionsData, true, chartType); });
    };
    const loadData = () => {
        updatePeriodDisplay(currentDate, timeFrame);
        updateCategoryOptions();
        let startDate, endDate;
        if (timeFrame === 'monthly') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
        } else {
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            endDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);
        }
        const q = query(collection(db, "transactions"), where("uid", "==", currentUser.uid), where("createdAt", ">=", startDate), where("createdAt", "<=", endDate), orderBy("createdAt", "desc"));
        currentUnsubscribe = onSnapshot(q, (snapshot) => {
            transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTransactionList(transactionsData, true, chartType);
        }, (error) => {
            console.error("Erro ao buscar dados: ", error);
        });
    };
    updateView();
}

function renderCategoryDashboard(type, category) {
    let currentDate = new Date();
    let timeFrame = 'monthly';
    let transactionsData = [];
    const updateView = () => {
        const isMonthly = timeFrame === 'monthly';
        mainContent.innerHTML = `
            <div class="page-header">
                <h1>Análise de: ${category}</h1>
                <div class="view-toggle">
                    <button id="monthly-view-btn" class="view-toggle-btn ${isMonthly ? 'active' : ''}">Mensal</button>
                    <button id="annual-view-btn" class="view-toggle-btn ${!isMonthly ? 'active' : ''}">Anual</button>
                </div>
            </div>
            <div class="date-navigation">
                <button id="prev-btn" class="btn-nav">‹ ${isMonthly ? 'Mês' : 'Ano'} Anterior</button>
                <h2 id="current-period-display"></h2>
                <button id="next-btn" class="btn-nav">Próximo ${isMonthly ? 'Mês' : 'Ano'} ›</button>
            </div>
            <p class="saldo">Total em ${category}: <span id="category-total">R$ 0,00</span></p>
            <div class="dashboard-content">
                <h3>Histórico da Categoria</h3>
                <ul id="history-list"></ul>
                <div class="charts"><canvas id="categoryChart"></canvas></div>
            </div>
        `;
        setupListeners();
        loadDataForCategory();
    };
    const setupListeners = () => {
        const addListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
                activeListeners.push(() => element.removeEventListener(event, handler));
            }
        };
        addListener('monthly-view-btn', 'click', () => { timeFrame = 'monthly'; updateView(); });
        addListener('annual-view-btn', 'click', () => { timeFrame = 'annual'; updateView(); });
        addListener('prev-btn', 'click', () => {
            if (timeFrame === 'monthly') currentDate.setMonth(currentDate.getMonth() - 1);
            else currentDate.setFullYear(currentDate.getFullYear() - 1);
            loadDataForCategory();
        });
        addListener('next-btn', 'click', () => {
            if (timeFrame === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
            else currentDate.setFullYear(currentDate.getFullYear() + 1);
            loadDataForCategory();
        });
    };
    const loadDataForCategory = () => {
        updatePeriodDisplay(currentDate, timeFrame);
        let startDate, endDate;
        if (timeFrame === 'monthly') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
        } else {
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            endDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);
        }
        const q = query(collection(db, "transactions"), where("uid", "==", currentUser.uid), where("type", "==", type), where("category", "==", category), where("createdAt", ">=", startDate), where("createdAt", "<=", endDate), orderBy("createdAt", "desc"));
        currentUnsubscribe = onSnapshot(q, (snapshot) => {
            transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderCategoryTransactionList(transactionsData);
        }, (error) => {
            console.error("Erro ao buscar dados de categoria: ", error);
        });
    };
    updateView();
}

// --- 7. FUNÇÕES DE RENDERIZAÇÃO DE DADOS ---
function renderTransactionList(transactions, renderMainChart = false, chartType = 'column') {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;
    let balance = 0;
    const incomeData = {}, expenseData = {};
    if (transactions.length === 0) {
        historyList.innerHTML = "<li style='text-align: center; padding: 1rem; color: var(--text-secondary);'>Nenhuma transação neste período.</li>";
        if (renderMainChart) renderCombinedChart({}, {}, chartType);
    } else {
        historyList.innerHTML = "";
        transactions.forEach((t) => {
            const li = document.createElement("li");
            li.className = t.type === 'income' ? 'income-item' : 'expense-item';
            li.innerHTML = `<div><span>${t.description}</span><small> - ${t.category} - ${t.createdAt.toDate().toLocaleDateString('pt-BR')}</small></div><div><span class="value">${t.type === "income" ? "+ " : "- "}R$ ${t.amount.toFixed(2)}</span><button class="delete-btn" data-id="${t.id}">Excluir</button></div>`;
            historyList.appendChild(li);
            balance += t.type === "income" ? t.amount : -t.amount;
            if (t.type === 'income') incomeData[t.category] = (incomeData[t.category] || 0) + t.amount;
            else expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
        });
        if (renderMainChart) renderCombinedChart(incomeData, expenseData, chartType);
    }
    document.getElementById("balance").textContent = `R$ ${balance.toFixed(2)}`;
    historyList.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() { deleteTransaction(this.dataset.id); });
    });
}

function renderCategoryTransactionList(transactions) {
    const historyList = document.getElementById("history-list");
    const totalSpan = document.getElementById("category-total");
    if (!historyList || !totalSpan) return;
    let categoryTotal = 0;
    const chartLabels = [], chartData = [];
    if (transactions.length === 0) {
        historyList.innerHTML = "<li style='text-align: center; padding: 1rem; color: var(--text-secondary);'>Nenhuma transação para esta categoria neste período.</li>";
        if (currentCharts.length > 0) { currentCharts.forEach(c => c.destroy()); currentCharts = []; }
    } else {
        historyList.innerHTML = "";
        transactions.forEach((t) => {
            const li = document.createElement("li");
            li.className = t.type === 'income' ? 'income-item' : 'expense-item';
            li.innerHTML = `<div><span>${t.description}</span><small> - ${t.createdAt.toDate().toLocaleDateString('pt-BR')}</small></div><div><span class="value">R$ ${t.amount.toFixed(2)}</span><button class="delete-btn" data-id="${t.id}">Excluir</button></div>`;
            historyList.appendChild(li);
            categoryTotal += t.amount;
            chartLabels.push(t.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            chartData.push(t.amount);
        });
        renderCategoryChart(chartLabels.reverse(), chartData.reverse());
    }
    totalSpan.textContent = `R$ ${categoryTotal.toFixed(2)}`;
    historyList.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() { deleteTransaction(this.dataset.id); });
    });
}

// FUNÇOES DE GRAFICOS
function renderCombinedChart(incomeData, expenseData, type = 'column') {
    const container = document.getElementById('charts-container');
    if (!container) return;
    container.innerHTML = '';
    currentCharts.forEach(chart => chart.destroy());
    currentCharts = [];
    document.querySelectorAll('.chart-controls .chart-toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${type}-chart-btn`)?.classList.add('active');
    if (type === 'bar' || type === 'column') {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const totalIncome = Object.values(incomeData).reduce((s, a) => s + a, 0);
        const totalExpense = Object.values(expenseData).reduce((s, a) => s + a, 0);
        const chart = new Chart(canvas, { type: 'bar', data: { labels: ['Receitas', 'Despesas'], datasets: [{ label: 'Total no Período (R$)', data: [totalIncome, totalExpense], backgroundColor: ['rgba(29, 185, 84, 0.7)', 'rgba(255, 79, 79, 0.7)'], borderColor: ['#1DB954', '#ff4f4f'], borderWidth: 2, borderRadius: 5, }] }, options: { indexAxis: type === 'bar' ? 'y' : 'x', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Resumo Financeiro do Período', color: '#E0E0E0', font: { size: 16 } } }, scales: { x: { ticks: { color: '#B3B3B3' }, grid: { color: '#ffffff1a' } }, y: { ticks: { color: '#E0E0E0', font: { weight: 500 } }, grid: { display: false } } } } });
        currentCharts.push(chart);
    } else if (type === 'pie') {
        container.innerHTML = '<div class="pie-charts-container"></div>';
        const pieContainer = container.querySelector('.pie-charts-container');
        if (Object.keys(incomeData).length > 0) {
            const incomeCanvasDiv = document.createElement('div'); incomeCanvasDiv.className = 'pie-chart-wrapper';
            incomeCanvasDiv.innerHTML = '<h4>Distribuição de Receitas</h4>';
            const incomeCanvas = document.createElement('canvas'); incomeCanvasDiv.appendChild(incomeCanvas);
            pieContainer.appendChild(incomeCanvasDiv);
            const incomeChart = new Chart(incomeCanvas, { type: 'pie', data: { labels: Object.keys(incomeData), datasets: [{ data: Object.values(incomeData) }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#E0E0E0' } } } } });
            currentCharts.push(incomeChart);
        }
        if (Object.keys(expenseData).length > 0) {
            const expenseCanvasDiv = document.createElement('div'); expenseCanvasDiv.className = 'pie-chart-wrapper';
            expenseCanvasDiv.innerHTML = '<h4>Distribuição de Despesas</h4>';
            const expenseCanvas = document.createElement('canvas'); expenseCanvasDiv.appendChild(expenseCanvas);
            pieContainer.appendChild(expenseCanvasDiv);
            const expenseChart = new Chart(expenseCanvas, { type: 'pie', data: { labels: Object.keys(expenseData), datasets: [{ data: Object.values(expenseData) }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#E0E0E0' } } } } });
            currentCharts.push(expenseChart);
        }
    }
}

function renderCategoryChart(labels, data) {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;
    currentCharts.forEach(c => c.destroy());
    currentCharts = [];
    const chart = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{ label: `Valor (R$)`, data: data, fill: true, borderColor: 'var(--primary)', backgroundColor: 'rgba(0, 255, 255, 0.1)', tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#B3B3B3' }, grid: { color: '#ffffff1a' } }, y: { ticks: { color: '#B3B3B3' }, grid: { color: '#ffffff1a' } } } } });
    currentCharts.push(chart);
}

function showCustomConfirm(message, onConfirm, isAlert = false) {
    const confirmModal = document.getElementById('confirm-modal-container');
    const title = document.getElementById('confirm-modal-title');
    const okBtn = document.getElementById('confirm-modal-ok-btn');
    const cancelBtn = document.getElementById('confirm-modal-cancel-btn');

    title.textContent = message;
    
    if (isAlert) {
        cancelBtn.classList.add('hidden');
        okBtn.textContent = "OK";
    } else {
        cancelBtn.classList.remove('hidden');
        okBtn.textContent = "Confirmar";
    }

    const close = () => {
        confirmModal.classList.add('hidden');
        okBtn.onclick = null;
        cancelBtn.onclick = null;
    };

    okBtn.onclick = () => { if(onConfirm) onConfirm(); close(); };
    cancelBtn.onclick = close;
    confirmModal.classList.remove('hidden');
}

// FUNÇOES DE DADOS E UTILITARIOS
async function addTransaction(amount, description, type, category) {
    await addDoc(collection(db, "transactions"), { uid: currentUser.uid, amount, description: description.trim() === '' ? 'Sem descrição' : description.trim(), type, category, createdAt: Timestamp.fromDate(new Date()) });
}
async function addTransactionFromForm() {
    const amount = parseFloat(document.getElementById("amount").value);
    const description = document.getElementById("description").value;
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    if (isNaN(amount) || amount <= 0 || !type || !category) return showCustomConfirm("Por favor, preencha tipo, categoria e um valor válido.", () => {}, true);
    await addTransaction(amount, description, type, category);
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
}
async function deleteTransaction(id) {
    showCustomConfirm("Tem certeza que deseja excluir esta transação?", async () => {
        try { await deleteDoc(doc(db, "transactions", id)); }
        catch (error) { alert("Erro ao excluir transação: " + error.message); }
    });
}
function updateCategoryOptions() {
    const typeSelect = document.getElementById("type");
    const categorySelect = document.getElementById("category");
    if (!typeSelect || !categorySelect) return;
    const currentType = typeSelect.value;
    if (typeSelect.options.length === 0) {
        typeSelect.innerHTML = `<option value="expense">Despesa</option><option value="income">Receita</option>`;
    }
    typeSelect.value = currentType || 'expense';
    const selectedType = typeSelect.value;
    categorySelect.innerHTML = '';
    categories[selectedType].forEach(cat => categorySelect.add(new Option(cat, cat)));
}
function updatePeriodDisplay(date, timeFrame) {
    const display = document.getElementById('current-period-display');
    if (display) {
        display.textContent = timeFrame === 'monthly' ?
            date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()) :
            date.getFullYear();
    }
}