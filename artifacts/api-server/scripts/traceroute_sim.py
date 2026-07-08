"""Traceroute Sim — Module 90. Usage: traceroute_sim.py "8.8.8.8" or traceroute_sim.py "domain.com" """
import sys, socket, json, urllib.request

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(r, timeout=5) as resp:
        return json.load(resp)

def geoip(ip: str) -> str:
    try:
        data = fetch(f"https://ipinfo.io/{ip}/json")
        parts = []
        if data.get("city"):    parts.append(data["city"])
        if data.get("country"): parts.append(data["country"])
        if data.get("org"):     parts.append(data["org"].split(" ",1)[-1][:25])
        return "  ".join(parts)
    except Exception:
        return ""

def icmp_ttl_probe(dest: str, ttl: int, timeout: float = 2.0):
    try:
        recv_sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
        send_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        recv_sock.settimeout(timeout)
        send_sock.setsockopt(socket.IPPROTO_IP, socket.IP_TTL, ttl)
        port = 33434 + ttl
        recv_sock.bind(("", port))
        send_sock.sendto(b"X"*32, (dest, port))
        try:
            data, addr = recv_sock.recvfrom(512)
            return addr[0]
        except socket.timeout:
            return None
        finally:
            recv_sock.close()
            send_sock.close()
    except PermissionError:
        return "PERM_DENIED"
    except Exception:
        return None

def tcp_ttl_probe(dest: str, dest_ip: str, ttl: int, port: int = 80, timeout: float = 2.0):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.IPPROTO_IP, socket.IP_TTL, ttl)
        s.settimeout(timeout)
        try:
            s.connect((dest_ip, port))
            s.close()
            return dest_ip
        except socket.timeout:
            return None
        except ConnectionRefusedError:
            return dest_ip
        except OSError as e:
            if "EHOSTUNREACH" in str(e) or "errno 113" in str(e).lower():
                return None
            return None
        finally:
            try: s.close()
            except Exception: pass
    except Exception:
        return None

def main():
    print("[MODULE 090] TRACEROUTE SIM")
    print("[SOURCE]     Raw socket TTL probes + ipinfo.io geolocation per hop")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No target supplied.")
        sys.exit(1)

    target = raw.lower().lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {target}")
    print()

    try:
        dest_ip = socket.gethostbyname(target)
    except Exception as e:
        print(f"[ERROR] Could not resolve {target}: {e}")
        sys.exit(1)

    if dest_ip != target:
        print(f"[RESOLVED] {dest_ip}")
    print()

    MAX_HOPS = 20
    print(f"[TRACEROUTE]  Max {MAX_HOPS} hops  (TCP port 80 probe)")
    print()
    print(f"  {'HOP':3s}  {'IP':16s}  {'GEO/ORG'}")
    print(f"  {'-'*3}  {'-'*16}  {'-'*40}")

    seen_ips = set()
    for ttl in range(1, MAX_HOPS + 1):
        hop_ip = icmp_ttl_probe(dest_ip, ttl)

        if hop_ip == "PERM_DENIED":
            hop_ip = tcp_ttl_probe(target, dest_ip, ttl)

        if hop_ip is None:
            print(f"  {ttl:3d}  {'*':16s}  (no response)")
            continue

        if hop_ip in seen_ips:
            print(f"  {ttl:3d}  {hop_ip:16s}  (loop)")
            break
        seen_ips.add(hop_ip)

        geo = geoip(hop_ip) if hop_ip != "PERM_DENIED" else ""
        print(f"  {ttl:3d}  {hop_ip:16s}  {geo}")

        if hop_ip == dest_ip:
            print()
            print(f"  [DESTINATION REACHED] {dest_ip}")
            break

    print()
    print("[NOTE]  Raw ICMP probes require elevated privileges.")
    print("        Results may be incomplete in sandboxed environments.")
    print("[DONE] Traceroute simulation complete.")

if __name__ == "__main__":
    main()
