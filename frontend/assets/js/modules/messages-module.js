/**
 * Messages Module
 * 消息模块
 */

// 可选的创作领域分类 (与 i18n key 对应)
const MESSAGE_CATEGORIES = [
    { key: 'all', i18n: 'all' },
    { key: 'general', i18n: 'category_general' },
    { key: 'painting', i18n: 'category_painting' },
    { key: 'music', i18n: 'category_music' },
    { key: 'writing', i18n: 'category_writing' },
    { key: 'programming', i18n: 'category_programming' },
    { key: 'photography', i18n: 'category_photography' },
    { key: 'modeling', i18n: 'category_modeling' },
    { key: 'animation', i18n: 'category_animation' },
    { key: 'sound', i18n: 'category_sound' },
    { key: 'management', i18n: 'category_management' },
    { key: 'design', i18n: 'category_design' }
];

let currentMessageCategory = 'all';

function renderMessageDomainSelect() {
    const select = document.getElementById('messageDomainSelect');
    if (!select) return;
    select.innerHTML = '';
    MESSAGE_CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.key;
        opt.textContent = t(cat.i18n);
        opt.setAttribute('data-i18n', cat.i18n);
        if (cat.key === currentMessageCategory) opt.selected = true;
        select.appendChild(opt);
    });
    select.onchange = () => {
        currentMessageCategory = select.value;
        loadMessages(currentMessageCategory);
    };
}

function populateMessageCategorySelect() {
    const select = document.getElementById('messageCategory');
    if (!select) return;
    select.innerHTML = '';
    MESSAGE_CATEGORIES.filter(c => c.key !== 'all').forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.key;
        opt.textContent = t(cat.i18n);
        if (cat.key === 'general') opt.selected = true;
        select.appendChild(opt);
    });
}

function setupMessageCategories() {
    renderMessageDomainSelect();
    populateMessageCategorySelect();
}

/**
 * 加载消息列表
 */
async function loadMessages(category = 'all') {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = `<div class="loading">${t('loadingMessages')}</div>`;
    
    try {
        const url = new URL('../backend/api/api.php', window.location.origin);
        url.searchParams.set('action', 'get_public_messages');
        if (category && category !== 'all') {
            url.searchParams.set('category', category);
        }
        const res = await fetch(url.toString());
        const data = await res.json();
        
        if (data.code === 200 && data.messages) {
            if (data.messages.length === 0) {
                messagesList.innerHTML = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
                return;
            }
            
            const user = getCurrentUser();
            let html = '';
            data.messages.forEach(msg => {
                html += `
                    <div class="activity-card">
                        <div class="activity-header" style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span class="activity-author">${escapeHtml(msg.author || 'Anonymous')}</span>
                                <span class="activity-time" style="margin-left:12px;">${new Date(msg.createdAt).toLocaleString()}</span>
                                ${msg.category ? `<span class="activity-tag" style="margin-left:12px;padding:2px 6px;background:#eef;border-radius:4px;font-size:0.7rem;color:#556;">${escapeHtml(t('category_' + msg.category) || msg.category)}</span>` : ''}
                            </div>
                            ${(msg.author_id === user.id || user.is_admin == 1) ? `<button class="btn btn-secondary btn-small" onclick="deleteMessage(${msg.id})" style="padding:4px 8px;font-size:0.8rem;">× Delete</button>` : ''}
                        </div>
                        <div class="activity-content">${escapeHtml(msg.content)}</div>
                    </div>
                `;
            });
            messagesList.innerHTML = html;
        } else {
            messagesList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        messagesList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 打开消息弹窗
 */
function openMessageModal() {
    document.getElementById('messageModal').classList.add('show');
    populateMessageCategorySelect();
}

/**
 * 关闭消息弹窗
 */
function closeMessageModal() {
    document.getElementById('messageModal').classList.remove('show');
    document.getElementById('messageContent').value = '';
}

/**
 * 提交消息
 */
async function submitMessage() {
    const content = document.getElementById('messageContent').value.trim();
    const categorySelect = document.getElementById('messageCategory');
    const category = categorySelect ? categorySelect.value : 'general';
    
    if (!content) {
        alert('Please enter message content');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=add_public_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content, category })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            closeMessageModal();
            loadMessages(currentMessageCategory);
            alert(t('success'));
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 删除消息
 */
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        const user = getCurrentUser();
        const res = await fetch('../backend/api/api.php?action=delete_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message_id: messageId,
                is_admin: user.is_admin == 1 
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            loadMessages(currentMessageCategory);
            alert('Message deleted');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

// 初始化分类与加载
document.addEventListener('DOMContentLoaded', () => {
    setupMessageCategories();
    loadMessages(currentMessageCategory);
});
