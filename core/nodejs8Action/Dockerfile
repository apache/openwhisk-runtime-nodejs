FROM node:8.9.1
RUN apt-get update && apt-get install -y \
    imagemagick \
    unzip \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /nodejsAction
COPY . .
RUN npm install \
    && npm cache clean --force
EXPOSE 8080
CMD node --expose-gc app.js
