import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";

type ModuleEntry = {
  id: number;
  name: string;
  what: string;
  input: string;
  tip?: string;
  auth?: boolean; // requires authorized target
};

const MODULES: ModuleEntry[] = [
  // ── 001–030 Core OSINT & Identity ─────────────────────────────────────────
  { id: 1,  name: "IP TRACKER",     what: "Returns geolocation, ISP, ASN and network info for an IP.", input: "IP address (e.g. 8.8.8.8)", tip: "Location is approximate — treat it as city/region level." },
  { id: 2,  name: "DNS RESOLVE",    what: "Resolves a hostname to its IP addresses.", input: "Hostname or domain (e.g. example.com)" },
  { id: 3,  name: "PORT SCAN",      what: "Shows reachable services on the target host.", input: "IP or hostname", auth: true },
  { id: 4,  name: "ASN LOOKUP",     what: "Displays autonomous-system info and announced networks.", input: "ASN number (e.g. AS15169) or org name" },
  { id: 5,  name: "WHOIS QUERY",    what: "Retrieves public registration and network ownership info.", input: "Domain or IP address" },
  { id: 6,  name: "PHONE OSINT",    what: "Searches permitted public sources for phone number info.", input: "Phone number in international format (e.g. +12025551234)" },
  { id: 7,  name: "EMAIL REP",      what: "Checks email reputation, MX validity and disposable-domain flags.", input: "Email address" },
  { id: 8,  name: "PROXY CHECK",    what: "Identifies whether an IP is a proxy, VPN, Tor exit or datacenter host.", input: "IP address" },
  { id: 9,  name: "DB SEARCH",      what: "Searches the platform's configured public datasets.", input: "Search term, name, domain or identifier" },
  { id: 10, name: "GEOLOCATE",      what: "Displays approximate geographic information for an IP or location identifier.", input: "IP address or location string" },
  { id: 11, name: "GITHUB LOOKUP",  what: "Retrieves publicly visible GitHub profile and repository info.", input: "GitHub username" },
  { id: 12, name: "USERNAME CHECK", what: "Checks supported public platforms for a matching username.", input: "Username (no @ symbol)" },
  { id: 13, name: "NEWS SEARCH",    what: "Searches configured news sources for a keyword, name or domain.", input: "Keywords, organization, domain or person name" },
  { id: 14, name: "PEOPLE SEARCH",  what: "Returns matches from public people-search sources.", input: "Full name, username or email" },
  { id: 15, name: "IMAGE SEARCH",   what: "Finds relevant public image results.", input: "Search term or image URL" },
  { id: 16, name: "SITE ENUM",      what: "Enumerates publicly discoverable information about a site.", input: "Domain you control or are authorized to assess", auth: true },
  { id: 17, name: "SUBDOMAIN SCAN", what: "Searches configured sources for discovered subdomains.", input: "Domain (e.g. example.com)", auth: true },
  { id: 18, name: "DNS FULL",       what: "Retrieves all supported DNS record types in one report.", input: "Domain" },
  { id: 19, name: "PAGE LINKS",     what: "Extracts all links found on a webpage.", input: "Full URL (https://...)" },
  { id: 20, name: "SHARED HOST",    what: "Identifies other domains that appear to share the same hosting infrastructure.", input: "IP address or domain" },
  { id: 21, name: "ZONE TRANSFER",  what: "Tests whether an AXFR zone-transfer request is permitted.", input: "DNS server hostname or domain", auth: true },
  { id: 22, name: "ZIP LOOKUP",     what: "Returns geographic/demographic info for a ZIP code.", input: "US ZIP code (e.g. 90210)" },
  { id: 23, name: "ADDRESS LOOKUP", what: "Searches public address datasets.", input: "Street address" },
  { id: 24, name: "AREA CODE",      what: "Returns geographic info for a telephone area code.", input: "3-digit area code (e.g. 415)" },
  { id: 25, name: "BIZ DIRECTORY",  what: "Searches business directories for a company name.", input: "Company or business name" },
  { id: 26, name: "ID GENERATOR",   what: "Generates synthetic test identifiers — not real-world identities.", input: "Parameters: type, count, format", tip: "Output is for development/testing only." },
  { id: 27, name: "ISO 8583",       what: "Creates or parses ISO 8583 test messages for development/simulation.", input: "Message type and field configuration", tip: "Test messages only — not for real financial transactions." },
  { id: 28, name: "ID STUDIO",      what: "Creates synthetic test identity datasets for development and testing.", input: "Dataset parameters", tip: "Synthetic data only." },
  { id: 29, name: "DL ENCODER",     what: "Encodes test driver's-license data in supported formats.", input: "Test DL data fields", tip: "Authorized testing only — do not encode real identities without permission." },
  { id: 30, name: "CHECKSUM GEN",   what: "Calculates the appropriate checksum for numeric data.", input: "Numeric string (e.g. credit card, IBAN, Luhn value)" },

  // ── 031–060 Social, Developer & Web Intelligence ─────────────────────────
  { id: 31, name: "REDDIT USER",    what: "Retrieves publicly available Reddit profile information.", input: "Reddit username" },
  { id: 32, name: "HN USER",        what: "Retrieves public Hacker News profile and activity.", input: "HN username" },
  { id: 33, name: "GRAVATAR",       what: "Checks Gravatar info associated with an email or hash.", input: "Email address or MD5 hash" },
  { id: 34, name: "GITLAB USER",    what: "Inspects publicly available GitLab profile and projects.", input: "GitLab username" },
  { id: 35, name: "MASTODON",       what: "Retrieves public Mastodon profile info.", input: "@user@instance (e.g. @name@mastodon.social)" },
  { id: 36, name: "DEV.TO USER",    what: "Retrieves public DEV Community profile info.", input: "DEV.to username" },
  { id: 37, name: "DISCORD ID",     what: "Processes public Discord identifier information.", input: "Discord user ID (numeric)" },
  { id: 38, name: "PYPI LOOKUP",    what: "Retrieves PyPI package metadata.", input: "Package name or PyPI username" },
  { id: 39, name: "NPM USER",       what: "Retrieves public npm package information.", input: "npm username or package name" },
  { id: 40, name: "DOCKER HUB",     what: "Inspects public Docker Hub repository metadata.", input: "Docker Hub username or image name" },
  { id: 41, name: "KEYBASE",        what: "Retrieves publicly available Keybase identity info.", input: "Keybase username" },
  { id: 42, name: "STACKOVERFLOW",  what: "Retrieves public Stack Overflow profile and activity.", input: "Username or user ID" },
  { id: 43, name: "TWITTER/X",      what: "Retrieves public profile information for a Twitter/X handle.", input: "@username or username" },
  { id: 44, name: "LINKEDIN",       what: "Searches publicly available LinkedIn professional information.", input: "Profile name or URL slug" },
  { id: 45, name: "INSTAGRAM",      what: "Retrieves supported public Instagram profile info.", input: "Instagram username" },
  { id: 46, name: "TIKTOK",         what: "Retrieves supported public TikTok profile info.", input: "TikTok username" },
  { id: 47, name: "TWITCH",         what: "Retrieves public Twitch channel and profile info.", input: "Twitch username" },
  { id: 48, name: "YOUTUBE",        what: "Retrieves public metadata for a YouTube channel or video.", input: "@ChannelHandle or video URL" },
  { id: 49, name: "TELEGRAM ID",    what: "Looks up a public Telegram channel or user — pulls name, bio and subscriber count.", input: "@username or channel handle" },
  { id: 50, name: "SNAPCHAT",       what: "Searches supported public Snapchat profile information.", input: "Snapchat username" },
  { id: 51, name: "CORS CHECK",     what: "Inspects a website's CORS configuration.", input: "URL of an authorized website", auth: true },
  { id: 52, name: "CSP ANALYZE",    what: "Analyzes Content-Security-Policy directives.", input: "URL or raw CSP header string" },
  { id: 53, name: "STEAM ID",       what: "Retrieves public Steam profile info.", input: "Steam ID, username or profile URL" },
  { id: 54, name: "REST PROBE",     what: "Tests REST endpoints for availability and response info.", input: "API endpoint URL", auth: true },
  { id: 55, name: "DNSSEC CHECK",   what: "Determines whether DNSSEC records and config are present.", input: "Domain" },
  { id: 56, name: "CAA RECORD",     what: "Inspects Certificate Authority Authorization DNS records.", input: "Domain" },
  { id: 57, name: "SPF CHECK",      what: "Inspects a domain's SPF configuration.", input: "Domain" },
  { id: 58, name: "DKIM CHECK",     what: "Retrieves and inspects DKIM records.", input: "Domain and selector (e.g. example.com:default)" },
  { id: 59, name: "MX DEEP DIVE",   what: "Analyzes a domain's MX records and mail infrastructure.", input: "Domain" },
  { id: 60, name: "TRUECALLER",     what: "Checks available phone-number reputation information.", input: "Phone number in international format" },

  // ── 061–100 DNS, Web & Infrastructure ─────────────────────────────────────
  { id: 61,  name: "NS LOOKUP",        what: "Returns the authoritative nameservers for a domain.", input: "Domain" },
  { id: 62,  name: "SOA RECORD",       what: "Returns the Start of Authority record for a domain.", input: "Domain" },
  { id: 63,  name: "TXT RECORDS",      what: "Returns all TXT DNS records for a domain.", input: "Domain" },
  { id: 64,  name: "PTR LOOKUP",       what: "Performs a reverse DNS lookup on an IP address.", input: "IP address" },
  { id: 65,  name: "REDIRECT CHAIN",   what: "Follows and displays the full HTTP redirect chain for a URL.", input: "Full URL (https://...)" },
  { id: 66,  name: "COOKIE AUDIT",     what: "Checks cookie attributes (Secure, HttpOnly, SameSite).", input: "URL of an authorized website", auth: true },
  { id: 67,  name: "HEADER GRADE",     what: "Evaluates HTTP security headers and returns a grade.", input: "URL" },
  { id: 68,  name: "HSTS CHECK",       what: "Checks HSTS (HTTP Strict Transport Security) configuration.", input: "Domain" },
  { id: 69,  name: "HTTP METHODS",     what: "Identifies advertised HTTP methods on the server.", input: "URL of an authorized server", auth: true },
  { id: 70,  name: "HTTP2 CHECK",      what: "Determines whether a server supports HTTP/2.", input: "URL or domain" },
  { id: 71,  name: "VIN CHECK",        what: "Retrieves available vehicle information for a VIN.", input: "17-character VIN", tip: "Do not use to impersonate an owner." },
  { id: 72,  name: "CLICKJACK TEST",   what: "Checks whether framing/clickjacking protections are configured.", input: "URL of an authorized website", auth: true },
  { id: 73,  name: "OPEN REDIRECT",    what: "Tests whether redirect parameters behave safely.", input: "URL of an authorized application", auth: true },
  { id: 74,  name: "CORS WILDCARD",    what: "Detects overly broad CORS configurations.", input: "URL of an authorized website", auth: true },
  { id: 75,  name: "CONTENT SNIFF",    what: "Checks content-type and content-sniffing behavior.", input: "URL" },
  { id: 76,  name: "XSS HEADERS",      what: "Evaluates browser and security headers relevant to XSS protection.", input: "URL" },
  { id: 77,  name: "BREACH CHECK",     what: "Multi-source credential exposure scan — hits LeakCheck.io, HIBP password k-anonymity and OTX.", input: "Email address, password, hash or domain" },
  { id: 78,  name: "HIBP DOMAIN",      what: "Checks breach exposure for a domain via LeakCheck.io and OTX.", input: "Domain (e.g. example.com)" },
  { id: 79,  name: "PHISH CHECK",      what: "Evaluates available phishing indicators for a URL or domain.", input: "URL or domain" },
  { id: 80,  name: "MALWARE URL",      what: "Checks a URL against configured threat-intelligence sources.", input: "Full URL" },
  { id: 81,  name: "PASTE SEARCH",     what: "Searches public paste/index sites and GitHub code search.", input: "Email, username, domain or keyword" },
  { id: 82,  name: "DOMAIN AGE",       what: "Returns domain registration date and age information.", input: "Domain" },
  { id: 83,  name: "BGP PREFIXES",     what: "Returns announced BGP prefixes for an ASN or IP.", input: "ASN (e.g. AS15169) or IP address" },
  { id: 84,  name: "HONEYPOT CHECK",   what: "Checks available honeypot and reputation intelligence for an IP.", input: "IP address" },
  { id: 85,  name: "BLOCKLIST CHECK",  what: "Checks an IP or domain against configured blocklists.", input: "IP address or domain" },
  { id: 86,  name: "EMAIL VALIDATE",   what: "Validates email syntax, domain, and mail server configuration.", input: "Email address" },
  { id: 87,  name: "IPINFO FULL",      what: "Returns comprehensive IP and network information.", input: "IP address" },
  { id: 88,  name: "ABUSE IPDB",       what: "Returns AbuseIPDB reputation and abuse reports.", input: "IP address" },
  { id: 89,  name: "OPEN RESOLVER",    what: "Checks whether a DNS server behaves as an open resolver.", input: "DNS server IP or hostname", auth: true },
  { id: 90,  name: "TRACEROUTE SIM",   what: "Produces a simulated traceroute path for training purposes.", input: "IP address or hostname" },
  { id: 91,  name: "SATELLITE",        what: "Geocodes an address to coordinates or reverse-geocodes lat/lon — returns Google Maps and Earth links.", input: "Address string OR lat,lon (e.g. 37.7749,-122.4194)" },
  { id: 92,  name: "SSL CERT INFO",    what: "Returns TLS certificate details including issuer, expiry and SANs.", input: "Domain" },
  { id: 93,  name: "WAYBACK CHECK",    what: "Checks archive availability for a URL or domain.", input: "URL or domain" },
  { id: 94,  name: "HTTP FINGERPRINT", what: "Identifies observable HTTP characteristics of a server.", input: "URL of an authorized server", auth: true },
  { id: 95,  name: "REVERSE IP",       what: "Returns domains associated with an IP from available datasets.", input: "IP address" },
  { id: 96,  name: "TECH STACK",       what: "Identifies observable technologies used by a website.", input: "URL or domain" },
  { id: 97,  name: "ADMIN FINDER",     what: "Identifies publicly exposed administrative paths on a website.", input: "URL of an authorized website", auth: true, tip: "Do not use to access restricted areas." },
  { id: 98,  name: "ROBOTS SCAN",      what: "Retrieves and analyzes a site's robots.txt file.", input: "Domain" },
  { id: 99,  name: "API PROBE",        what: "Checks documented or approved API endpoints.", input: "API base URL", auth: true },
  { id: 100, name: "CERT HISTORY",     what: "Returns historical TLS certificate records for a domain.", input: "Domain" },

  // ── 101–130 Encoding & Security Testing ───────────────────────────────────
  { id: 101, name: "ENTROPY CALC",    what: "Calculates Shannon entropy for text or binary data.", input: "Any text, password or hex string" },
  { id: 102, name: "STRING EXTRACT",  what: "Extracts readable strings from a block of text or data.", input: "Raw text, hex dump or binary-encoded string" },
  { id: 103, name: "FILE IDENT",      what: "Identifies a file type using magic byte signatures.", input: "File name, path or hex magic bytes" },
  { id: 104, name: "BASE64 CODER",    what: "Encodes or decodes Base64.", input: "Text to encode, or Base64 string to decode" },
  { id: 105, name: "HEX CODER",       what: "Encodes text to hex or decodes hex to text.", input: "Text or hex string" },
  { id: 106, name: "URL CODER",       what: "URL-encodes or decodes a string.", input: "Text to encode or URL-encoded string to decode" },
  { id: 107, name: "HTML CODER",      what: "HTML-encodes or decodes a string.", input: "Text to encode or HTML-encoded string" },
  { id: 108, name: "ROT13",           what: "Applies or removes ROT13 substitution.", input: "Any text" },
  { id: 109, name: "CAESAR CIPHER",   what: "Encodes or decodes text with a Caesar shift.", input: "Text and shift value (e.g. Hello 3)" },
  { id: 110, name: "VIGENERE",        what: "Encodes or decodes text with a Vigenère key.", input: "Text and key (e.g. SECRET mykey)" },
  { id: 111, name: "MORSE CODE",      what: "Converts text to Morse code or Morse code to text.", input: "Text or dot-dash Morse string" },
  { id: 112, name: "JWT DECODE",      what: "Inspects a JWT — decodes header and payload without verifying signature.", input: "JWT string (eyJ…)", tip: "This does NOT confirm the token is authentic." },
  { id: 113, name: "JWT FORGE",       what: "Generates test JWTs for development — do not use against production systems.", input: "Payload JSON and test secret", auth: true },
  { id: 114, name: "HASH CRACK",      what: "Attempts to recover the plaintext behind a hash.", input: "Hash value (MD5/SHA1/SHA256 etc.)", auth: true, tip: "Use only on hashes you own or have explicit permission to audit." },
  { id: 115, name: "WORDLIST GEN",    what: "Generates test wordlists for authorized password auditing.", input: "Base words, patterns or length constraints", auth: true },
  { id: 116, name: "XSS PAYLOADS",    what: "Provides XSS test payload references.", input: "Context type (HTML, attribute, JS, URL)", auth: true, tip: "Use only in authorized applications or a controlled lab." },
  { id: 117, name: "SQLI PAYLOADS",   what: "Provides SQL injection test payload references.", input: "Database type (MySQL, MSSQL, Postgres etc.)", auth: true },
  { id: 118, name: "BANNER GRAB",     what: "Retrieves service banners from a host.", input: "Authorized host:port", auth: true },
  { id: 119, name: "FTP PROBE",       what: "Inspects FTP service info and anonymous-login availability.", input: "Authorized FTP host", auth: true },
  { id: 120, name: "SMTP PROBE",      what: "Inspects SMTP server behavior and capabilities.", input: "Authorized mail server hostname", auth: true },
  { id: 121, name: "SSH FINGERPRINT", what: "Obtains the host-key fingerprint and SSH service info.", input: "Authorized SSH host", auth: true },
  { id: 122, name: "TELNET PROBE",    what: "Inspects service availability and banner for a Telnet host.", input: "Authorized host:port", auth: true },
  { id: 123, name: "DIR BRUTE",       what: "Tests for discoverable paths using a built-in wordlist — runs live HTTP HEAD checks.", input: "Base URL of an authorized web application", auth: true },
  { id: 124, name: "PARAM FUZZ",      what: "Tests documented parameters and generates injection test cases.", input: "URL of an authorized application", auth: true },
  { id: 125, name: "COOKIE FORGE",    what: "Generates synthetic cookies for application testing.", input: "Cookie name, value and attribute flags", auth: true },
  { id: 126, name: "HEADER INJECT",   what: "Generates HTTP header injection test payloads.", input: "Authorized target URL", auth: true },
  { id: 127, name: "SSTI PROBE",      what: "Provides SSTI test payload references.", input: "Template engine type (Jinja2, Twig, Pebble etc.)", auth: true },
  { id: 128, name: "XXE PROBE",       what: "Provides XXE test payload references.", input: "Target XML context", auth: true },
  { id: 129, name: "PATH TRAVERSE",   what: "Provides path traversal test payload references.", input: "Authorized application target", auth: true },
  { id: 130, name: "OPEN PORTS",      what: "Runs a TCP port scan and returns open/reachable ports.", input: "Authorized IP or hostname", auth: true },

  // ── 131–160 Network Security & Threat Intelligence ────────────────────────
  { id: 131, name: "SQL MAP",         what: "SQL injection assessment for authorized applications.", input: "Target URL of an authorized application", auth: true },
  { id: 132, name: "LDAP ENUM",       what: "Enumerates LDAP directory information.", input: "Authorized LDAP server host", auth: true },
  { id: 133, name: "RDP PROBE",       what: "Probes an RDP host for banner and availability info.", input: "Authorized RDP host:port", auth: true },
  { id: 134, name: "FTP ENUM",        what: "Enumerates FTP service information.", input: "Authorized FTP host", auth: true },
  { id: 135, name: "SNMP PROBE",      what: "Probes SNMP for service availability.", input: "Authorized SNMP host", auth: true },
  { id: 136, name: "NTP QUERY",       what: "Queries an NTP server and inspects the response.", input: "NTP server hostname (e.g. pool.ntp.org)" },
  { id: 137, name: "DNS ZONE AXF",    what: "Attempts a DNS AXFR zone transfer against each nameserver.", input: "Authorized domain", auth: true },
  { id: 138, name: "DHCP PROBE",      what: "Guides DHCP probe techniques for networks you administer.", input: "Network interface or CIDR range", auth: true },
  { id: 139, name: "ARP SCAN",        what: "Guides ARP scanning for networks you own or administer.", input: "Network interface or CIDR range", auth: true },
  { id: 140, name: "ICMP PROBE",      what: "Sends ICMP pings to check reachability of an authorized host.", input: "Authorized IP or hostname", auth: true },
  { id: 141, name: "OS FINGERPRINT",  what: "Infers OS characteristics from HTTP response headers.", input: "Authorized host URL", auth: true },
  { id: 142, name: "SERVICE VER",     what: "Identifies service versions by grabbing banners from common ports.", input: "Authorized host", auth: true },
  { id: 143, name: "VULN SCAN",       what: "Searches NVD for CVEs matching a service name.", input: "Service name or keyword (e.g. Apache 2.4)", auth: true },
  { id: 144, name: "EXPLOIT SEARCH",  what: "Searches vulnerability databases for publicly documented exploit references.", input: "CVE ID, software name or keyword", tip: "Research/reference only." },
  { id: 145, name: "ZERO DAY REF",    what: "Research and reference interface for recent critical vulnerability intelligence.", input: "Software name, vendor or CVE ID" },
  { id: 146, name: "CVE DETAILS",     what: "Returns full NVD record for a CVE — CVSS score, vector, references.", input: "CVE ID (e.g. CVE-2021-44228)" },
  { id: 147, name: "NVD SEARCH",      what: "Searches the NVD vulnerability database.", input: "Search term, software or vendor name" },
  { id: 148, name: "MITRE ATT&CK",    what: "Looks up techniques, groups and software in the MITRE ATT&CK framework.", input: "Technique ID (T1055) or name keyword" },
  { id: 149, name: "THREAT MODEL",    what: "Generates a STRIDE threat model for an application or system.", input: "System description or architecture summary" },
  { id: 150, name: "RED TEAM REPORT", what: "Structures authorized assessment findings into a report.", input: "Target name + authorized assessment findings", auth: true },
  { id: 151, name: "CVE LOOKUP",      what: "Returns vulnerability information for a CVE identifier.", input: "CVE ID (e.g. CVE-2023-44487)" },
  { id: 152, name: "MAC LOOKUP",      what: "Returns manufacturer information for a MAC address or OUI.", input: "MAC address or OUI prefix (e.g. 00:1A:2B)" },
  { id: 153, name: "SHODAN PROBE",    what: "Queries Shodan's public intelligence database.", input: "IP address, hostname or search query" },
  { id: 154, name: "THREAT INTEL",    what: "Searches configured threat-intelligence sources.", input: "IP, domain, hash or indicator" },
  { id: 155, name: "RIPE STAT",       what: "Returns RIPE NCC network intelligence for an IP or ASN.", input: "IP address or ASN" },
  { id: 156, name: "DUCK INTEL",      what: "Searches DuckDuckGo and public intelligence sources.", input: "Search query" },
  { id: 157, name: "AES CIPHER",      what: "Encrypts or decrypts data using a supplied key.", input: "Text and AES key (hex or passphrase)" },
  { id: 158, name: "RSA KEYGEN",      what: "Generates RSA key pairs for cryptographic use or testing.", input: "Key length in bits (e.g. 2048, 4096)" },
  { id: 159, name: "PASSPHRASE GEN",  what: "Generates random secure passphrases.", input: "Number of words and optional separator" },
  { id: 160, name: "HMAC CALC",       what: "Calculates an HMAC for supplied data and key.", input: "Data string and secret key" },

  // ── 161–190 Crypto, Email, Files & Media ──────────────────────────────────
  { id: 161, name: "HASH COMPARE",    what: "Compares two hash values to check if they match.", input: "Two hash strings" },
  { id: 162, name: "CIDR CALC",       what: "Returns network, broadcast, usable range and mask for a CIDR.", input: "CIDR notation (e.g. 192.168.1.0/24)" },
  { id: 163, name: "IP CONVERT",      what: "Converts between IP address representations (dotted, decimal, hex).", input: "IP address in any supported format" },
  { id: 164, name: "SUBNET CALC",     what: "Calculates subnet information from an address and mask.", input: "IP address and subnet mask" },
  { id: 165, name: "PORT REFERENCE",  what: "Returns the common service associated with a port number.", input: "Port number (e.g. 443)" },
  { id: 166, name: "HTTP STATUS",     what: "Returns description and reference for an HTTP status code.", input: "Status code (e.g. 403, 502)" },
  { id: 167, name: "EMAIL HEADER",    what: "Parses email headers to extract routing and authentication info.", input: "Paste raw email headers" },
  { id: 168, name: "USER AGENT",      what: "Identifies browser and device characteristics from a user-agent string.", input: "User-Agent header string" },
  { id: 169, name: "IOC EXTRACT",     what: "Extracts IPs, domains, hashes and URLs from threat-intelligence text.", input: "Paste raw threat report, log or article text" },
  { id: 170, name: "TYPOSQUAT",       what: "Generates and checks likely lookalike domains for brand monitoring.", input: "Domain name (e.g. mycompany.com)" },
  { id: 171, name: "DOMAIN GEN",      what: "Generates domain-name candidates for projects or testing.", input: "Base word, keywords or brand name" },
  { id: 172, name: "WEB SCRAPER",     what: "Scrapes publicly accessible pages where permitted.", input: "URL (must be publicly accessible)", tip: "Respect site terms of service and robots.txt." },
  { id: 173, name: "KEY STRENGTH",    what: "Estimates password/passphrase strength and entropy.", input: "Password or passphrase" },
  { id: 174, name: "CIPHER SUITE",    what: "Reference table of cryptographic cipher suites with strength ratings.", input: "Cipher name or search term" },
  { id: 175, name: "TLS ANALYZER",    what: "Connects to a domain and inspects TLS version, cipher, cert expiry and SANs.", input: "Domain (e.g. example.com)", auth: true },
  { id: 176, name: "DANE CHECK",      what: "Checks TLSA and DANE DNS records for a domain.", input: "Domain" },
  { id: 177, name: "SMTP TLS",        what: "Inspects TLS configuration on a mail server.", input: "Mail server hostname" },
  { id: 178, name: "MAIL SECURITY",   what: "Aggregates SPF, DMARC, MX and MTA-STS records in one report.", input: "Domain" },
  { id: 179, name: "HIBP EMAIL",      what: "Multi-source email breach scan — LeakCheck.io + OTX + MX check.", input: "Email address" },
  { id: 180, name: "LEAK CHECK",      what: "Searches LeakCheck.io breach/leak database for an email or username.", input: "Email address or username" },
  { id: 181, name: "BREACH INTEL",    what: "Searches OTX breach intelligence for a domain or email.", input: "Domain or email address" },
  { id: 182, name: "PASTE INTEL",     what: "Searches supported paste intelligence sources.", input: "Email, username or domain" },
  { id: 183, name: "DARK WEB INTEL",  what: "Queries lawful threat-intelligence sources for dark web references.", input: "Domain, keyword or IOC", tip: "Informational only. Does not facilitate access to illicit content." },
  { id: 184, name: "FCC CALLSIGN",    what: "Returns available FCC license information for a callsign.", input: "Amateur radio callsign (e.g. W1AW)" },
  { id: 185, name: "HAM LOOKUP",      what: "Amateur-radio callsign lookup.", input: "Callsign" },
  { id: 186, name: "DMR LOOKUP",      what: "Digital Mobile Radio identifier lookup.", input: "DMR ID number" },
  { id: 187, name: "STEG DETECT",     what: "Inspects an image or file for indicators of steganographic content.", input: "File name, URL or image type" },
  { id: 188, name: "METADATA STRIP",  what: "Guides removal of metadata from supported file types.", input: "File type (image, PDF, Office)" },
  { id: 189, name: "IMAGE EXIF",      what: "Displays EXIF metadata from an image file.", input: "Image file URL or file type" },
  { id: 190, name: "PDF METADATA",    what: "Displays available metadata from a PDF file.", input: "PDF URL or file info" },

  // ── 191–238 Forensics, Automation & Utilities ─────────────────────────────
  { id: 191, name: "OFFICE METADATA", what: "Displays available metadata from an Office document.", input: "Filename or file info" },
  { id: 192, name: "AUDIO METADATA",  what: "Displays metadata from an audio file.", input: "Audio file URL or filename" },
  { id: 193, name: "VIDEO METADATA",  what: "Displays metadata from a video file.", input: "Video file URL or filename" },
  { id: 194, name: "FILE TIMELINE",   what: "Analyzes filesystem timestamps to reconstruct a file activity timeline.", input: "File path or metadata string" },
  { id: 195, name: "LOG PARSE",       what: "Parses authorized logs into structured records.", input: "Paste raw log lines (Apache, nginx, syslog etc.)" },
  { id: 196, name: "SIEM QUERY",      what: "Generates Splunk, Elastic KQL, QRadar AQL and Sigma rules for an IOC.", input: "IP address, domain, hash or keyword" },
  { id: 197, name: "YARA SCAN",       what: "Generates YARA rule templates for authorized file scanning.", input: "IOC, string pattern or malware family name" },
  { id: 198, name: "MEMORY DUMP",     what: "Guides memory acquisition and analysis for systems you administer.", input: "OS type and tool name (e.g. Windows winpmem)", auth: true },
  { id: 199, name: "PROC INSPECT",    what: "Guides process inspection on your own or local test system.", input: "OS type or process name", auth: true },
  { id: 200, name: "ROOTKIT CHECK",   what: "Guides defensive rootkit detection on your own system.", input: "OS type (Linux/Windows)", auth: true },
  { id: 201, name: "BGP ROUTE",       what: "Returns BGP routing information for an IP, ASN or prefix.", input: "IP address, ASN or prefix" },
  { id: 202, name: "REGEX TEST",      what: "Tests a regex pattern against a string and shows matches/groups.", input: "Pattern and test string (e.g. /\\d+/ hello123)" },
  { id: 203, name: "CRON PARSER",     what: "Parses a cron expression and shows its next scheduled runs.", input: "Cron expression (e.g. 0 */6 * * *)" },
  { id: 204, name: "TZ CONVERT",      what: "Converts a date/time between time zones.", input: "Datetime string and target time zone (e.g. 2024-01-15 09:00 UTC America/New_York)" },
  { id: 205, name: "RAND DATA",       what: "Generates synthetic random test data.", input: "Data type and count (e.g. uuid 10 or email 5)" },
  { id: 206, name: "PASS AUDIT",      what: "Audits password strength for authorized test passwords.", input: "Password or passphrase", auth: true },
  { id: 207, name: "CDN ORIGIN",      what: "Analyzes public CDN-related information for a domain.", input: "Domain or URL" },
  { id: 208, name: "TOR CHECK",       what: "Determines whether an IP appears associated with Tor exit nodes.", input: "IP address" },
  { id: 209, name: "URL SCAN",        what: "Scans a URL using configured reputation and security services.", input: "Full URL" },
  { id: 210, name: "ARCHIVE DEPTH",   what: "Searches web archives at multiple historical depths.", input: "URL or domain" },
  { id: 211, name: "NPM AUDIT",       what: "Analyzes npm packages for known dependency vulnerabilities.", input: "Package name and version (e.g. lodash@4.17.15)" },
  { id: 212, name: "TOKEN COUNT",     what: "Counts tokens using the selected tokenizer.", input: "Text to tokenize" },
  { id: 213, name: "EVIDENCE HASH",   what: "Calculates cryptographic hashes of data for evidence integrity.", input: "Text, file content or hex data" },
  { id: 214, name: "QR ENCODE",       what: "Converts text or data into a scannable QR code.", input: "Any text, URL or payload" },
  { id: 215, name: "CODE STATS",      what: "Analyzes source code for lines, files and language breakdown.", input: "Code snippet or project file list" },
  { id: 216, name: "JSON FORMAT",     what: "Validates and pretty-prints JSON.", input: "Raw JSON string" },
  { id: 217, name: "XML PARSE",       what: "Parses and inspects an XML document.", input: "XML string" },
  { id: 218, name: "YAML VALID",      what: "Validates YAML and checks for syntax errors.", input: "YAML string" },
  { id: 219, name: "BIN CONVERT",     what: "Converts between binary, decimal, hex and octal representations.", input: "Number and source base (e.g. 1010 base2)" },
  { id: 220, name: "DATE CALC",       what: "Calculates the difference or offset between dates.", input: "Date(s) in ISO format (e.g. 2024-01-01 to 2024-06-30)" },
  { id: 221, name: "UNIT CONVERT",    what: "Converts between measurement units.", input: "Value, source unit and target unit (e.g. 100 km mi)" },
  { id: 222, name: "COLOR CONVERT",   what: "Converts between color representations (HEX, RGB, HSL, CMYK).", input: "Color value (e.g. #ff6600 or rgb(255,102,0))" },
  { id: 223, name: "WORDCOUNT",       what: "Counts words, characters and lines in a text block.", input: "Paste any text" },
  { id: 224, name: "TEXT DIFF",       what: "Compares two text inputs and highlights differences.", input: "Two text blocks separated by a delimiter" },
  { id: 225, name: "NUM BASE",        what: "Converts numbers between supported bases (2, 8, 10, 16).", input: "Number and base (e.g. 255 base10)" },
  { id: 226, name: "ASCII TABLE",     what: "Reference for ASCII character codes and their representations.", input: "Character or decimal value to look up" },
  { id: 227, name: "UNICODE INFO",    what: "Returns properties for a Unicode character or code point.", input: "Character or U+code point (e.g. U+1F600)" },
  { id: 228, name: "CIPHER REF",      what: "Cryptography and cipher reference database.", input: "Cipher name or algorithm keyword" },
  { id: 229, name: "PORT SCANNER+",   what: "Extended authorized port and service assessment.", input: "Authorized IP or hostname with optional port range", auth: true },
  { id: 230, name: "DMARC ANALYZE",   what: "Analyzes DMARC policy and related records for a domain.", input: "Domain" },
  { id: 231, name: "GREYNOISE INTEL", what: "Queries GreyNoise threat intelligence for an IP.", input: "IP address" },
  { id: 232, name: "URLSCAN LOOKUP",  what: "Searches URLScan.io intelligence for a URL, domain or IP.", input: "URL, domain or IP address" },
  { id: 233, name: "BGPVIEW ROUTING", what: "Returns BGP routing intelligence for an IP, ASN or prefix.", input: "IP address, ASN or prefix" },
  { id: 234, name: "HACKERTARGET REVERSE", what: "Reverse-looks up domains hosted on an IP using HackerTarget.", input: "IP address" },
  { id: 235, name: "LEAKIX EXPOSED",  what: "Queries LeakIX for exposed services associated with a host.", input: "IP address or domain" },
  { id: 236, name: "SPAMHAUS DNSBL",  what: "Checks an IP against Spamhaus DNSBL blocklists.", input: "IP address" },
  { id: 237, name: "CMS FINGERPRINT", what: "Identifies the CMS platform powering a website.", input: "URL or domain" },
  { id: 238, name: "NIKTO HEADERS",   what: "Inspects HTTP response headers for common misconfigurations.", input: "URL of an authorized website", auth: true },
];

