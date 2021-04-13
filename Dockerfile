# Dockerfile


FROM arm64v8/node:12.18.3

# ARG APORT=3000
# ARG ADB_PORT=5432
# ARG ADB_PASSWORD=

# ENV PORT=$APORT
# ENV DB_PORT=$ADB_PORT
# ENV DB_PASSWORD=$ADB_PASSWORD

RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN adduser --disabled-password app
COPY civbot/ .
RUN chown -R app:app /opt/app
USER app
RUN npm install
EXPOSE 3000
CMD [ "npm", "run", "pm2" ]