# Multi-stage build for Angular app

# Stage 1: Build the app
FROM node:18-alpine as build

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY ../.ci/frontend/nginx/site.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]