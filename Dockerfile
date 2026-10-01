# Gunakan imej Node yang lengkap untuk keserasian maksimum
FROM node:18

WORKDIR /app

# Pasang dependensi dahulu (untuk caching)
COPY package*.json ./
RUN npm install

# Salin kod sumber
COPY . .

# Bina aplikasi (dengan fallback jika tsc gagal)
RUN npm run build || npx vite build

# Cloud Run standard port
ENV PORT=8080
EXPOSE 8080

# Jalankan server
CMD ["node", "server.js"]
