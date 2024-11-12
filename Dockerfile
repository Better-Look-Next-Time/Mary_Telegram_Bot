FROM oven/bun

COPY . .

RUN bun install

ENV NODE_ENV production
CMD ["bun", "index.ts"]