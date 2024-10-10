import { Mary } from "@mary/core";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "bun";
import { WhiteLits } from "./whiteList"; 

import type { MaryConfig } from "@mary/core";

const Bot =  new Telegraf(env.BotToken)

const  config :MaryConfig = {
  thoughtsArray: ['mixtral-8x7b-instruct', 'llama-3.1-8b-instruct'],
  chapter: 'gpt-4o-mini',
  creatorImagePrompt: 'llama-3.1-8b-instruct'
}


Bot.on(message('text'), async (ctx) => {
   const  chatId = ctx.message.chat.id
   if (WhiteLits.some(( id ) => id === ctx.message.chat.id )) {
    console.log('id in whiteList')
    const  question = ctx.message.text.toLowerCase()
    const mary = new Mary(config, question, chatId.toString(), ctx.from.username ?? '', chatId.toString())
    if (question.includes('нарисуй')) {
      console.log('рисую изображение')
      const  answer = await mary.ImageGenerator()
      await ctx.telegram.sendMessage(chatId, answer)
    } else {
      const answer = await mary.Request()
      await ctx.telegram.sendMessage(chatId, answer)
    }
  } else {
    console.log('id not whiteList')
    await ctx.telegram.sendMessage(chatId, 'Прости но я не могу тебе ответить')
  }
})

Bot.launch()
