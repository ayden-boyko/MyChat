To run the app in a venv create one, install dependencies and type npm start, this will start the front and backends
#FOR STARTING DOCKER

To run the docker container:
navigate to root directory (Mychat) and write:
~ docker-compose down
~ docker compose up

OPTIONAL: after changes have been made
~ docker-compose down --build

for diagnostics:
~ docker-compose ps LISTS RUNNING CONTAINERS
~ docker-compose logs backend or frontend
