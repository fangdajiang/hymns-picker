FROM nginx

MAINTAINER "fangdajiang@gmail.com"
LABEL description="Hymns Picker Frontend"

COPY build /usr/share/nginx/html