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

/* --- 登录逻辑 (auth.js) --- */
function handleLogin() {
    // 关键点：登录前重新从本地存储同步一次数据，防止拿不到刚注册的用户
    const storedUsers = JSON.parse(localStorage.getItem('local_users'));
    if (storedUsers) {
        users = storedUsers;
    }

    const loginInput = document.getElementById('login-id');
    const pwdInput = document.getElementById('login-pwd');
    const loginErr = document.getElementById('login-err');

    const id = loginInput.value.trim();
    const pwd = pwdInput.value;

    // 重置提示状态
    loginErr.innerText = "";

    if (!id || !pwd) {
        loginErr.innerText = "请输入账号和密码";
        return;
    }

    // 查找匹配用户 (支持邮箱或用户名登录)
    const matchedUser = users.find(u => (u.email === id || u.username === id) && u.password === pwd);

    if (matchedUser) {
        console.log("登录成功:", matchedUser.username);
        // 调用 app.js 中的进入系统函数
        if (typeof initUserSession === "function") {
            initUserSession(matchedUser);
        } else {
            console.error("未找到 initUserSession 函数，请检查 app.js 是否加载");
        }
    } else {
        loginErr.innerText = "用户名/邮箱或密码错误";
        // 抖动效果提示（可选）
        loginErr.style.color = "red";
    }
}