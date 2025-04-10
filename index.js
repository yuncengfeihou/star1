// Star1插件 - 从当前聊天中提取特定消息并创建新聊天
import { renderExtensionTemplateAsync } from '../../../extensions.js';
import { getContext } from '../../../extensions.js';
import { doNewChat, is_send_press, isChatSaving } from "../../../../script.js";
import { this_chid } from "../../../../script.js";
import { selected_group } from "../../../group-chats.js";
import { is_group_generating } from "../../../group-chats.js";

// 插件名称
const PLUGIN_NAME = 'star1';

/**
 * 从原聊天中提取特定消息并创建填充新聊天
 */
async function handleFillButtonClick() {
    console.log(`[${PLUGIN_NAME}] 填充按钮被点击`);
    
    try {
        // 检查是否有角色或群组被选中
        if (selected_group === null && this_chid === undefined) {
            console.error(`[${PLUGIN_NAME}] 错误: 没有选择角色或群组`);
            toastr.error('请先选择一个角色或群组');
            return;
        }

        // 检查是否正在生成或保存，避免冲突
        if (is_send_press || is_group_generating) {
            console.error(`[${PLUGIN_NAME}] 错误: 正在生成回复，无法创建新聊天`);
            toastr.warning('正在生成回复，请稍后再试');
            return;
        }
        if (isChatSaving) {
            console.error(`[${PLUGIN_NAME}] 错误: 聊天正在保存，无法创建新聊天`);
            toastr.warning('聊天正在保存，请稍后再试');
            return;
        }

        // 获取当前上下文和聊天消息
        const context = getContext();
        const originalChat = [...context.chat]; // 复制当前聊天数组
        
        console.log(`[${PLUGIN_NAME}] 当前聊天总消息数: ${originalChat.length}`);
        
        // 定义要提取的消息ID
        const messagesToCopy = [0,2, 3]; // 根据需求指定为0, 2, 3
        
        // 检查这些消息是否存在并记录
        const validMessages = [];
        for (const mesId of messagesToCopy) {
            if (mesId < originalChat.length) {
                validMessages.push(originalChat[mesId]);
                console.log(`[${PLUGIN_NAME}] 已找到消息 ID ${mesId}: ${originalChat[mesId].mes.substring(0, 30)}...`);
            } else {
                console.warn(`[${PLUGIN_NAME}] 警告: 消息 ID ${mesId} 不存在，原聊天只有 ${originalChat.length} 条消息`);
            }
        }
        
        console.log(`[${PLUGIN_NAME}] 找到 ${validMessages.length} 条有效消息可以复制`);
        
        // 创建新聊天并切换到新聊天
        console.log(`[${PLUGIN_NAME}] 正在创建新聊天...`);
        await doNewChat({ deleteCurrentChat: false });
        console.log(`[${PLUGIN_NAME}] 新聊天已创建，准备填充消息`);
        
        // 延迟一下确保新聊天加载完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 将提取的消息添加到新聊天
        console.log(`[${PLUGIN_NAME}] 开始填充消息到新聊天`);
        for (const message of validMessages) {
            try {
                console.log(`[${PLUGIN_NAME}] 正在添加消息: ${message.mes.substring(0, 30)}...`);
                await context.addOneMessage(message, { scroll: true });
                console.log(`[${PLUGIN_NAME}] 消息添加成功`);
            } catch (error) {
                console.error(`[${PLUGIN_NAME}] 添加消息时出错:`, error);
            }
        }
        
        // 保存新聊天
        console.log(`[${PLUGIN_NAME}] 正在保存新聊天...`);
        await context.saveChat();
        console.log(`[${PLUGIN_NAME}] 新聊天已保存`);
        
        // 显示成功消息
        toastr.success(`已创建新聊天并填充了 ${validMessages.length} 条消息`);
        
    } catch (error) {
        console.error(`[${PLUGIN_NAME}] 执行过程中发生错误:`, error);
        toastr.error('创建新聊天或填充消息时出错，请查看控制台');
    }
}

// 初始化插件
jQuery(async () => {
    console.log(`[${PLUGIN_NAME}] 插件正在初始化...`);
    
    try {
        // 注入插件界面到扩展设置页面
        const settingsHtml = await renderExtensionTemplateAsync(`third-party/${PLUGIN_NAME}`, 'settings_display');
        $('#extensions_settings').append(settingsHtml);
        console.log(`[${PLUGIN_NAME}] 已添加设置界面到扩展页面`);
        
        // 为填充按钮添加点击事件监听
        $('#star1_fill_button').on('click', async function() {
            console.log(`[${PLUGIN_NAME}] 点击了填充按钮`);
            await handleFillButtonClick();
        });
        console.log(`[${PLUGIN_NAME}] 已为填充按钮绑定事件`);
        
        console.log(`[${PLUGIN_NAME}] 插件初始化完成!`);
    } catch (error) {
        console.error(`[${PLUGIN_NAME}] 初始化时出错:`, error);
    }
});
