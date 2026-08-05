#!/usr/bin/env bash
set -e

echo "================================================"
echo "  Installing Open Acrobat for Linux (Fedora/Ubuntu/Arch)..."
echo "================================================"

INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
APP_DIR="$HOME/.local/share/open-acrobat"

mkdir -p "$INSTALL_DIR" "$DESKTOP_DIR" "$APP_DIR"

echo "--> Copying Open Acrobat application files..."
cp -r dist-desktop/linux-unpacked/* "$APP_DIR/" 2>/dev/null || true

echo "--> Creating launcher binary in $INSTALL_DIR/open-acrobat..."
cat << 'EOF' > "$INSTALL_DIR/open-acrobat"
#!/usr/bin/env bash
exec "$HOME/.local/share/open-acrobat/open-acrobat" "$@"
EOF
chmod +x "$INSTALL_DIR/open-acrobat"

echo "--> Creating Fedora Desktop shortcut..."
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
    update-desktop-database "$DESKTOP_DIR"
fi

echo "================================================"
echo "✅ Open Acrobat installed successfully!"
echo "   Run 'open-acrobat' in terminal or launch from your Application Menu."
echo "================================================"
