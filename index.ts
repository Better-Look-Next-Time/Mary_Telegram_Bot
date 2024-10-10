import { Mary } from "@mary/core";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "bun";
import { WhiteLits } from "./whiteList"; 

import type { ModelNameType } from "@mary/core/src/models/openai/types";

const Bot =  new Telegraf(env.BotToken)

const  config = {
  thoughtsArray: ['mixtral-8x7b-instruct', 'llama-3.1-8b-instruct'] as ModelNameType[],
  chapter: 'gpt-4o-mini' as ModelNameType
}


Bot.on(message('text'), async (ctx) => {
   const  chatId = ctx.message.chat.id
  if (WhiteLits.some(( id ) => id === ctx.message.chat.id )) {
    console.log('id in whiteList')
    const  qwestion = ctx.message.text
    const mary = new Mary(config, qwestion, chatId.toString(), ctx.from.username ?? '', chatId.toString())
    const answer = await mary.Request()
    await ctx.telegram.sendMessage(chatId, answer)
  } else {
    console.log('id not whiteList')
    await ctx.telegram.sendMessage(chatId, 'Прости но я не могу тебе ответить')
  }
})

Bot.launch()
