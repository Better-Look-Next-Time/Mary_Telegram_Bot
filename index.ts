import type { MaryConfig } from '@mary/core'
import { existsSync, readFileSync } from 'node:fs'
import { Mary } from '@mary/core'
import { env } from 'bun'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { WhiteList } from './whiteList'

// reading Mary config and character
const config: MaryConfig = JSON.parse(readFileSync('./config.json', 'utf8'))
config.character = existsSync('./character.txt') ? readFileSync('./character.txt', 'utf8') : ''
const mary = new Mary(config)

// bot options
const names: string[] = ('NAME' in env) ? env.NAME.split(' ') : ['мари']

// tg bot
const Bot = new Telegraf(env.BOT_TOKEN)

const escapeMarkdown = (text: string) => text.replaceAll(/(['\\_*[\]()~><&#+\-=|{}.!])/g, '\\$1')

Bot.on(message('text'), async (ctx) => {
  const chatId: number = ctx.message.chat.id
  const isWhitelisted = WhiteList.includes(chatId)
  const isGroup = ctx.chat.type.includes('group')
  const question = ctx.message.text.toLowerCase()

  if (isGroup && !names.some(name => question.includes(name)))
    return

  if (!isWhitelisted)
    return await ctx.telegram.sendMessage(chatId, 'Прости но я не могу тебе ответить')

  const isDraw = question.includes('нарисуй')

  ctx.persistentChatAction(isDraw ? 'upload_photo' : 'typing', async () => {
    const answer = await (isDraw ? mary.ImageGenerator.bind(mary) : mary.Request.bind(mary))(ctx.message.text, chatId.toString(), ctx.from?.username ?? '', chatId.toString())
    await ctx.telegram.sendMessage(chatId, escapeMarkdown(answer), { parse_mode: 'MarkdownV2' })
  })
})

Bot.launch()
