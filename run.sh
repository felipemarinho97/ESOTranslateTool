#!/bin/bash

while true; do
    systemctl restart tor.service;
    sleep 5s;
    sudo -u darklyn curl --socks5 127.0.0.1:9050 http://checkip.amazonaws.com/;
    sleep 10s;
    sudo -u darklyn torsocks node --stack-size=65500 translate.js;
done