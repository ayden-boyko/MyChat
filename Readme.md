# Full-Stack Chat Room Application

## Overview
My experience spans both front-end and back-end development. Notably, I built a full-stack chat room application using:
- **MongoDB**  
- **Node.js**  
- **Express**  
- **React**  
- **WebSockets** for real-time communication  

Additionally, I utilized **Docker** for both development and production environments, deploying the application on **Google Cloud Platform (GCP)** to enable scalability for both the front-end and back-end.

---

## Running the Application

### Using a Virtual Environment
1. Create a virtual environment (`venv`).
2. Install the necessary dependencies.
3. Start the application:
   ```bash
   npm start
   
---

## Using Docker
### Starting the Application
Navigate to the root directory (Mychat).
Run the following commands:
   ```bash
   docker-compose down
   docker-compose up

```

## Rebuilding the Containers (Optional)
If changes have been made to the application:
Stop the containers and rebuild them:
```bash
docker-compose down --build
```
# Diagnostics
To view running containers:
```bash
docker-compose ps
```
Viewing Logs
Backend logs:
```bash
docker-compose logs backend
```
Frontend logs:
```bash
docker-compose logs frontend
```
