# Stage 1: Build the React app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"] 