FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon and ts-node globally
RUN npm install -g nodemon ts-node

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Start the application with nodemon and ts-node
CMD ["nodemon", "--watch", ".", "--ext", "ts", "--exec", "ts-node", "src/index.ts"]
