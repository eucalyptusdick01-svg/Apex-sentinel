"""HTTP Status — Module 166. Usage: http_status.py "404" or http_status.py "5xx" or http_status.py "all" """
import sys

STATUS_CODES = {
    # 1xx Informational
    100: ("Continue", "1xx", "Server received request headers — client should proceed"),
    101: ("Switching Protocols", "1xx", "Upgrade requested (e.g. WebSocket upgrade)"),
    102: ("Processing", "1xx", "WebDAV — request received, processing"),
    103: ("Early Hints", "1xx", "Preload resources while server prepares response"),
    # 2xx Success
    200: ("OK", "2xx", "Standard success response"),
    201: ("Created", "2xx", "Resource successfully created (POST/PUT)"),
    202: ("Accepted", "2xx", "Request accepted for processing, not yet complete"),
    203: ("Non-Authoritative Information", "2xx", "Response from proxy, not origin"),
    204: ("No Content", "2xx", "Success but no body (DELETE, PUT with no return)"),
    205: ("Reset Content", "2xx", "Reset the document view"),
    206: ("Partial Content", "2xx", "Range request fulfilled (streaming/resume)"),
    207: ("Multi-Status", "2xx", "WebDAV — multiple resources status"),
    208: ("Already Reported", "2xx", "WebDAV — DAV binding reported earlier"),
    226: ("IM Used", "2xx", "Instance manipulations applied (RFC 3229)"),
    # 3xx Redirection
    300: ("Multiple Choices", "3xx", "Multiple options for the resource"),
    301: ("Moved Permanently", "3xx", "Resource permanently moved — update your links"),
    302: ("Found", "3xx", "Temporary redirect — original URL may change"),
    303: ("See Other", "3xx", "POST redirect to GET — use after form submission"),
    304: ("Not Modified", "3xx", "Cached version valid — no body returned"),
    305: ("Use Proxy", "3xx", "Deprecated — must use proxy"),
    307: ("Temporary Redirect", "3xx", "Temp redirect — preserve method (POST stays POST)"),
    308: ("Permanent Redirect", "3xx", "Permanent redirect — preserve method"),
    # 4xx Client Errors
    400: ("Bad Request", "4xx", "Malformed request syntax or invalid parameters"),
    401: ("Unauthorized", "4xx", "Authentication required (not authenticated)"),
    402: ("Payment Required", "4xx", "Reserved for future payment systems"),
    403: ("Forbidden", "4xx", "Authenticated but not authorized"),
    404: ("Not Found", "4xx", "Resource does not exist at this URL"),
    405: ("Method Not Allowed", "4xx", "HTTP method not supported for this endpoint"),
    406: ("Not Acceptable", "4xx", "Cannot serve acceptable content type"),
    407: ("Proxy Auth Required", "4xx", "Authentication required at proxy"),
    408: ("Request Timeout", "4xx", "Server timed out waiting for request"),
    409: ("Conflict", "4xx", "State conflict (e.g. duplicate resource)"),
    410: ("Gone", "4xx", "Resource permanently deleted — different from 404"),
    411: ("Length Required", "4xx", "Content-Length header required"),
    412: ("Precondition Failed", "4xx", "Conditional request header failed"),
    413: ("Payload Too Large", "4xx", "Request body exceeds server limit"),
    414: ("URI Too Long", "4xx", "URL exceeds server limit"),
    415: ("Unsupported Media Type", "4xx", "Content-Type not supported"),
    416: ("Range Not Satisfiable", "4xx", "Requested byte range invalid"),
    417: ("Expectation Failed", "4xx", "Expect header cannot be met"),
    418: ("I'm a Teapot", "4xx", "April Fools RFC 2324 — refusing to brew coffee"),
    421: ("Misdirected Request", "4xx", "Request sent to wrong server"),
    422: ("Unprocessable Content", "4xx", "Semantic errors in request (validation fail)"),
    423: ("Locked", "4xx", "WebDAV — resource is locked"),
    424: ("Failed Dependency", "4xx", "WebDAV — previous request failed"),
    425: ("Too Early", "4xx", "Replay attack risk — request too early"),
    426: ("Upgrade Required", "4xx", "Client must switch protocols"),
    428: ("Precondition Required", "4xx", "Conditional request required"),
    429: ("Too Many Requests", "4xx", "Rate limited — slow down"),
    431: ("Headers Too Large", "4xx", "Request headers exceed size limit"),
    451: ("Unavailable For Legal", "4xx", "Censored for legal reasons (nod to Fahrenheit 451)"),
    # 5xx Server Errors
    500: ("Internal Server Error", "5xx", "Generic server error — check server logs"),
    501: ("Not Implemented", "5xx", "Server doesn't support the method"),
    502: ("Bad Gateway", "5xx", "Upstream server returned invalid response"),
    503: ("Service Unavailable", "5xx", "Server overloaded or in maintenance"),
    504: ("Gateway Timeout", "5xx", "Upstream server timed out"),
    505: ("HTTP Version Not Supported", "5xx", "Server doesn't support HTTP version"),
    506: ("Variant Also Negotiates", "5xx", "Circular content negotiation"),
    507: ("Insufficient Storage", "5xx", "WebDAV — no space to complete request"),
    508: ("Loop Detected", "5xx", "WebDAV — infinite loop in request"),
    510: ("Not Extended", "5xx", "Extension required for request"),
    511: ("Network Auth Required", "5xx", "Must authenticate to use network (captive portal)"),
}

