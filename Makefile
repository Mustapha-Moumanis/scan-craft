# makefile to build and run the Docker containers
.PHONY: build up down

all: build up

build:
	docker-compose build

up:
	docker-compose up --build

down:
	docker-compose down