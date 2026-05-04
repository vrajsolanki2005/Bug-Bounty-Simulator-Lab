#!/bin/bash
# OpenVPN Initialization Script for Offline Lab

echo "🚀 Initializing OpenVPN Server Configuration..."

# 1. Initialize the OpenVPN volume
docker-compose run --rm openvpn ovpn_genconfig -u udp://YOUR_PUBLIC_IP:1194

# 2. Initialize PKI (this requires a passphrase, prompts the user)
echo "You will be prompted to enter a passphrase for the CA."
docker-compose run --rm openvpn ovpn_initpki

# 3. Start the OpenVPN server
docker-compose up -d openvpn

# 4. Generate a client certificate without a passphrase
echo "👤 Generating client certificate for 'hacker1'..."
docker-compose run --rm openvpn easyrsa build-client-full hacker1 nopass

# 5. Export the client configuration file (.ovpn)
echo "📥 Exporting hacker1.ovpn..."
docker-compose run --rm openvpn ovpn_getclient hacker1 > hacker1.ovpn

echo "✅ Setup Complete! Users can connect to the lab network using hacker1.ovpn via their local OpenVPN client."
