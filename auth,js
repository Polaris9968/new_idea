/* --- 数据初始化 --- */
const ADMIN_CONF = { email: "111111@111.com", username: "111", password: "11111111" };
// 从本地存储读取用户，如果没有则初始包含管理员
let users = JSON.parse(localStorage.getItem('local_users')) || [ADMIN_CONF];

/* --- 界面切换逻辑 --- */
function toggleAuth(showRegister) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const title = document.getElementById('auth-title');

    if (showRegister) {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        title.innerText = "注册新账号";
    } else {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        title.innerText = "网站测试";
    }
}

/* --- 注册逻辑 --- */
function handleRegister() {
    // 1. 重置所有错误提示
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");

    const username = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const p1 = document.getElementById('reg-pwd1').value;
    const p2 = document.getElementById('reg-pwd2').value;
    
    let isValid = true;

    // 2. 校验逻辑
    if (!username) {
        document.getElementById('err-user').innerText = "用户名不能为空";
        isValid = false;
    } else if (users.some(u => u.username === username)) {
        document.getElementById('err-user').innerText = "该用户名已存在";
        isValid = false;
    }

    if (!email.includes('@')) {
        document.getElementById('err-email').innerText = "请输入正确邮箱格式";
        isValid = false;
    } else if (users.some(u => u.email === email)) {
        document.getElementById('err-email').innerText = "该邮箱已被注册";
        isValid = false;
    }

    if (p1.length < 8) {
        document.getElementById('err-pwd1').innerText = "密码不能小于8位";
        isValid = false;
    }

    if (p1 !== p2) {
        document.getElementById('err-pwd2').innerText = "两次输入的密码不同";
        isValid = false;
    }

    // 3. 保存数据
    if (isValid) {
        users.push({ username, email, password: p1 });
        localStorage.setItem('local_users', JSON.stringify(users));
        alert("注册成功！返回登录");
        toggleAuth(false);
    }
}

/* --- 登录逻辑 --- */
function handleLogin() {
    const id = document.getElementById('login-id').value.trim();
    const pwd = document.getElementById('login-pwd').value;
    const loginErr = document.getElementById('login-err');

    // 清除提示
    loginErr.innerText = "";

    const matchedUser = users.find(u => (u.email === id || u.username === id) && u.password === pwd);

    if (matchedUser) {
        // 调用 app.js 中的初始化函数
        initUserSession(matchedUser);
    } else {
        loginErr.innerText = "用户名/邮箱或密码错误";
    }
}