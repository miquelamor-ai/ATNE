FROM php:8.2-cli

WORKDIR /app

# Install zip extension for Composer
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install dependencies
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader

# Copy app
COPY . .

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public", "public/index.php"]
