# betmundial-web — multi-stage CRA → nginx
# Build live:    docker build --build-arg APP_ENV=live -t ghcr.io/betmundial-ke/web-live:local .
# Build staging: docker build --build-arg APP_ENV=staging -t ghcr.io/betmundial-ke/web-staging:local .

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
COPY scripts ./scripts
# package-lock.json is gitignored in this repo
RUN npm install --legacy-peer-deps

COPY . .

# Declare after npm install so live↔staging rebuilds keep the install layer cached
ARG APP_ENV=live
# Optional secret-like client key; pass at build: --build-arg REACT_APP_OTCMEKI=...
ARG REACT_APP_OTCMEKI=

# Merge docker env + optional OTCMEKI into .env for CRA (do not cat .env — leaks secrets in build logs)
RUN if [ "$APP_ENV" = "staging" ]; then cp docker/env.staging .env; else cp docker/env.live .env; fi \
 && if [ -n "$REACT_APP_OTCMEKI" ]; then echo "REACT_APP_OTCMEKI=$REACT_APP_OTCMEKI" >> .env; fi

ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build:docker

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
