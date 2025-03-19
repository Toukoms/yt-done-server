#!/bin/bash

# Create a bin directory
mkdir -p bin

# Download & extract FFmpeg
wget -q https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n7.1-latest-linux64-gpl-7.1.tar.xz
tar -xf ffmpeg-n7.1-latest-linux64-gpl-7.1.tar.xz
mv ffmpeg-n7.1-latest-linux64-gpl-7.1/bin/* bin/
rm -rf ffmpeg-n7.1-latest-linux64-gpl-7.1*

# Download yt-dlp
wget -q https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O bin/yt-dlp
chmod +x bin/*  # Make files executable

# Show success message
echo "✅ Installation complete! Binaries are in ./bin"
ls -lh bin

export PATH=$PWD/bin:$PATH
yt-dlp --version
echo "✅ exported"

npm ci