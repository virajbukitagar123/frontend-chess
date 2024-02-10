FROM node:alpine AS development
RUN apk add g++ make py3-pip curl
ENV NODE_ENV development
WORKDIR /react-app
COPY ./package*.json /react-app
RUN npm install
COPY . .
CMD ["npm","start"]