def main():
    print("[MODULE 166] HTTP STATUS CODES")
    print("[SOURCE]     Built-in RFC database — all registered HTTP status codes")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()

    if not raw or raw.lower() == "all":
        print(f"[DATABASE]  {len(STATUS_CODES)} HTTP status codes\n")
        current_class = ""
        for code in sorted(STATUS_CODES):
            name, cls, desc = STATUS_CODES[code]
            if cls != current_class:
                current_class = cls
                labels = {"1xx":"Informational","2xx":"Success","3xx":"Redirection","4xx":"Client Error","5xx":"Server Error"}
                print(f"\n[{cls} — {labels.get(cls,'')}]")
            print(f"  {code}  {name:35s}  {desc}")
        sys.exit(0)

    raw_lower = raw.lower()

    # Class filter
    if raw_lower.endswith("xx") and raw_lower[0].isdigit():
        cls_prefix = raw_lower[0]
        print(f"[CLASS]  {cls_prefix}xx")
        print()
        for code in sorted(STATUS_CODES):
            if str(code).startswith(cls_prefix):
                name, cls, desc = STATUS_CODES[code]
                print(f"  {code}  {name:35s}  {desc}")
        sys.exit(0)

    # Text search
    try:
        code_num = int(raw)
        if code_num in STATUS_CODES:
            name, cls, desc = STATUS_CODES[code_num]
            print(f"[{code_num}]  {name}")
            print(f"  Class:       {cls}")
            print(f"  Description: {desc}")
        else:
            print(f"[{code_num}]  Not a registered HTTP status code")
            nearby = [c for c in STATUS_CODES if abs(c - code_num) <= 5]
            if nearby:
                print(f"  Nearby codes: {', '.join(str(c) for c in nearby)}")
    except ValueError:
        # Text search
        q = raw.lower()
        results = [(c, n, cl, d) for c,(n,cl,d) in STATUS_CODES.items()
                   if q in n.lower() or q in d.lower()]
        if results:
            print(f"[SEARCH '{raw}']  {len(results)} results")
            print()
            for code, name, cls, desc in results:
                print(f"  {code}  {name:35s}  {desc}")
        else:
            print(f"[RESULT]  No status codes matching '{raw}'")

    print()
    print("[DONE] HTTP status reference complete.")

if __name__ == "__main__":
    main()
