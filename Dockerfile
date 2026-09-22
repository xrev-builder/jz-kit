# The image tag and the playwright version in package.json MUST be identical.
# Resolved 2026-09-22: npm latest playwright 1.63.0, image mcr.microsoft.com/playwright:v1.63.0-noble.
FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /data && chown -R pwuser:pwuser /data /app
USER pwuser
ENV FI_DATA_DIR=/data FI_PORT=3011 NODE_OPTIONS=--max-old-space-size=1024
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3011/api/v1/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "server.js"]
