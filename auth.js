/* --- 数据初始化 --- */
const ADMIN_CONF = { email: "111111@111.com", username: "111", password: "11111111" };
let users = JSON.parse(localStorage.getItem('local_users')) || [ADMIN_CONF];

/* --- EmailJS 初始化 --- */
emailjs.init("B1OgUNazK08MicUTZ");

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
    // 重置登录模式为密码登录
    if (!showRegister) {
        toggleLoginMode('pwd');
    }
}

function showForgotPassword() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.remove('hidden');
    document.getElementById('auth-title').innerText = "忘记密码";
    // 重置表单状态
    document.getElementById('forgot-email').value = '';
    document.getElementById('forgot-email').disabled = false;
    document.getElementById('send-code-btn').disabled = false;
    document.getElementById('send-code-btn').innerText = '发送验证码';
    document.getElementById('forgot-code').value = '';
    document.getElementById('forgot-new-pwd1').value = '';
    document.getElementById('forgot-new-pwd2').value = '';
    document.querySelectorAll('#forgot-form .error-msg').forEach(el => el.innerText = '');
    // 重置登录模式为密码登录
    toggleLoginMode('pwd');
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    document.getElementById('auth-title').innerText = "网站测试";
    // 重置登录模式为密码登录
    toggleLoginMode('pwd');
}

/* --- 登录模式切换 --- */
function toggleLoginMode(mode) {
    const pwdBtn = document.getElementById('pwd-login-btn');
    const codeBtn = document.getElementById('code-login-btn');
    const pwdSection = document.getElementById('pwd-login-section');
    const codeSection = document.getElementById('code-login-section');
    const captchaSection = document.getElementById('login-captcha-section');

    if (mode === 'pwd') {
        // 密码登录按钮激活（蓝色）
        pwdBtn.classList.remove('bg-gray-200', 'text-gray-700', 'dark:bg-gray-600', 'dark:text-gray-200');
        pwdBtn.classList.add('bg-primary', 'text-white');
        // 验证码登录按钮未激活（灰色）
        codeBtn.classList.remove('bg-primary', 'text-white');
        codeBtn.classList.add('bg-gray-200', 'text-gray-700', 'dark:bg-gray-600', 'dark:text-gray-200');
        // 显示/隐藏对应区域
        pwdSection.classList.remove('hidden');
        codeSection.classList.add('hidden');
        captchaSection.classList.remove('hidden');
        // 修改登录按钮
        document.getElementById('login-btn').innerText = '登录';
        document.getElementById('login-btn').setAttribute('onclick', 'handleLogin()');
    } else {
        // 验证码登录按钮激活（蓝色）
        codeBtn.classList.remove('bg-gray-200', 'text-gray-700', 'dark:bg-gray-600', 'dark:text-gray-200');
        codeBtn.classList.add('bg-primary', 'text-white');
        // 密码登录按钮未激活（灰色）
        pwdBtn.classList.remove('bg-primary', 'text-white');
        pwdBtn.classList.add('bg-gray-200', 'text-gray-700', 'dark:bg-gray-600', 'dark:text-gray-200');
        // 显示/隐藏对应区域
        pwdSection.classList.add('hidden');
        codeSection.classList.remove('hidden');
        captchaSection.classList.add('hidden');
        // 修改登录按钮
        document.getElementById('login-btn').innerText = '验证码登录';
        document.getElementById('login-btn').setAttribute('onclick', 'handleCodeLogin()');
    }
    // 清空输入和错误提示
    clearLoginInputs();
}

function clearLoginInputs() {
    document.getElementById('login-id').value = '';
    document.getElementById('login-pwd').value = '';
    document.getElementById('login-captcha').value = '';
    document.getElementById('code-login-email').value = '';
    document.getElementById('code-login-email').disabled = false;
    document.getElementById('code-login-code').value = '';
    // 重置发送验证码按钮
    const sendBtn = document.getElementById('send-login-code-btn');
    sendBtn.disabled = false;
    sendBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
    sendBtn.classList.add('bg-primary', 'hover:bg-blue-600');
    sendBtn.innerText = '发送验证码';
    document.querySelectorAll('#login-form .error-msg').forEach(el => el.innerText = '');
}

