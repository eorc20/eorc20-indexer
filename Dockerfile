FROM node:alpine

EXPOSE 8080

COPY package*.json ./
RUN npm ci
COPY . .

ENTRYPOINT ["npm", "start"]