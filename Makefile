.PHONY: build up down restart logs clean rebuild status db-reset ssl-setup ssl-renew

all: build up

build:
	docker-compose build

up:
	docker-compose up --build

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

status:
	docker-compose ps

clean:
	docker-compose down -v

rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up

db-reset:
	docker-compose stop mongodb
	docker volume rm new-repo-scan-craft_mongodb_data || true
	docker-compose up -d mongodb

# SSL/Certificate commands
ssl-setup:
	./setup-ssl.sh

ssl-renew:
	docker-compose run --rm certbot renew
	docker-compose restart nginx

