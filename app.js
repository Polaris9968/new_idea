/* --- app.js：只负责登录后的逻辑 --- */
console.log("app.js 已成功加载");

let currentUser = null;

// 进入系统的初始化函数
function initUserSession(user) {
    console.log("正在初始化界面...", user.username);
    currentUser = user;
    
    // 1. 切换显示区域
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-system').classList.remove('hidden');

    // 2. 填充个人信息
    document.getElementById('display-username').innerText = user.username;
    document.getElementById('display-email').innerText = user.email;

    // 3. 管理员权限判断 (如果是管理员，显示隐藏菜单)
    const adminMenu = document.getElementById('admin-menu');
    if (user.email === "111111@111.com" || user.username === "111") {
        if(adminMenu) adminMenu.classList.remove('hidden');
        renderAdminData();
    } else {
        if(adminMenu) adminMenu.classList.add('hidden');
    }
    
    // 4. 默认显示主页标签
    switchTab('home');
}

// 标签页切换逻辑
function switchTab(tabId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    // 显示目标页面
    const targetPage = document.getElementById('page-' + tabId);
    if(targetPage) targetPage.classList.remove('hidden');

    // 侧边栏样式切换
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('active');
        }
    });
}

// 渲染管理员数据
function renderAdminData() {
    const tableBody = document.getElementById('user-table-body');
    if (!tableBody) return;
    
    // 注意：这里的 users 变量直接引用 auth.js 里的全局变量
    tableBody.innerHTML = users.map(u => `
        <tr>
            <td>${u.username}</td>
            <td>${u.email}</td>
        </tr>
    `).join('');
}

// 退出登录
function handleLogout() {
    currentUser = null;
    // 返回登录界面
    document.getElementById('main-system').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
    // 清空输入框
    document.getElementById('login-id').value = "";
    document.getElementById('login-pwd').value = "";
}