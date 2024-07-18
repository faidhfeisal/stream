# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the current directory contents into the container at /app
COPY . .

# Make port 8002 available to the world outside this container
EXPOSE 8002

# Define environment variable
ENV NAME Stream

# Run the app when the container launches
CMD ["node", "index.js"]
