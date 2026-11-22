FROM node:24-alpine AS build
WORKDIR /workspace
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY shared/package.json shared/
RUN npm ci
COPY backend ./backend
COPY shared ./shared
RUN npm run build --workspace backend

FROM node:24-alpine
WORKDIR /workspace
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY shared/package.json shared/
RUN npm ci --omit=dev --workspace backend --workspace shared --include-workspace-root=false \
    && apk del .build-deps
COPY --from=build /workspace/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json
COPY --from=build /workspace/shared ./shared
EXPOSE 8080
CMD ["node", "backend/dist/main.js"]
