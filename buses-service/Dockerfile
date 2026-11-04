FROM node:26-alpine as builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm install
FROM node:26-alpine as final
WORKDIR /app
COPY --from=builder /app .
RUN npm install --omit=dev
EXPOSE 3000 
CMD ["node", "server.js"]
