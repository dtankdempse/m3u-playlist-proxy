# Use the official Node.js 18 image as a base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files (if any)
COPY package*.json ./

# Install any dependencies (if there are any, otherwise this step is skipped)
RUN npm install --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the server listens on
EXPOSE 4123

# Command to run the application
CMD ["node", "index.js"]