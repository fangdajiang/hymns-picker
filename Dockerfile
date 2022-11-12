FROM nginx

MAINTAINER "fangdajiang@gmail.com"
LABEL description="Hymns Picker Frontend"

ENV LANG     en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV LC_ALL   en_US.UTF-8
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo 'Asia/Shanghai' >/etc/timezone

COPY build /usr/share/nginx/html