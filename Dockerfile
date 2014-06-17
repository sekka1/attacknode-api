# Pull base image.
FROM dockerfile/ubuntu

RUN apt-get update
RUN apt-get install node npm -y

RUN npm install forever -g

# Pull application code
WORKDIR /opt
RUN git clone https://2315b2902537ff5da7fa205d5ebd0aab0114a9ba@github.com/sekka1/attacknode-api.git

EXPOSE 80
EXPOSE 8080

#CMD ["/usr/bin/supervisord", "-n"]