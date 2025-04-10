// public/extensions/third-party/copy-messages-plugin/index.js
import { 
    doNewChat,          // 创建新聊天
    addOneMessage,      // 添加消息到聊天
    chat,               // 当前聊天消息数组
    this_chid,          // 当前角色ID
    selected_group      // 当前群组ID
} from '../../../../script.js';

import {
    getContext // <--- 从这里导入
    // 如果还需要 extension_settings 或 renderExtensionTemplateAsync，也放在这里
} from '../../../extensions.js';

import { renderExtensionTemplateAsync } from '../../../extensions.js';

jQuery(async () => {
    const pluginName = 'star1';
    console.log(`加载插件: ${pluginName}`);

    // 设置界面的 HTML
    const settingsHtml = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>复制消息插件</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="padding:10px;">
                <p>点击按钮以创建新聊天并复制特定消息</p>
                <button id="copy_messages_button" class="menu_button">创建并复制消息</button>
            </div>
        </div>`;
    
    // 注入到扩展设置区域
    $('#extensions_settings').append(settingsHtml);

    // 按钮点击事件
    $('#copy_messages_button').on('click', async () => {
        try {
            // 检查是否有角色或群组选中
            if (!this_chid && !selected_group) {
                alert('请先选择一个角色或群组！');
                return;
            }

            // 获取当前上下文和原始聊天
            const context = getContext();
            const originalChat = [...chat]; // 复制原始聊天数组以保留数据

            // 创建新聊天并切换
            await doNewChat({ deleteCurrentChat: false });
            console.log('新聊天已创建并切换');

            // 示例：选择特定消息（这里假设复制最后一条用户消息）
            const specificMessage = originalChat.find(msg => msg.is_user === true);
            if (!specificMessage) {
                console.log('未找到符合条件的消息');
                alert('未找到用户消息可复制！');
                return;
            }

            // 将特定消息添加到新聊天
            await addOneMessage(specificMessage, { scroll: false });
            console.log('特定消息已填充到新聊天');

            // 提示成功
            alert('新聊天已创建并复制了特定消息！');
        } catch (error) {
            console.error('操作失败:', error);
            alert('创建新聊天或复制消息时出错！');
        }
    });

    console.log(`插件 ${pluginName} 初始化完成`);
});
