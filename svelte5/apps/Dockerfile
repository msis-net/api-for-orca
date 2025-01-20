FROM node:22-alpine

WORKDIR /apps

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Generate Prisma client
RUN npx prisma generate
#データベースの移行
RUN npx prisma migrate dev

# 環境変数を定義
ENV DATABASE_URL="file:./dev.db"

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0","--port","3000"]
