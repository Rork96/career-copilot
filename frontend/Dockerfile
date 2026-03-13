FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

# Don't copy everything, use volumes for hot reloading
# COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
