FROM node:18 

WORKDIR /calcom

ARG NEXT_PUBLIC_LICENSE_CONSENT
ARG CALCOM_TELEMETRY_DISABLED
ARG DATABASE_URL
ARG NEXTAUTH_SECRET=secret
ARG CALENDSO_ENCRYPTION_KEY=secret
ARG MAX_OLD_SPACE_SIZE=4096
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_WEBAPP_URL

ENV NEXT_PUBLIC_WEBAPP_URL=${NEXT_PUBLIC_WEBAPP_URL} \
    NEXT_PUBLIC_LICENSE_CONSENT=$NEXT_PUBLIC_LICENSE_CONSENT \
    CALCOM_TELEMETRY_DISABLED=$CALCOM_TELEMETRY_DISABLED \
    DATABASE_URL=$DATABASE_URL \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
    CALENDSO_ENCRYPTION_KEY=${CALENDSO_ENCRYPTION_KEY} \
    NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE} \
    NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY} \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN} \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID} \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET} \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID} \
    NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID} \
    NODE_ENV=${NODE_ENV} 

COPY package.json yarn.lock .yarnrc.yml playwright.config.ts turbo.json git-init.sh git-setup.sh ./
COPY .yarn ./.yarn
COPY tests ./tests
COPY apps/web ./apps/web
COPY apps/api ./apps/api
COPY packages ./packages
COPY scripts ./scripts

RUN yarn config set httpTimeout 1200000 && \ 
    npx turbo prune --scope=@calcom/web --docker && \
    yarn install && \
    yarn db-deploy && \
    yarn --cwd packages/prisma seed-app-store

RUN yarn turbo run build --filter=@calcom/web && rm -rf node_modules/.cache .yarn/cache apps/web/.next/cache

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=30s --retries=5 \
    CMD wget --spider http://localhost:3000 || exit 1

RUN chmod +x /calcom/scripts/start.sh

CMD ["/calcom/scripts/start.sh"]