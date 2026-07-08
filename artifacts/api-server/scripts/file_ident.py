"""
File Identifier — Module 103
Identifies file type from magic bytes (hex prefix) or file extension.
Usage:
  file_ident.py "hex:FFD8FFE0..."          (hex magic bytes)
  file_ident.py "file:/path/to/unknown"    (read file magic bytes)
  file_ident.py "ext:.docx"               (extension lookup)
"""
import sys
import os

MAGIC_SIGNATURES: list[tuple[bytes, int, str, str]] = [
    (b'\xff\xd8\xff', 0, "JPEG Image", "image/jpeg"),
    (b'\x89PNG\r\n\x1a\n', 0, "PNG Image", "image/png"),
    (b'GIF87a', 0, "GIF Image (87a)", "image/gif"),
    (b'GIF89a', 0, "GIF Image (89a)", "image/gif"),
    (b'BM', 0, "BMP Image", "image/bmp"),
    (b'RIFF', 0, "RIFF Container (WAV/AVI/etc)", "application/octet-stream"),
    (b'\x00\x00\x01\x00', 0, "ICO Icon", "image/x-icon"),
    (b'II\x2a\x00', 0, "TIFF Image (little-endian)", "image/tiff"),
    (b'MM\x00\x2a', 0, "TIFF Image (big-endian)", "image/tiff"),
    (b'\x00\x00\x00\x0cjP  ', 0, "JPEG 2000", "image/jp2"),
    (b'%PDF', 0, "PDF Document", "application/pdf"),
    (b'PK\x03\x04', 0, "ZIP Archive / Office Open XML", "application/zip"),
    (b'PK\x05\x06', 0, "ZIP Archive (empty)", "application/zip"),
    (b'Rar!\x1a\x07\x00', 0, "RAR Archive v4", "application/x-rar"),
    (b'Rar!\x1a\x07\x01\x00', 0, "RAR Archive v5", "application/x-rar"),
    (b'\x1f\x8b', 0, "GZIP Archive", "application/gzip"),
    (b'BZh', 0, "BZIP2 Archive", "application/x-bzip2"),
    (b'\xfd7zXZ\x00', 0, "XZ Archive", "application/x-xz"),
    (b'7z\xbc\xaf\x27\x1c', 0, "7-Zip Archive", "application/x-7z-compressed"),
    (b'\x4c\x5a\x49\x50', 0, "LZIP Archive", "application/x-lzip"),
    (b'MZ', 0, "PE Executable (EXE/DLL)", "application/x-msdownload"),
    (b'\x7fELF', 0, "ELF Executable (Linux/Unix)", "application/x-elf"),
    (b'\xfe\xed\xfa\xce', 0, "Mach-O 32-bit Binary", "application/x-mach-binary"),
    (b'\xfe\xed\xfa\xcf', 0, "Mach-O 64-bit Binary", "application/x-mach-binary"),
    (b'\xca\xfe\xba\xbe', 0, "Java Class File / Universal Binary", "application/java-vm"),
    (b'PK', 0, "ZIP-based format (.jar/.apk/.docx/.xlsx/.pptx)", "application/zip"),
    (b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1', 0, "OLE2 Compound (DOC/XLS/PPT)", "application/msword"),
    (b'<?xml', 0, "XML Document", "text/xml"),
    (b'<!DOCTYPE', 0, "HTML/XML Document", "text/html"),
    (b'<html', 0, "HTML Document", "text/html"),
    (b'{\n', 0, "JSON (likely)", "application/json"),
    (b'[', 0, "JSON Array or TOML", "application/json"),
    (b'\xef\xbb\xbf', 0, "UTF-8 BOM Text", "text/plain"),
    (b'\xff\xfe', 0, "UTF-16 LE BOM Text", "text/plain"),
    (b'\xfe\xff', 0, "UTF-16 BE BOM Text", "text/plain"),
    (b'#!', 0, "Script / Shebang", "text/x-script"),
    (b'SQLite format 3\x00', 0, "SQLite Database", "application/x-sqlite3"),
    (b'\x52\x49\x46\x46', 0, "RIFF (WAV/AVI/WebP)", "application/octet-stream"),
    (b'OggS', 0, "Ogg Container (Vorbis/Opus/Theora)", "audio/ogg"),
    (b'fLaC', 0, "FLAC Audio", "audio/flac"),
    (b'ID3', 0, "MP3 Audio (ID3 tagged)", "audio/mpeg"),
    (b'\xff\xfb', 0, "MP3 Audio", "audio/mpeg"),
    (b'\x00\x00\x00\x20ftypM4A', 0, "M4A Audio", "audio/mp4"),
    (b'\x1aE\xdf\xa3', 0, "WebM / MKV Video", "video/webm"),
    (b'\x00\x00\x00\x14ftypM4V', 0, "MP4 Video", "video/mp4"),
    (b'\x00\x00\x01\xb3', 0, "MPEG Video", "video/mpeg"),
    (b'FLV\x01', 0, "Flash Video (FLV)", "video/x-flv"),
    (b'\x30\x26\xb2\x75\x8e\x66\xcf\x11', 0, "ASF/WMA/WMV (Windows Media)", "video/x-ms-asf"),
    (b'\x89HDF\r\n\x1a\n', 0, "HDF5 Scientific Data", "application/x-hdf"),
    (b'PGDMP', 0, "PostgreSQL Dump", "application/octet-stream"),
    (b'\x4d\x53\x43\x46', 0, "Microsoft Cabinet (.cab)", "application/vnd.ms-cab-compressed"),
    (b'CAFE', 0, "Java Class (alt)", "application/java-vm"),
]

EXT_MAP = {
    ".py": ("Python Script", "text/x-python"),
    ".js": ("JavaScript", "text/javascript"),
    ".ts": ("TypeScript", "text/typescript"),
    ".sh": ("Shell Script", "text/x-shellscript"),
    ".json": ("JSON Data", "application/json"),
    ".yaml": ("YAML Data", "text/yaml"),
    ".yml": ("YAML Data", "text/yaml"),
    ".toml": ("TOML Config", "text/toml"),
    ".csv": ("CSV Data", "text/csv"),
    ".md": ("Markdown", "text/markdown"),
    ".sql": ("SQL Script", "application/sql"),
    ".log": ("Log File", "text/plain"),
    ".pcap": ("Wireshark Capture", "application/vnd.tcpdump.pcap"),
    ".pcapng": ("Wireshark Capture NG", "application/vnd.tcpdump.pcap"),
    ".pem": ("PEM Certificate/Key", "application/x-pem-file"),
    ".crt": ("X.509 Certificate", "application/x-x509-ca-cert"),
    ".key": ("Private Key", "application/x-pem-file"),
    ".p12": ("PKCS#12 Bundle", "application/x-pkcs12"),
    ".iso": ("Disk Image (ISO)", "application/x-iso9660-image"),
    ".dmg": ("macOS Disk Image", "application/x-apple-diskimage"),
    ".vmdk": ("VMware Disk Image", "application/x-vmdk"),
    ".ovf": ("OVF Virtual Appliance", "application/ovf"),
    ".reg": ("Windows Registry File", "text/plain"),
    ".lnk": ("Windows Shortcut", "application/x-ms-shortlink"),
    ".ps1": ("PowerShell Script", "text/plain"),
    ".vbs": ("VBScript", "text/plain"),
    ".bat": ("Windows Batch Script", "text/plain"),
    ".jar": ("Java Archive", "application/java-archive"),
    ".apk": ("Android Package", "application/vnd.android.package-archive"),
    ".ipa": ("iOS App Archive", "application/x-ios-app"),
}

def identify_from_bytes(data: bytes) -> list[dict]:
    matches = []
    for sig, offset, name, mime in MAGIC_SIGNATURES:
        if data[offset:offset + len(sig)] == sig:
            matches.append({"name": name, "mime": mime, "confidence": "HIGH"})
    return matches

def main() -> None:
    print("[MODULE 103] FILE IDENTIFIER")
    print("[SOURCE]     Magic byte database + extension lookup")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No input supplied.")
        print("[USAGE] file_ident.py \"hex:FFD8FF...\"")
        print("        file_ident.py \"file:/path/to/file\"")
        print("        file_ident.py \"ext:.docx\"")
        sys.exit(1)

    if raw.lower().startswith("ext:"):
        ext = raw[4:].lower()
        if not ext.startswith("."):
            ext = "." + ext
        result = EXT_MAP.get(ext)
        if result:
            print(f"[EXTENSION]   {ext}")
            print(f"[TYPE]        {result[0]}")
            print(f"[MIME]        {result[1]}")
        else:
            print(f"[EXTENSION]   {ext}")
            print("[TYPE]        Unknown extension")
        print()
        print("[DONE] File identification complete.")
        return

    data: bytes
    source_label = ""

    if raw.lower().startswith("file:"):
        path = raw[5:]
        if not os.path.isfile(path):
            print(f"[ERROR] File not found: {path}")
            sys.exit(1)
        with open(path, "rb") as f:
            data = f.read(256)
        size = os.path.getsize(path)
        source_label = f"file '{os.path.basename(path)}' ({size} bytes)"
        ext = os.path.splitext(path)[1].lower()
    elif raw.lower().startswith("hex:"):
        hex_str = raw[4:].replace(" ", "")
        try:
            data = bytes.fromhex(hex_str)
            source_label = f"hex input ({len(data)} bytes)"
            ext = ""
        except ValueError as e:
            print(f"[ERROR] Invalid hex: {e}")
            sys.exit(1)
    else:
        data = raw.encode("latin-1", errors="replace")
        source_label = f"raw input ({len(data)} bytes)"
        ext = ""

    print(f"[INPUT]   {source_label}")
    print(f"[FIRST 16 BYTES]  {data[:16].hex().upper()}")
    print()

    matches = identify_from_bytes(data)
    if matches:
        print(f"[MAGIC BYTE MATCH(ES)] {len(matches)} result(s):")
        for m in matches:
            print(f"  [{m['confidence']:4s}] {m['name']}")
            print(f"         MIME: {m['mime']}")
    else:
        print("[MAGIC BYTES]  No known signature matched")

    if ext:
        result = EXT_MAP.get(ext)
        print()
        if result:
            print(f"[EXTENSION]    {ext} → {result[0]}  (MIME: {result[1]})")
        else:
            print(f"[EXTENSION]    {ext} → unknown")

    print()
    print("[DONE] File identification complete.")

if __name__ == "__main__":
    main()
