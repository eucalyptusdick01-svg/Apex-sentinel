"""Telnet Probe — Module 122. Banner grab + credential prompt detection."""
import sys, socket, time

# Common Telnet IAC negotiation bytes to filter
IAC = 255

def clean_telnet(data):
    """Strip IAC negotiation bytes from Telnet response."""
    result = bytearray()
    i = 0
    while i < len(data):
        if data[i] == IAC and i+2 < len(data):
            i += 3  # skip IAC CMD OPT
        else:
            result.append(data[i])
            i += 1
    return bytes(result)

def telnet_probe(host, port=23, timeout=8):
    res = {"open": False, "banner": None, "error": None, "login_prompt": False,
           "password_prompt": False, "device_type": None}
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))
        res["open"] = True

        # Read initial data
        data = b""
        try:
            for _ in range(5):
                chunk = sock.recv(1024)
                if not chunk: break
                data += chunk
                time.sleep(0.3)
        except socket.timeout:
            pass

        clean = clean_telnet(data)
        res["banner"] = clean.decode("utf-8","replace").strip()

        banner_lower = res["banner"].lower()
        res["login_prompt"] = any(p in banner_lower for p in ["login:", "username:", "user:"])
        res["password_prompt"] = "password:" in banner_lower

        # Device fingerprinting
        if "cisco" in banner_lower:
            res["device_type"] = "Cisco IOS/IOS-XE"
        elif "juniper" in banner_lower or "junos" in banner_lower:
            res["device_type"] = "Juniper JunOS"
        elif "mikrotik" in banner_lower:
            res["device_type"] = "MikroTik RouterOS"
        elif "linux" in banner_lower or "ubuntu" in banner_lower or "debian" in banner_lower:
            res["device_type"] = "Linux"
        elif "windows" in banner_lower:
            res["device_type"] = "Windows"
        elif "freebsd" in banner_lower or "netbsd" in banner_lower:
            res["device_type"] = "BSD Unix"
        elif "router" in banner_lower or "switch" in banner_lower:
            res["device_type"] = "Network device"
        elif "dvr" in banner_lower or "camera" in banner_lower:
            res["device_type"] = "IoT/DVR device"

        # Try common default credentials
        if res["login_prompt"]:
            defaults = [("admin","admin"),("admin",""),("root","root"),("root",""),
                        ("admin","1234"),("admin","password"),("user","user")]
            for user, pwd in defaults[:3]:
                try:
                    sock2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock2.settimeout(6)
                    sock2.connect((host, port))
                    time.sleep(0.5)
                    sock2.recv(2048)  # banner + IAC
                    sock2.sendall(f"{user}\r\n".encode())
                    time.sleep(0.5)
                    resp = sock2.recv(1024)
                    clean_resp = clean_telnet(resp).decode("utf-8","replace").lower()
                    if "password" in clean_resp:
                        sock2.sendall(f"{pwd}\r\n".encode())
                        time.sleep(0.7)
                        after = sock2.recv(2048)
                        clean_after = clean_telnet(after).decode("utf-8","replace").lower()
                        if any(s in clean_after for s in ["#","$",">","prompt","welcome","last login"]):
                            res["default_cred"] = f"{user}:{pwd}"
                            res["default_cred_works"] = True
                            break
                    sock2.close()
                except: pass

        sock.close()
    except ConnectionRefusedError:
        res["error"] = "Connection refused"
    except socket.timeout:
        res["error"] = "Timeout"
    except Exception as e:
        res["error"] = str(e)
    return res

def main():
    print("[MODULE 122] TELNET PROBE")
    print("[SOURCE]     Raw TCP socket — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  192.168.1.1       — probe Telnet on port 23")
        print("[USAGE]  router.local:23   — explicit port")
        sys.exit(0)

    if ":" in raw:
        host, p = raw.rsplit(":",1)
        try: port = int(p)
        except: host, port = raw, 23
    else:
        host, port = raw, 23

    print(f"[TARGET]  {host}:{port}")
    print()

    r = telnet_probe(host, port)

    if not r["open"]:
        print(f"[STATUS]  CLOSED")
        print(f"[ERROR]   {r['error']}")
        sys.exit(0)

    print(f"[STATUS]       OPEN")
    if r["banner"]:
        print(f"[BANNER]       {r['banner'][:300]}")
    else:
        print("[BANNER]       (no printable banner)")
    if r["device_type"]:
        print(f"[DEVICE TYPE]  {r['device_type']}")
    print()

    print(f"[LOGIN PROMPT]     {'YES' if r['login_prompt'] else 'NO'}")
    print(f"[PASSWORD PROMPT]  {'YES' if r['password_prompt'] else 'NO'}")
    print()

    if r.get("default_cred_works"):
        print(f"[DEFAULT CREDS]  ✗  COMPROMISED — {r['default_cred']} authenticated successfully")
        print(f"[RISK]           CRITICAL — change credentials immediately")
    else:
        print(f"[DEFAULT CREDS]  Tested common defaults — none worked with quick test")

    print()
    print("[RISK]  CRITICAL — Telnet transmits all data including passwords in PLAINTEXT")
    print("[FIX]   Disable Telnet immediately; replace with SSH (port 22)")
    print("[FIX]   If Telnet is required (legacy HW), isolate on VLAN + add ACLs")

    print()
    print("[DONE] Telnet probe complete.")

if __name__ == "__main__":
    main()
