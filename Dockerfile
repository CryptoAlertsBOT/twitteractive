FROM node:alpine3.14

RUN mkdir /home/cryptobot-twitter
WORKDIR /home/cryptobot-twitter
COPY . .

RUN apk upgrade && \
    apk update && \
    apk add npm

RUN npm install typescript@4.3.4 -g

CMD ["npm", "run", "start"]
