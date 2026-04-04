/* --- app.js：登录后逻辑 --- */
console.log("app.js 已成功加载");

let currentUser = null;

/* --- 主题切换 --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    updateTheme(isDark);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    updateTheme(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
}

function updateTheme(isDark) {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');

    if (isDark) {
        html.classList.add('dark');
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = '暗色模式';
    } else {
        html.classList.remove('dark');
        if (icon) icon.textContent = '☀️';
        if (text) text.textContent = '亮色模式';
    }
}

/* --- 进入系统 --- */
function initUserSession(user) {
    console.log("正在初始化界面...", user.username);
    currentUser = user;

    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-system').classList.remove('hidden');

    document.getElementById('display-username').innerText = user.username;
    document.getElementById('display-email').innerText = user.email;

    const adminMenu = document.getElementById('admin-menu');
    if (user.email === "111111@111.com" || user.username === "111") {
        if (adminMenu) adminMenu.classList.remove('hidden');
        renderAdminData();
    } else {
        if (adminMenu) adminMenu.classList.add('hidden');
    }

    switchTab('home');
}

/* --- 标签页切换 --- */
function switchTab(tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById('page-' + tabId);
    if (targetPage) targetPage.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-blue-600');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('bg-blue-600');
        }
    });
}

/* --- 渲染管理员数据 --- */
function renderAdminData() {
    const tableBody = document.getElementById('user-table-body');
    if (!tableBody) return;

    const users = JSON.parse(localStorage.getItem('local_users')) || [];
    tableBody.innerHTML = users.map(u => `
        <tr class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="p-3">${u.username}</td>
            <td class="p-3">${u.email}</td>
        </tr>
    `).join('');
}

/* --- 退出登录 --- */
function handleLogout() {
    currentUser = null;
    document.getElementById('main-system').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('login-id').value = "";
    document.getElementById('login-pwd').value = "";
    document.getElementById('login-captcha').value = "";
    refreshCaptcha('login');
}

/* --- 注销账号 --- */
function handleDeleteAccount() {
    if (!currentUser) return;

    const confirmed = confirm('警告：此操作不可恢复！\n\n您确定要注销账号 "' + currentUser.username + '" 吗？\n所有数据将被永久删除。');

    if (!confirmed) return;

    const doubleConfirm = confirm('再次确认：\n\n注销后账号 "' + currentUser.username + '" 将无法恢复。\n\n确定要继续吗？');

    if (!doubleConfirm) return;

    // 从用户列表中删除
    const users = JSON.parse(localStorage.getItem('local_users')) || [];
    const filteredUsers = users.filter(u => u.email !== currentUser.email);
    localStorage.setItem('local_users', JSON.stringify(filteredUsers));

    // 如果是管理员且没有其他管理员，恢复默认
    if (currentUser.email === "111111@111.com" && filteredUsers.length === 0) {
        const ADMIN_CONF = { email: "111111@111.com", username: "111", password: "11111111" };
        localStorage.setItem('local_users', JSON.stringify([ADMIN_CONF]));
    }

    alert('账号已注销');
    handleLogout();
}

/* --- 数字排序功能 --- */
let uploadedFile = null;
let sortedResult = null;
let extractedNumbers = [];
let originalFileName = '';

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                processFile(e.target.files[0]);
            }
        });
    }
});

function processFile(file) {
    const allowedExts = ['.txt', '.csv', '.xlsx', '.xls', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedExts.includes(ext)) {
        showSortError('不支持的文件格式。请上传: .txt, .csv, .xlsx, .xls, .doc, .docx');
        return;
    }

    uploadedFile = file;
    originalFileName = file.name;
    document.getElementById('file-name').innerText = '已选择: ' + file.name;
    document.getElementById('sort-btn').disabled = false;
    hideSortError();
}

async function handleSort() {
    if (!uploadedFile) return;

    const sortOrder = document.querySelector('input[name="sort-order"]:checked').value;
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('order', sortOrder);

    showSortProgress();
    hideSortError();
    hideSortResult();
    hideOriginalPreview();

    try {
        const response = await fetch('/cgi-bin/upload.py', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('服务器错误: ' + response.status);
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        extractedNumbers = result.numbers;
        sortedResult = result.sorted_numbers;

        showOriginalPreview();
        showSortResult();
    } catch (err) {
        showSortError('处理失败: ' + err.message);
    } finally {
        hideSortProgress();
    }
}

function showOriginalPreview() {
    const preview = document.getElementById('original-preview');
    const count = document.getElementById('original-count');
    const numbers = document.getElementById('original-numbers');

    count.innerText = '共提取 ' + extractedNumbers.length + ' 个数字';
    numbers.innerText = extractedNumbers.join(', ');
    preview.classList.remove('hidden');
}

function showSortResult() {
    const result = document.getElementById('sort-result');
    const count = document.getElementById('sorted-count');
    const numbers = document.getElementById('sorted-numbers');

    count.innerText = '排序完成，共 ' + sortedResult.length + ' 个数字';
    numbers.innerText = sortedResult.join(', ');
    result.classList.remove('hidden');
}

function hideSortResult() {
    document.getElementById('sort-result').classList.add('hidden');
}

function hideOriginalPreview() {
    document.getElementById('original-preview').classList.add('hidden');
}

function showSortProgress() {
    document.getElementById('sort-progress').classList.remove('hidden');
    document.getElementById('sort-btn').disabled = true;
}

function hideSortProgress() {
    document.getElementById('sort-progress').classList.add('hidden');
    document.getElementById('sort-btn').disabled = !uploadedFile;
}

function showSortError(msg) {
    const err = document.getElementById('error-message');
    err.innerText = msg;
    err.classList.remove('hidden');
}

function hideSortError() {
    document.getElementById('error-message').classList.add('hidden');
}

function handleClear() {
    uploadedFile = null;
    sortedResult = null;
    extractedNumbers = [];
    originalFileName = '';

    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    document.getElementById('file-name').innerText = '';
    document.getElementById('sort-btn').disabled = true;

    hideSortError();
    hideSortResult();
    hideOriginalPreview();
}

function handleDownload() {
    if (!sortedResult) return;

    const ext = originalFileName ? ('.' + originalFileName.split('.').pop().toLowerCase()) : '.txt';
    const baseName = originalFileName ? originalFileName.replace(/\.[^.]+$/, '') : 'sorted';
    const downloadFileName = baseName + '_sorted' + ext;

    let content;
    if (ext === '.csv') {
        content = sortedResult.join(',');
    } else {
        content = sortedResult.join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    a.click();
    URL.revokeObjectURL(url);
}
