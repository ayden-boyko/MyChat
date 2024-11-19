# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy the package*.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Copy the environment file for Vite to access it
COPY ./.env ./.env 

# Checking for build existence
RUN ls -l dist
RUN ls -l dist/index.html

# Expose the port the web app will run on
EXPOSE 5173

# Run the command to start the web app when the container launches
CMD ["npm", "run", "dev"]

