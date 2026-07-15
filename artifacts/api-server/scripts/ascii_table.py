"""ASCII Table — Module 226. Full ASCII/extended reference with search."""
import sys

def main():
    print("[MODULE 226] ASCII TABLE")
    print("[SOURCE]     Local reference — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()

    def char_info(code):
        c = chr(code)
        if c.isprintable() and c != ' ':
            display = c
        elif code == 32:
            display = "SPACE"
        elif code == 10:
            display = "LF"
        elif code == 13:
            display = "CR"
        elif code == 9:
            display = "TAB"
        elif code == 0:
            display = "NULL"
        elif code == 27:
            display = "ESC"
        elif code == 127:
            display = "DEL"
        else:
            display = f"CTRL+{chr(code+64)}" if code < 32 else "?"
        return display

    NAMES = {
        0:"NULL",1:"SOH",2:"STX",3:"ETX",4:"EOT",5:"ENQ",6:"ACK",7:"BEL",
        8:"BS",9:"HT",10:"LF",11:"VT",12:"FF",13:"CR",14:"SO",15:"SI",
        16:"DLE",17:"DC1",18:"DC2",19:"DC3",20:"DC4",21:"NAK",22:"SYN",
        23:"ETB",24:"CAN",25:"EM",26:"SUB",27:"ESC",28:"FS",29:"GS",
        30:"RS",31:"US",32:"SP",127:"DEL"
    }

    # Search mode
    if raw and not raw.isdigit() and not raw.startswith("all") and not raw.startswith("ext"):
        # Search for character/name
        found = []
        for i in range(256):
            c = chr(i)
            name = NAMES.get(i, c)
            if (raw.lower() in name.lower() or
                (len(raw)==1 and c == raw) or
                (raw.lower() == c.lower())):
                found.append(i)

        if found:
            print(f"[SEARCH]  '{raw}'")
            print()
            for code in found:
                c = chr(code)
                name = NAMES.get(code, c if c.isprintable() else "?")
                print(f"  DEC={code:3}  HEX=0x{code:02X}  OCT={code:03o}  BIN={code:08b}  CHAR={name}")
            sys.exit(0)
        else:
            print(f"[SEARCH]  '{raw}' — not found in ASCII table")
            sys.exit(0)

    # Single decimal/hex lookup
    if raw.isdigit():
        code = int(raw)
        if 0 <= code <= 255:
            name = NAMES.get(code, chr(code) if chr(code).isprintable() else "?")
            c = chr(code)
            print(f"[DECIMAL]   {code}")
            print(f"[HEX]       0x{code:02X}")
            print(f"[OCTAL]     {code:03o}")
            print(f"[BINARY]    {code:08b}")
            print(f"[CHARACTER] {char_info(code)}")
            print(f"[NAME]      {NAMES.get(code, 'printable')}")
            print(f"[PRINTABLE] {'Yes' if c.isprintable() else 'No'}")
            print(f"[CONTROL]   {'Yes' if code < 32 or code == 127 else 'No'}")
            sys.exit(0)

    # Full table
    show_ext = raw.startswith("ext")
    limit = 256 if show_ext else 128

    print(f"[ASCII TABLE]  {'0-127 standard' if not show_ext else '0-255 extended'}")
    print()
    print(f"  {'DEC':>3}  {'HEX':>4}  {'OCT':>4}  {'BIN':>8}  CHAR/NAME")
    print("  " + "-"*50)
    for code in range(limit):
        name = NAMES.get(code, chr(code) if chr(code).isprintable() else "")
        print(f"  {code:3}  0x{code:02X}  {code:04o}  {code:08b}  {name}")
        if code % 32 == 31:
            print()

    print()
    print("[USAGE]  ascii_table.py 65        — lookup decimal 65")
    print("[USAGE]  ascii_table.py space     — search by name")
    print("[USAGE]  ascii_table.py ext       — show 0-255 extended")
    print()
    print("[DONE] ASCII table complete.")

if __name__ == "__main__":
    main()
