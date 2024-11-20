import { Mary } from "@mary/core";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "bun";
import { WhiteList } from "./whiteList"; 
import { existsSync, readFileSync } from 'fs';
import type { MaryConfig } from "@mary/core";


// reading Mary config and character
let config: MaryConfig = JSON.parse(readFileSync('./config.json', 'utf8'))
config.character = existsSync('./character.txt') ? readFileSync('./character.txt', 'utf8') : "";
const mary = new Mary(config);

// bot options
const name: string = ("NAME" in env) ? env.NAME.split(" ") : ["мари"];

// tg bot
const Bot = new Telegraf(env.BOT_TOKEN);

const escapeMarkdown = (text: string) => text.replaceAll(/(['\\_\*\[\]\(\)~><&#+\-=|{}\.\!'])/g, "\\$1")
async function processAnswer(text: string) {
	text = escapeMarkdown(text);
	return text;
}

Bot.on(message('text'), async (ctx) => {
	const chatId = ctx.message.chat.id;
	const isWhitelisted = WhiteList.includes(chatId);
	const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
	const question = ctx.message.text.toLowerCase();
	
	if (!isWhitelisted && !isGroup) return await ctx.telegram.sendMessage(chatId, 'Прости но я не могу тебе ответить')
	
	if (!isGroup || name.some(n => question.includes(n))) {
		ctx.sendChatAction('typing');
		let typingTimeout;
		if (question.includes('нарисуй')) {
			typingTimeout = setInterval(() => ctx.sendChatAction('upload_photo'), 3500);
			const answer = await mary.ImageGenerator(ctx.message.text, chatId.toString(), ctx.from.username ?? '', chatId.toString());
			await ctx.telegram.sendMessage(chatId, await processAnswer(answer), { parse_mode: 'MarkdownV2' });
		} else {
			typingTimeout = setInterval(() => ctx.sendChatAction('typing'), 3500);
			const answer = await mary.Request(ctx.message.text, chatId.toString(), ctx.from.username ?? '', chatId.toString());
			await ctx.telegram.sendMessage(chatId, await processAnswer(answer), { parse_mode: 'MarkdownV2' });
		}
		clearInterval(typingTimeout);
	}
})

Bot.launch()
