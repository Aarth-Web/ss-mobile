#!/bin/bash

# Set the directory to download fonts to
FONT_DIR="assets/fonts"

# Make sure the font directory exists
mkdir -p $FONT_DIR

# Reddit Sans font
echo "Downloading Reddit Sans font..."
curl -L -o reddit_sans.zip "https://github.com/reddit/BentoFont/raw/main/Reddit%20Sans/Reddit%20Sans.zip"
unzip -o reddit_sans.zip -d $FONT_DIR/reddit_sans
cp $FONT_DIR/reddit_sans/Webfont/fonts/*.ttf $FONT_DIR/
mv $FONT_DIR/RedditSans-Regular.ttf $FONT_DIR/RedditSans-Regular.ttf
mv $FONT_DIR/RedditSans-Medium.ttf $FONT_DIR/RedditSans-Medium.ttf
mv $FONT_DIR/RedditSans-Bold.ttf $FONT_DIR/RedditSans-Bold.ttf
rm -rf $FONT_DIR/reddit_sans
rm reddit_sans.zip

# Caveat font
echo "Downloading Caveat font..."
curl -L -o caveat.zip "https://fonts.google.com/download?family=Caveat"
unzip -o caveat.zip -d $FONT_DIR/caveat
cp $FONT_DIR/caveat/static/*.ttf $FONT_DIR/
rm -rf $FONT_DIR/caveat
rm caveat.zip

# Shadows Into Light font
echo "Downloading Shadows Into Light font..."
curl -L -o shadows.zip "https://fonts.google.com/download?family=Shadows%20Into%20Light"
unzip -o shadows.zip -d $FONT_DIR/shadows
cp $FONT_DIR/shadows/*.ttf $FONT_DIR/ShadowsIntoLight-Regular.ttf
rm -rf $FONT_DIR/shadows
rm shadows.zip

echo "All fonts downloaded and installed!"
