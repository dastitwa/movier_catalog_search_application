FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY docker/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]