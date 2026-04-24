FROM node:22-slim

WORKDIR /app

# Install pnpm via corepack (built into Node.js 22)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all files
COPY . .

# Install dependencies and build
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/api-server run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
