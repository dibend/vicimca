#!/bin/bash
sudo iptables -t nat -D PREROUTING 1
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080
