# Install dependencies
install:
	pip install --upgrade pip
	pip install -r requirements.txt

# Build and run Docker containers
docker-up:
	docker-compose up --build -d

# Stop Docker containers
docker-down:
	docker-compose down

# Restart Docker containers
docker-restart:
	docker-compose restart

# Seed the database
seed:
    docker-compose exec backend python treeckle/manage.py loaddata treeckle/treeckle/fixtures/seed_data.json

# Format code using black
format: 
	black .

# Run development server
runserver:
	python treeckle/manage.py runserver

# Create migrations
makemigrations:
	python treeckle/manage.py makemigrations

# Run migrations
migrate:
	python treeckle/manage.py migrate