// 切换登录/注册界面
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
}

// 初始化标签页事件
document.getElementById('loginTab').addEventListener('click', function(e) {
    e.preventDefault();
    showLogin();
});

document.getElementById('registerTab').addEventListener('click', function(e) {
    e.preventDefault();
    showRegister();
});

// 登录表单处理
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert(getTranslation('fillInAllFields'));
        return;
    }
    
    try {
        const response = await fetch('../backend/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
            // 登录成功，跳转到主页
            window.location.href = 'index.html';
        } else {
            showError('loginError', data.message);
        }
    } catch (error) {
        showError('loginError', getTranslation('error') + ': ' + error.message);
    }
});

// 注册表单处理
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    
    if (!username || !email || !password) {
        showError('registerError', getTranslation('fillInAllFields'));
        return;
    }
    
    if (password.length < 6) {
        showError('registerError', getTranslation('atLeast6Characters'));
        return;
    }
    
    try {
        const response = await fetch('../backend/api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
            showSuccess('registerSuccess', getTranslation('signUp') + ' ' + getTranslation('projectCreatedSuccessfully') + '. ' + getTranslation('signIn'));
            setTimeout(() => {
                showLogin();
                document.getElementById('login-email').value = email;
            }, 1500);
        } else {
            showError('registerError', data.message);
        }
    } catch (error) {
        showError('registerError', getTranslation('error') + ': ' + error.message);
    }
});
