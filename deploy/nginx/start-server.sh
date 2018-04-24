#!/bin/bash

certbot --nginx --agree-tos --domains $DOMAINS --email $EMAIL --non-interactive

nginx -g "daemon off;"
