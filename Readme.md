# Full-Stack Chat Room Application

## Project Description

This full-stack chat room application was developed using a combination of **MongoDB**, **Node.js**, **Express**, **React**, and **WebSockets** to create a dynamic, real-time communication experience. The app allows users to:

- Create accounts and log in securely.
- Send messages in real-time through WebSockets.
- Join multiple chat rooms or directly message other users.
- View message history.

The project was designed with scalability in mind. I utilized **Docker** to create a consistent development and production environment, ensuring smooth deployments and ease of scaling. The application was deployed on **Google Cloud Platform (GCP)** to handle traffic efficiently and ensure that both the front-end and back-end can scale as needed.

Additionally, Docker allowed for smooth management of dependencies, ensuring that the app runs the same in all environments, whether locally or in the cloud. This setup enhances the app's flexibility and enables easier updates and maintenance.

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
