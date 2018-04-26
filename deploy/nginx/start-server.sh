#!/bin/bash

#certbot --nginx --agree-tos --domains $DOMAINS --email $EMAIL --non-interactive

echo 'Staring nginx server'
nginx -g "daemon off;"
