# Installation

## Prerequisites

<ol>
    <li><a href="https://nodejs.org/en">Node LTS</a></li>
    <li><a href="https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/">Mysql server</a></li>
    <li><a href="https://www.nginx.com/resources/wiki/start/topics/tutorials/install/">Nginx</a></li>
</ol>

## Installing

<ol>
    <li>Download from <a href="https://github.com/Egglord-Discord-Bot/API-server">here</a></li>
    <li>Run these commands:</li>
    <ol>
        <li>`npm install --global pm2`</li>
        <li>`pm2 startup`</li>
    </ol>
</ol>

## Backend

### Filling the .env file
```
DATABASE_URL -> Is the URL of the Mysql table
port -> The port at which the backend will run on
sessionSecret -> For encypting sessions
fortniteAPI -> DOES NOT WORK CURRENTLY
R6Email -> ubisoft login email (Does not require any setting up on their end)
R6Password ->  ubisoft login email
steam -> Access it from here https://steamcommunity.com/dev/apikey
twitchId -> Access it from here https://dev.twitch.tv/console
twitchSecret -> Some from above
twitterBearerToken -> DOES NOT WORK CURRENTLY
debug=false -> IF you want more logs in console or not
```

### Running the backend

Run these commands
 <ol>
    <li>`npm install`</li>
    <li>`npx prisma migrate dev --name init`</li>
    <li>`npx prisma generate`</li>
    <li>`pm2 start "npm run start" -- name "API-backend"` *</li>
</ol>

\* - This allows you to run the backend in the background

## Frontend

### Filling the .env file
```
NEXTAUTH_URL -> The URL your users will connect to
NEXTAUTH_SECRET -> For encyption the session (Must be same as backend)
BACKEND_URL -> The URL of the backend server (Only change if neccessary)
discordId -> Discord ID of a bot
discordSecret -> Discord secret found on discord developer > Oauth2

```

### Running the frontend
Go to front folder, first fill in .env file and then run these commands
 <ol>
    <li>`npm install`</li>
    <li>`pm2 start "npm run dev" -- name "API-frontend"`</li>
</ol>

## Setting up domain support

### Nginx

Head to `/etc/nginx` and in `sites-enabled` create this file:
```
server {
        listen 80;
        server_name DOMAIN;
        return 301 https://$host$request_uri/;
}

server {
        listen 443 ssl;
        server_name DOMAIN;
        ssl_certificate PATH/client-cert.pem;
        ssl_certificate_key PATH/client-key.pem;

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
        location /  {
                proxy_pass    http://localhost:4500/;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```
Replace DOMAIN with the domain you have chosen (example api.egglord.dev)                                
