# Stage 1: Build da aplicação React
FROM node:20-alpine AS build

WORKDIR /app

# Copiar os arquivos de dependência
COPY package.json package-lock.json* ./

# Instalar as dependências
RUN npm install

# Copiar todo o código
COPY . .

# Buildar a aplicação para produção
RUN npm run build

# Stage 2: Servir com Nginx
FROM nginx:alpine

# Copiar a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos do build anterior para o diretório padrão do nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta 80 do Nginx
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
