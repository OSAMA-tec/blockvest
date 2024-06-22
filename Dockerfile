# Use the official Node.js 14 image as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build your app
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
