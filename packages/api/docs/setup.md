# Web Server & Worker Server
sudo apt update

# Set Timezone
timedatectl set-timezone Asia/Bangkok

# Create non-root user
adduser ubuntu
usermod -aG sudo ubuntu

# Setup SSH key for user
su - ubuntu
mkdir ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit

# Disabled root login (If Required)
sudo nano /etc/ssh/sshd_config
** Change PermitRootLogin yes to no
systemctl restart ssh
logout

# SSH Key for Github
cd ~/.ssh
ssh-keygen
ssh -T git@github.com
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Install Nodejs & NPM
cd /tmp
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm list-remote
nvm install v14.21.3

# Install NPM
npm install pm2 -g

# Install AdonisJS CLI
npm i -g @adonisjs/cli

# Listening on port 80 (For Web Server)
sudo setcap cap_net_bind_service=+ep ~/.nvm/versions/node/v14.21.3/bin/node

# PM2 Setup and Deploy (Client)
pm2 deploy web setup
pm2 deploy web

# PM2 auto start after deploy. (Set every server)


# Install Choromium package for Puppeteer
sudo apt-get install chromium-browser 
sudo apt-get install libx11-xcb1 libxcomposite1 libasound2 libatk1.0-0 libatk-bridge2.0-0 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 

<!-- sudo apt-get install libatk-bridge2.0-0
sudo apt install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev
sudo apt-get install libasound2 -->
# Install ffmpeg and ffprobe to Transcode Server (If Required)
sudo apt-get update
sudo apt-get install build-essential yasm cmake libtool libc6 libc6-dev unzip wget git libssl-dev pkg-config libnuma1 libnuma-dev libx264-dev
cd /tmp
wget https://ffmpeg.org/releases/ffmpeg-6.0.tar.bz2
tar xjvf ffmpeg-6.0.tar.bz2
cd ffmpeg-6.0
** ./configure --enable-gpl --enable-libx264
** ./configure --enable-nonfree --enable-cuda-nvcc --enable-libnpp --extra-cflags=-I/usr/local/cuda/include --extra-ldflags=-L/usr/local/cuda/lib64 --disable-static --enable-shared
make
sudo make install
ffmpeg -version
ffprobe -version

# Mount NAS to Transcode Server (If Required)
sudo nano /etc/nascredentials
** username=YOUR_USERNAME
** password=YOUR_PASSWORD

sudo chown root /etc/nascredentials
sudo chmod 600 /etc/nascredentials

dpkg -l | grep cifs-utils
sudo apt-get update
sudo apt-get install cifs-utils
sudo mkdir /mnt/movies
sudo mkdir /mnt/streaming-movies

id
sudo mount -t cifs //10.1.0.88/Movies /mnt/movies -o credentials=/etc/nascredentials,uid=1001,gid=1001
sudo mount -t cifs //10.1.0.89/Movies /mnt/streaming-movies -o credentials=/etc/nascredentials,uid=1001,gid=1001

sudo nano /etc/fstab
** //10.1.0.88/Movies /mnt/movies cifs credentials=/etc/nascredentials,uid=1001,gid=1001 0 0
** //10.1.0.89/Movies /mnt/streaming-movies cifs credentials=/etc/nascredentials,uid=1001,gid=1001 0 0
ls /mnt/stream


sudo mount -t cifs //103.91.205.205/Movies /mnt/movie -o credentials=/etc/nascredentials,uid=1001,gid=1001
sudo mount -t cifs //103.91.205.205/Stream /mnt/stream -o credentials=/etc/nascredentials,uid=1001,gid=1001

sudo nano /etc/fstab
** //103.91.205.205/Movies /mnt/movie cifs credentials=/etc/nascredentials,uid=1001,gid=1001 0 0
** //103.91.205.205/Stream /mnt/stream cifs credentials=/etc/nascredentials,uid=1001,gid=1001 0 0