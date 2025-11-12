/**
 * Messages Module
 * 消息模块
 */

/**
 * 加载消息列表
 */
async function loadMessages() {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = `<div class="loading">${t('loadingMessages')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_public_messages');
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
                            </div>
                            ${msg.author_id === user.id ? `<button class="btn btn-secondary btn-small" onclick="deleteMessage(${msg.id})" style="padding:4px 8px;font-size:0.8rem;">× Delete</button>` : ''}
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
    
    if (!content) {
        alert('Please enter message content');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=add_public_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            closeMessageModal();
            loadMessages();
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
        const res = await fetch('../backend/api/api.php?action=delete_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_id: messageId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            loadMessages();
            alert('Message deleted');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}
