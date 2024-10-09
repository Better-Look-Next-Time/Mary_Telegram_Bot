import { mary } from "@mary/core";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "bun";
import { WhiteLits } from "./whiteList"; 

const Bot =  new Telegraf(env.BotToken)

Bot.on(message('text'), async (ctx) => {
   const  chatId = ctx.message.chat.id
  if (WhiteLits.some(( id ) => id === ctx.message.chat.id )) {
    console.log('id in whiteList')
    const  qwestion = ctx.message.text
    const answer = await mary(qwestion, chatId.toString(), ctx.from.username ?? '', chatId.toString())
    await ctx.telegram.sendMessage(chatId, answer)
  } else {
    console.log('id not whiteList')
    await ctx.telegram.sendMessage(chatId, 'Прости но я не могу тебе ответить')
  }
})

Bot.launch()
