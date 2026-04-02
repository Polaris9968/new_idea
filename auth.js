/* --- 数据初始化 --- */
const ADMIN_CONF = { email: "111111@111.com", username: "111", password: "11111111" };
let users = JSON.parse(localStorage.getItem('local_users')) || [ADMIN_CONF];

/* --- 验证码系统 --- */
const captchas = {};

function generateCaptcha(length = 4) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function drawCaptcha(canvas, code) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 随机位置绘制字符
    for (let i = 0; i < code.length; i++) {
        const x = 15 + i * 18;
        const y = 15 + Math.random() * 10;
        ctx.fillText(code[i], x, y);
    }
    // 干扰线
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
}

function refreshCaptcha(type) {
    const canvas = document.getElementById(type + '-captcha-canvas');
    if (!canvas) return;
    const code = generateCaptcha(4);
    captchas[type] = code;
    drawCaptcha(canvas, code);
}

function validateCaptcha(type, input) {
    const code = captchas[type];
    if (!code) return false;
    return input.toLowerCase() === code.toLowerCase();
}

/* --- 界面切换逻辑 --- */
function toggleAuth(showRegister) {
    document.getElementById('login-form').classList.toggle('hidden', showRegister);
    document.getElementById('register-form').classList.toggle('hidden', !showRegister);
    document.getElementById('auth-title').innerText = showRegister ? "注册新账号" : "网站测试";
    document.getElementById('forgot-form').classList.add('hidden');
    refreshCaptcha(showRegister ? 'reg' : 'login');
}

function showForgotPassword() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.remove('hidden');
    document.getElementById('forgot-step1').classList.remove('hidden');
    document.getElementById('forgot-step2').classList.add('hidden');
    document.getElementById('auth-title').innerText = "忘记密码";
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    document.getElementById('auth-title').innerText = "网站测试";
}

/* --- 忘记密码 --- */
let resetEmail = '';

function sendResetCode() {
    const email = document.getElementById('forgot-email').value.trim();
    const errEl = document.getElementById('forgot-email-err');

    errEl.innerText = "";

    if (!email) {
        errEl.innerText = "请输入邮箱";
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        errEl.innerText = "该邮箱未注册";
        return;
    }

    // 生成6位验证码
    const code = generateCaptcha(6);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟后过期

    // 保存到localStorage（临时）
    localStorage.setItem('reset_code', JSON.stringify({ code, email, expiresAt }));

    // TODO: 替换为你的 EmailJS 密钥
    // emailjs.init("B1OgUNazK08MicUTZ");
    // emailjs.send("my_gmail_service", "template_kvawjm9", {
    //     to_email: email,
    //     code: code
    // });

    // 模拟发送成功（显示验证码）
    alert('验证码已发送至您的邮箱。\n\n演示模式：您的验证码是 ' + code + '\n（实际项目中邮件已发送）');

    document.getElementById('forgot-step1').classList.add('hidden');
    document.getElementById('forgot-step2').classList.remove('hidden');
    resetEmail = email;
}

function resetPassword() {
    const code = document.getElementById('forgot-code').value.trim();
    const pwd1 = document.getElementById('forgot-new-pwd1').value;
    const pwd2 = document.getElementById('forgot-new-pwd2').value;

    // 重置错误提示
    document.getElementById('forgot-code-err').innerText = "";
    document.getElementById('forgot-pwd1-err').innerText = "";
    document.getElementById('forgot-pwd2-err').innerText = "";

    // 验证验证码
    const stored = JSON.parse(localStorage.getItem('reset_code') || '{}');
    if (!stored.code || Date.now() > stored.expiresAt) {
        document.getElementById('forgot-code-err').innerText = "验证码已过期，请重新获取";
        return;
    }
    if (code !== stored.code) {
        document.getElementById('forgot-code-err').innerText = "验证码错误";
        return;
    }

    // 验证密码
    if (pwd1.length < 8) {
        document.getElementById('forgot-pwd1-err').innerText = "密码不能小于8位";
        return;
    }
    if (pwd1 !== pwd2) {
        document.getElementById('forgot-pwd2-err').innerText = "两次输入的密码不同";
        return;
    }

    // 更新密码
    const userIndex = users.findIndex(u => u.email === resetEmail);
    if (userIndex !== -1) {
        users[userIndex].password = pwd1;
        localStorage.setItem('local_users', JSON.stringify(users));
        localStorage.removeItem('reset_code');
        alert('密码重置成功！');
        showLogin();
    }
}

/* --- 注册逻辑 --- */
function handleRegister() {
    document.querySelectorAll('#register-form .error-msg').forEach(el => el.innerText = "");

    const username = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const p1 = document.getElementById('reg-pwd1').value;
    const p2 = document.getElementById('reg-pwd2').value;
    const captchaInput = document.getElementById('reg-captcha').value.trim();

    let isValid = true;

    // 验证码校验
    if (!validateCaptcha('reg', captchaInput)) {
        document.getElementById('reg-captcha-err').innerText = "验证码错误";
        refreshCaptcha('reg');
        isValid = false;
    }

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

    if (isValid) {
        users.push({ username, email, password: p1 });
        localStorage.setItem('local_users', JSON.stringify(users));
        alert("注册成功！返回登录");
        toggleAuth(false);
    }
}

/* --- 登录逻辑 --- */
function handleLogin() {
    const storedUsers = JSON.parse(localStorage.getItem('local_users'));
    if (storedUsers) {
        users = storedUsers;
    }

    const loginInput = document.getElementById('login-id');
    const pwdInput = document.getElementById('login-pwd');
    const loginErr = document.getElementById('login-err');
    const captchaErr = document.getElementById('login-captcha-err');

    const id = loginInput.value.trim();
    const pwd = pwdInput.value;
    const captchaInput = document.getElementById('login-captcha').value.trim();

    loginErr.innerText = "";
    captchaErr.innerText = "";

    if (!id || !pwd) {
        loginErr.innerText = "请输入账号和密码";
        return;
    }

    // 验证码校验
    if (!validateCaptcha('login', captchaInput)) {
        captchaErr.innerText = "验证码错误";
        refreshCaptcha('login');
        return;
    }

    const matchedUser = users.find(u => (u.email === id || u.username === id) && u.password === pwd);

    if (matchedUser) {
        console.log("登录成功:", matchedUser.username);
        if (typeof initUserSession === "function") {
            initUserSession(matchedUser);
        }
    } else {
        loginErr.innerText = "用户名/邮箱或密码错误";
        refreshCaptcha('login');
    }
}
