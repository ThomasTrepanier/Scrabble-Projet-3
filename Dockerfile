FROM node:14.15 as server-dev
WORKDIR /var/www/app
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV development
CMD ["npm", "start"]

FROM node:14.15 as server-builder
WORKDIR /app
COPY packages/server/package*.json ./
RUN npm ci --silent
COPY packages/common /common
COPY packages/server .
RUN npm run build

FROM node:14.15-alpine as server-prod
WORKDIR /usr/src/app
RUN chown node:node ./
USER node
COPY packages/server/package*.json ./
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production
RUN npm ci --production && npm cache clean --force
COPY packages/server/migrations/ migrations/
COPY --from=server-builder /app/out out
COPY packages/server/assets out/app/assets
COPY packages/server/public out/app/public
CMD ["node", "out/app/app/index.js"]

FROM node:14.15 as client-dev
WORKDIR /var/www/app
EXPOSE 4200
ENV PORT 4200
ENV NODE_ENV development
CMD ["npm", "run", "docker:dev"]

FROM node:14.15 as client-builder
WORKDIR /app
COPY packages/client/package*.json ./
RUN npm ci --silent
COPY packages/common /common
COPY packages/client .
RUN npm run build

FROM nginx:stable-alpine as client-prod
COPY packages/client/nginx.conf /etc/nginx/nginx.conf
COPY --from=client-builder /app/dist/client /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]