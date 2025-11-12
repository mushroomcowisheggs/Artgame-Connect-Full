/**
 * Helper Functions Module
 * 工具函数模块
 */

/**
 * HTML 转义函数
 */
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * 初始化轮播图
 */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    if (slides.length === 0) return;

    let index = 0;
    const update = () => {
        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;
    };

    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            index = (index - 1 + slides.length) % slides.length;
            update();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            index = (index + 1) % slides.length;
            update();
        });
    }

    // 响应式更新
    window.addEventListener('resize', update);
    update();
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * 格式化预算
 */
function formatBudget(budget) {
    if (!budget) return t('negotiable');
    if (typeof budget === 'number') return '$' + budget.toFixed(2);
    return budget;
}

/**
 * 解析技能标签
 */
function parseSkills(skillsString) {
    if (!skillsString) return [];
    return skillsString.split(',').map(s => s.trim()).filter(s => s);
}

/**
 * 显示加载状态
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="loading">${t('loading')}</div>`;
    }
}

/**
 * 显示错误信息
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<p style="color:#e74c3c;">${message || t('error')}</p>`;
    }
}

/**
 * 显示空数据提示
 */
function showNoData(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
    }
}
