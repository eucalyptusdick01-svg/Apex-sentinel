"""
QR Encoder — Module 214
Generates a QR code and displays it as ASCII art in the terminal.
Usage:
  qr_encode.py "https://example.com"
  qr_encode.py "Hello World"
  qr_encode.py "wifi:MyNetwork:WPA:mypassword"
  qr_encode.py "tel:+15551234567"
  qr_encode.py "mailto:user@example.com"
"""
import sys

try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False

def qr_to_ascii(qr_matrix: list[list[bool]]) -> list[str]:
    lines = []
    n = len(qr_matrix)
    for row in range(0, n, 2):
        line = ""
        for col in range(n):
            top = qr_matrix[row][col] if row < n else False
            bot = qr_matrix[row + 1][col] if row + 1 < n else False
            if top and bot:
                line += "█"
            elif top and not bot:
                line += "▀"
            elif not top and bot:
                line += "▄"
            else:
                line += " "
        lines.append(line)
    return lines

def detect_type(data: str) -> str:
    d = data.lower()
    if d.startswith("https://") or d.startswith("http://"):
        return "URL"
    if d.startswith("mailto:"):
        return "Email"
    if d.startswith("tel:") or d.startswith("sms:"):
        return "Phone/SMS"
    if d.startswith("wifi:"):
        return "WiFi Credentials"
    if d.startswith("geo:"):
        return "GPS Location"
    if d.startswith("begin:vcard"):
        return "vCard Contact"
    if d.startswith("otpauth://"):
        return "OTP/2FA Auth"
    if d.startswith("bitcoin:") or d.startswith("ethereum:"):
        return "Crypto Address"
    return "Text"

def main() -> None:
    print("[MODULE 214] QR ENCODER")
    print("[SOURCE]     qrcode library — ASCII terminal output")
    print()

    if not HAS_QRCODE:
        print("[ERROR] qrcode library not available.")
        print("[FIX]   pip install qrcode")
        sys.exit(1)

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] qr_encode.py \"https://example.com\"")
        print("        qr_encode.py \"Hello World\"")
        print("        qr_encode.py \"wifi:MySSID:WPA:password\"")
        sys.exit(1)

    content_type = detect_type(raw)
    print(f"[TARGET]  {raw[:80]}{'...' if len(raw)>80 else ''}")
    print(f"[TYPE]    {content_type}")
    print(f"[LENGTH]  {len(raw.encode('utf-8'))} bytes")
    print()

    try:
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=1,
            border=2,
        )
        qr.add_data(raw)
        qr.make(fit=True)

        matrix = qr.modules
        n = len(matrix)

        print(f"[QR CODE]  {n}×{n} modules  (version {qr.version})  error correction: M (15%)")
        print()

        ascii_lines = qr_to_ascii(matrix)
        for line in ascii_lines:
            print("  " + line)

        print()

        factory = qrcode.image.styledpil.StyledPilImage if hasattr(qrcode.image, 'styledpil') else None

        print("[TEXT QR — alternate rendering]")
        qr2 = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=1)
        qr2.add_data(raw)
        qr2.make(fit=True)
        for row in qr2.modules:
            print("  " + "".join("██" if cell else "  " for cell in row))

    except Exception as e:
        print(f"[ERROR] QR generation failed: {e}")
        sys.exit(1)

    print()
    print("[DONE] QR encoding complete.")

if __name__ == "__main__":
    main()
