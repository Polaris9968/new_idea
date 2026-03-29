let currentUser = null;

// 初始化用户会话
function initUserSession(user) {
    currentUser = user;
    
    // 隐藏认证界面，显示系统界面
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-system').classList.remove('hidden');

    // 填充个人信息页
    document.getElementById('display-username').innerText = user.username;
    document.getElementById('display-email').innerText = user.email;

    // 管理员权限判断
    const adminMenu = document.getElementById('admin-menu');
    if (user.email === "111111@111.com") {
        adminMenu.classList.remove('hidden');
        renderAdminData();
    } else {
        adminMenu.classList.add('hidden');
    }
    
    switchTab('home'); // 默认跳转主页
}

// 标签页切换
function switchTab(tabId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    // 取消侧边栏高亮
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    // 显示目标页
    document.getElementById('page-' + tabId).classList.remove('hidden');
    
    // 侧边栏高亮当前项 (根据点击或跳转逻辑)
    const activeItem = Array.from(document.querySelectorAll('.nav-item'))
                            .find(item => item.getAttribute('onclick').includes(tabId));
    if(activeItem) activeItem.classList.add('active');
}

// 渲染管理员数据表格
function renderAdminData() {
    const tableBody = document.getElementById('user-table-body');
    // 过滤掉密码，只显示用户名和邮箱
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
    document.getElementById('main-system').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
    // 清空登录框
    document.getElementById('login-id').value = "";
    document.getElementById('login-pwd').value = "";
}