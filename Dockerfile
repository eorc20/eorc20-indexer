FROM node:alpine

COPY package*.json ./
RUN npm ci
COPY . .

ENTRYPOINT ["npm", "start"]