const SECTIONS = [
  { label: "ALL",       range: [1, 238] },
  { label: "001–030",   range: [1, 30],   title: "Core OSINT & Identity" },
  { label: "031–060",   range: [31, 60],  title: "Social, Developer & Web" },
  { label: "061–100",   range: [61, 100], title: "DNS, Web & Infrastructure" },
  { label: "101–130",   range: [101, 130],title: "Encoding & Security Testing" },
  { label: "131–160",   range: [131, 160],title: "Network Security & Threat Intel" },
  { label: "161–190",   range: [161, 190],title: "Crypto, Email & Files" },
  { label: "191–238",   range: [191, 238],title: "Forensics, Automation & Utilities" },
];

export default function Guide() {
  const [, navigate] = useLocation();
  const { data: user } = useAuthMe();
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("ALL");
  const [authOnly, setAuthOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sec = SECTIONS.find((s) => s.label === section)!;
    return MODULES.filter((m) => {
      const inRange = m.id >= sec.range[0]! && m.id <= sec.range[1]!;
      if (!inRange) return false;
      if (authOnly && !m.auth) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.what.toLowerCase().includes(q) ||
        m.input.toLowerCase().includes(q) ||
        String(m.id).padStart(3, "0").includes(q)
      );
    });
  }, [search, section, authOnly]);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-primary/10 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="text-primary font-bold tracking-[0.2em] text-sm drop-shadow-[0_0_8px_rgba(0,204,255,0.4)]"
        >
          SWEPT-SENTINEL
        </button>
        <div className="flex gap-4 text-xs tracking-widest">
          <button onClick={() => navigate("/modules")} className="text-primary/50 hover:text-primary transition-colors">MODULES</button>
          <button onClick={() => navigate("/pricing")} className="text-primary/50 hover:text-primary transition-colors">PRICING</button>
          {user ? (
            <button onClick={() => navigate("/dashboard")} className="border border-primary/50 text-primary px-3 py-1 hover:bg-primary/10 transition-colors">
              LAUNCH APP
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-primary/50 hover:text-primary transition-colors">LOGIN</button>
              <button onClick={() => navigate("/register")} className="border border-primary/50 text-primary px-3 py-1 hover:bg-primary/10 transition-colors">REGISTER</button>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-1">SWEPT SENTINEL // DOCUMENTATION</div>
          <h1 className="text-2xl font-bold tracking-[0.1em] text-primary mb-1">MODULE GUIDE</h1>
          <p className="text-xs text-primary/50 mb-4">
            Complete usage instructions for all {MODULES.length} modules — what each accepts, what it returns, and when authorization is required.
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30 text-xs">[SEARCH]</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="module name, ID, or keyword…"
                className="w-full bg-background border border-primary/20 text-foreground text-xs font-mono pl-20 pr-3 py-2 focus:outline-none focus:border-primary placeholder:text-primary/20"
              />
            </div>

            {/* Auth toggle */}
            <button
              onClick={() => setAuthOnly((v) => !v)}
              className={`px-3 py-2 text-[10px] tracking-widest border transition-colors shrink-0 ${
                authOnly
                  ? "border-amber-400/60 text-amber-400 bg-amber-400/10"
                  : "border-primary/20 text-primary/40 hover:border-primary/40 hover:text-primary/60"
              }`}
            >
              {authOnly ? "⚠ AUTHORIZED ONLY" : "⚠ SHOW AUTH REQUIRED"}
            </button>
          </div>

          {/* Section tabs */}
          <div className="flex flex-wrap gap-1 mt-3">
            {SECTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setSection(s.label)}
                className={`px-2 py-1 text-[10px] tracking-widest border transition-colors ${
                  section === s.label
                    ? "border-primary text-primary bg-primary/10"
                    : "border-primary/15 text-primary/35 hover:border-primary/40 hover:text-primary/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Result count */}
          <div className="mt-2 text-[10px] text-primary/30 tracking-widest">
            {filtered.length} MODULE{filtered.length !== 1 ? "S" : ""} SHOWN
          </div>
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="max-w-7xl mx-auto">

          {/* Legend */}
          <div className="flex gap-4 mb-5 text-[10px] tracking-widest text-primary/40">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400/70" />
              AUTHORIZED TARGET REQUIRED
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary/50" />
              OPEN INTELLIGENCE
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-primary/30 text-xs tracking-widest py-16 text-center">
              [NO MODULES MATCH QUERY]
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-primary/5">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className={`bg-background px-4 py-3 border-l-2 transition-colors ${
                    m.auth ? "border-amber-400/40 hover:border-amber-400/70" : "border-primary/15 hover:border-primary/40"
                  }`}
                >
                  {/* Module ID + name + badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-primary/30 text-[10px] shrink-0">
                      [{String(m.id).padStart(3, "0")}]
                    </span>
                    <span className={`text-xs font-bold tracking-wider ${m.auth ? "text-amber-400" : "text-primary"}`}>
                      {m.name}
                    </span>
                    {m.auth && (
                      <span className="ml-auto text-[9px] tracking-widest text-amber-400/70 border border-amber-400/30 px-1.5 py-0.5 shrink-0">
                        AUTH REQUIRED
                      </span>
                    )}
                  </div>

                  {/* What it does */}
                  <p className="text-[11px] text-primary/65 leading-relaxed mb-1.5">{m.what}</p>

                  {/* Input */}
                  <div className="flex gap-1.5 items-start">
                    <span className="text-[9px] text-primary/30 tracking-widest shrink-0 mt-0.5">INPUT</span>
                    <span className="text-[10px] text-primary/50 font-mono">{m.input}</span>
                  </div>

                  {/* Tip */}
                  {m.tip && (
                    <div className="flex gap-1.5 items-start mt-1">
                      <span className="text-[9px] text-amber-400/50 tracking-widest shrink-0 mt-0.5">NOTE</span>
                      <span className="text-[10px] text-amber-400/60">{m.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Auth notice */}
          <div className="mt-8 border border-amber-400/20 p-4 text-[10px] text-amber-400/60 leading-relaxed tracking-wide">
            <span className="text-amber-400 font-bold">⚠ AUTHORIZED USE POLICY</span>
            {"  "}Modules marked AUTH REQUIRED — including active probes, payload generators, credential testing, and forensic tools — must only be used against systems, networks, or data that you own or have explicit written permission to assess. Using these modules against third-party systems without authorization may violate computer fraud, privacy, and anti-hacking laws in your jurisdiction. Swept Sentinel is an authorized security testing and OSINT research platform.
          </div>
        </div>
      </div>
    </div>
  );
}
