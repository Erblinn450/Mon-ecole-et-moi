# syntax=docker/dockerfile:1

FROM composer:2 AS vendor
WORKDIR /var/www
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts --optimize-autoloader
COPY . .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

FROM php:8.3-fpm AS app
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update \
    && apt-get install -y git unzip libzip-dev libicu-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql intl zip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=vendor /var/www /var/www
RUN mkdir -p /var/www/storage/logs \
    /var/www/storage/framework/cache/data \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/testing \
    /var/www/storage/framework/views \
    /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
CMD ["php-fpm"]

FROM nginx:1.27 AS web
COPY --from=app /var/www /var/www
COPY ./.docker/nginx/default.conf /etc/nginx/conf.d/default.conf
