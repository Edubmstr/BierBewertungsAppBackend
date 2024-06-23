FROM node:20

ENV PORT=4050
ENV DATABASE_URL='mysql://testuser:test123!@85.215.236.72:3306/beerapp'
ENV JWT_SECRET_KEY='jfew53#2k3r#+ß("§&26q17)")'
ENV JWT_REFRESH_SECRET_KEY='f80dab008eeacb1efe94072489d56d5a'
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install 
COPY . .
RUN npx prisma generate
CMD ["npm", "start"]
