FROM node:21-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000