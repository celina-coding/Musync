FROM node:22-alpine3.20

# The directory where all the files which are related to my container will be placed
WORKDIR /app 

#copy the package.json inside the app directory
COPY package.json package-lock.json ./

RUN npm install 

#Copy the rest of files into the working directory
COPY . .

#Build the nest js app 
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]