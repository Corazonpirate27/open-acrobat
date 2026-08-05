Name:           open-acrobat
Version:        1.0.0
Release:        1%{?dist}
Summary:        Professional PDF Suite for Fedora Linux
License:        MIT
URL:            https://github.com/Corazonpirate27/open-acrobat

BuildArch:      x86_64
Requires:       gtk3, nss, libXScrnSaver, alsa-lib

%description
Open Acrobat is a fast, lightweight, open-source Adobe Acrobat clone for Fedora Linux.
Supports PDF viewing, continuous scrolling, click-and-type text editing, drawing,
digital signatures, page organizing, watermarking, and PDF merging.

%prep

%build

%install
mkdir -p %{buildroot}/opt/open-acrobat
mkdir -p %{buildroot}/usr/share/applications
cp -r dist-desktop/linux-unpacked/* %{buildroot}/opt/open-acrobat/
cp acrobat-linux.desktop %{buildroot}/usr/share/applications/open-acrobat.desktop

%files
/opt/open-acrobat
/usr/share/applications/open-acrobat.desktop

%changelog
* Wed Aug 05 2026 Corazonpirate27 <arogyabaral123@gmail.com> - 1.0.0-1
- Initial Fedora RPM release of Open Acrobat.
