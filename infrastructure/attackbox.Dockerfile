FROM kalilinux/kali-rolling

# Update and install essential hacking tools and a VNC/Desktop environment
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    kali-linux-headless \
    nmap \
    ffuf \
    dirb \
    gobuster \
    sqlmap \
    curl \
    wget \
    git \
    vim \
    netcat-traditional \
    openvpn \
    # Web tools
    burpsuite \
    firefox-esr \
    # GUI and VNC
    xfce4 \
    xfce4-terminal \
    novnc \
    x11vnc \
    xvfb \
    sudo \
    && apt-get clean

# Create a hacker user
RUN useradd -m -s /bin/bash hacker && echo "hacker:hacker" | chpasswd && adduser hacker sudo

# Setup NoVNC to access the desktop via Browser (Port 8080)
USER hacker
WORKDIR /home/hacker

# A simple script to start the X frame buffer, VNC server, and NoVNC web client
RUN echo '#!/bin/bash\n\
export DISPLAY=:0\n\
Xvfb :0 -screen 0 1280x800x24 &\n\
sleep 2\n\
startxfce4 &\n\
x11vnc -display :0 -forever -nopw -bg\n\
/usr/share/novnc/utils/launch.sh --vnc localhost:5900 --listen 8080\n\
' > /home/hacker/start-desktop.sh

RUN chmod +x /home/hacker/start-desktop.sh

EXPOSE 8080
EXPOSE 22

CMD ["/home/hacker/start-desktop.sh"]
