FROM node:latest

COPY package*.json ./
RUN npm ci
COPY . .

ENTRYPOINT ["npm", "start"]