/* --- 验证码登录 --- */
let loginCodeEmail = '';

function sendLoginCode() {
    const email = document.getElementById('code-login-email').value.trim();
    const errEl = document.getElementById('code-login-email-err');

    errEl.innerText = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errEl.innerText = "请输入正确的邮箱格式";
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        errEl.innerText = "该邮箱未注册";
        return;
    }

    // 生成6位验证码
    const code = generateCaptcha(6);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    localStorage.setItem('login_code', JSON.stringify({ code, email, expiresAt }));

    // 禁用按钮并变为灰色
    const sendBtn = document.getElementById('send-login-code-btn');
    sendBtn.disabled = true;
    sendBtn.classList.remove('bg-primary', 'hover:bg-blue-600');
    sendBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
    sendBtn.innerText = '验证码已发送';

    // 发送邮件
    emailjs.send("my_gmail_service", "template_kvawjm9", {
        to_email: email,
        code: code,
        time: "15分钟"
    }).then(function() {
        document.getElementById('code-login-email').disabled = true;
        loginCodeEmail = email;
        alert('验证码已发送至您的邮箱。');
    }).catch(function(error) {
        const sendBtn = document.getElementById('send-login-code-btn');
        sendBtn.disabled = false;
        sendBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
        sendBtn.classList.add('bg-primary', 'hover:bg-blue-600');
        sendBtn.innerText = '发送验证码';
        alert('邮件发送失败，请稍后重试。');
        console.error('EmailJS 错误:', error);
    });
}

function handleCodeLogin() {
    const code = document.getElementById('code-login-code').value.trim();
    const codeErr = document.getElementById('code-login-code-err');

    codeErr.innerText = "";

    // 验证验证码
    const stored = JSON.parse(localStorage.getItem('login_code') || '{}');
    if (!stored.code || Date.now() > stored.expiresAt) {
        codeErr.innerText = "验证码已过期，请重新获取";
        return;
    }
    if (code !== stored.code) {
        codeErr.innerText = "验证码错误";
        return;
    }

    // 查找用户并登录
    const user = users.find(u => u.email === loginCodeEmail);
    if (user) {
        localStorage.removeItem('login_code');
        console.log("验证码登录成功:", user.username);
        if (typeof initUserSession === "function") {
            initUserSession(user);
        }
    }
}

/* --- 忘记密码 --- */
let resetEmail = '';

function sendResetCode() {
    const email = document.getElementById('forgot-email').value.trim();
    const errEl = document.getElementById('forgot-email-err');

    errEl.innerText = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errEl.innerText = "请输入邮箱";
        return;
    }
    if (!emailRegex.test(email)) {
        errEl.innerText = "请输入正确的邮箱格式";
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

    // 禁用按钮防止重复点击
    document.getElementById('send-code-btn').disabled = true;

    // 发送邮件
    emailjs.send("my_gmail_service", "template_kvawjm9", {
        to_email: email,
        code: code,
        time: "15分钟"
    }).then(function(response) {
        document.getElementById('forgot-email').disabled = true;
        document.getElementById('send-code-btn').innerText = '验证码已发送';
        alert('验证码已发送至您的邮箱。');
        resetEmail = email;
    }).catch(function(error) {
        document.getElementById('send-code-btn').disabled = false;
        alert('邮件发送失败，请稍后重试。\n错误信息：' + JSON.stringify(error));
        console.error('EmailJS 错误:', error);
    });
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
        // 清空所有输入框
        document.getElementById('forgot-email').value = '';
        document.getElementById('forgot-email').disabled = false;
        document.getElementById('send-code-btn').disabled = false;
        document.getElementById('send-code-btn').innerText = '发送验证码';
        document.getElementById('forgot-code').value = '';
        document.getElementById('forgot-new-pwd1').value = '';
        document.getElementById('forgot-new-pwd2').value = '';
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('err-email').innerText = "请输入正确的邮箱格式";
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
