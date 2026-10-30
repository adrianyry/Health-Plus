FROM node:20-alpine
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git

WORKDIR /opt/app
# Copiem pachetele din folderul curent (contextul fiind folderul strapi)
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 1337
ENV BROWSER=none
CMD ["npm", "run", "start"]
