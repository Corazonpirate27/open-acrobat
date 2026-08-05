#!/usr/bin/env bash
set -e

echo "=================================================="
echo "  Installing Open Acrobat PDF Suite for Linux..."
echo "=================================================="

INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
APP_DIR="$HOME/.local/share/open-acrobat"

mkdir -p "$INSTALL_DIR" "$DESKTOP_DIR" "$APP_DIR"

if [ -d "dist-desktop/linux-unpacked" ]; then
    echo "--> Installing from local build folder..."
    cp -r dist-desktop/linux-unpacked/* "$APP_DIR/"
else
    echo "--> Downloading compiled Open Acrobat binary from GitHub..."
    TMP_ZIP="/tmp/open-acrobat-linux.tar.gz"
    DOWNLOAD_URL="https://github.com/Corazonpirate27/open-acrobat/releases/download/v1.0.0/open-acrobat-linux.tar.gz"
    
    if command -v curl >/dev/null 2>&1; then
        curl -L -o "$TMP_ZIP" "$DOWNLOAD_URL" 2>/dev/null || true
    elif command -v wget >/dev/null 2>&1; then
        wget -O "$TMP_ZIP" "$DOWNLOAD_URL" 2>/dev/null || true
    fi

    if [ -f "$TMP_ZIP" ]; then
        tar -xzf "$TMP_ZIP" -C "$APP_DIR/" 2>/dev/null || true
        rm -f "$TMP_ZIP"
    fi
fi

echo "--> Creating binary shortcut in $INSTALL_DIR/open-acrobat..."
cat << 'EOF' > "$INSTALL_DIR/open-acrobat"
#!/usr/bin/env bash
exec "$HOME/.local/share/open-acrobat/open-acrobat" "$@"
EOF
chmod +x "$INSTALL_DIR/open-acrobat"

echo "--> Creating Fedora & Linux Desktop Menu shortcut..."
cat << EOF > "$DESKTOP_DIR/open-acrobat.desktop"
[Desktop Entry]
Name=Open Acrobat
Comment=Professional PDF Editor & Viewer
Exec=$INSTALL_DIR/open-acrobat %U
Icon=document-viewer
Terminal=false
Type=Application
Categories=Office;Viewer;Graphics;
MimeType=application/pdf;
EOF

chmod +x "$DESKTOP_DIR/open-acrobat.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo "=================================================="
echo "✅ Open Acrobat installed successfully!"
echo "   Run 'open-acrobat' in terminal or search 'Open Acrobat' in Application Menu."
echo "=================================================="
