"""XML Parse — Module 217. Parse, validate, and analyze XML/HTML."""
import sys, re
try:
    import xml.etree.ElementTree as ET
    import xml.dom.minidom as minidom
    XML_OK = True
except: XML_OK = False

def pretty(xml_str):
    try:
        dom = minidom.parseString(xml_str)
        return dom.toprettyxml(indent="  ")
    except: return xml_str

def count_nodes(elem, depth=0):
    count = 1
    for child in elem:
        count += count_nodes(child, depth+1)
    return count

def find_xxe_risks(xml_str):
    risks = []
    if re.search(r'<!DOCTYPE', xml_str, re.I):
        risks.append("DOCTYPE declaration found — potential XXE vector")
    if re.search(r'<!ENTITY', xml_str, re.I):
        risks.append("ENTITY declaration found — XXE risk if external entities enabled")
    if re.search(r'SYSTEM\s+["\']', xml_str, re.I):
        risks.append("SYSTEM identifier — potential file:// or http:// entity injection")
    if re.search(r'file://', xml_str, re.I):
        risks.append("file:// URI in XML — direct XXE exploitation attempt")
    return risks

def main():
    print("[MODULE 217] XML PARSER & ANALYZER")
    print("[SOURCE]     Python xml.etree stdlib — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print('[USAGE]  <root><item id="1">val</item></root>  — parse XML')
        print("[USAGE]  pretty:XML                             — pretty-print")
        print("[USAGE]  xpath:EXPR:XML                        — XPath query")
        sys.exit(0)

    if raw.startswith("pretty:"):
        xml_str = raw[7:]
        print("[PRETTY PRINT]")
        print(pretty(xml_str))
        sys.exit(0)

    if raw.startswith("xpath:"):
        parts = raw[6:].split(":", 1)
        if len(parts) < 2:
            print("[ERROR] format: xpath:EXPR:XML"); sys.exit(1)
        expr, xml_str = parts
        try:
            root = ET.fromstring(xml_str)
            matches = root.findall(expr)
            print(f"[XPATH]    {expr}")
            print(f"[MATCHES]  {len(matches)}")
            for i, m in enumerate(matches, 1):
                print(f"  [{i}] tag={m.tag}  text={m.text}  attribs={dict(m.attrib)}")
        except Exception as e:
            print(f"[ERROR] {e}")
        sys.exit(0)

    # Default: parse + analyze
    xml_str = raw.replace("\\n", "\n").replace("\\t", "\t")
    try:
        root = ET.fromstring(xml_str)
        valid = True
        error = None
    except ET.ParseError as e:
        valid = False
        error = str(e)

    print(f"[VALID XML]  {'YES' if valid else 'NO'}")
    if not valid:
        print(f"[ERROR]      {error}")
        print()
        print("[HINT] Common XML errors:")
        print("  - Unclosed tags")
        print("  - Unescaped & < > characters (use &amp; &lt; &gt;)")
        print("  - Multiple root elements")
        sys.exit(0)

    total_nodes = count_nodes(root)
    max_depth = [0]
    def depth(elem, d=0):
        max_depth[0] = max(max_depth[0], d)
        for c in elem: depth(c, d+1)
    depth(root)

    all_tags = set()
    all_attribs = set()
    def collect(elem):
        all_tags.add(elem.tag)
        all_attribs.update(elem.attrib.keys())
        for c in elem: collect(c)
    collect(root)

    print(f"[ROOT TAG]   {root.tag}")
    print(f"[TOTAL NODES]{total_nodes}")
    print(f"[MAX DEPTH]  {max_depth[0]}")
    print(f"[UNIQUE TAGS]{len(all_tags)}: {', '.join(sorted(all_tags)[:20])}")
    if all_attribs:
        print(f"[ATTRIBUTES] {', '.join(sorted(all_attribs)[:20])}")
    print()

    # XXE security analysis
    risks = find_xxe_risks(xml_str)
    if risks:
        print("[SECURITY RISKS]")
        for r in risks: print(f"  ⚠  {r}")
    else:
        print("[SECURITY]   No XXE risks detected")
    print()

    # Show structure
    print("[STRUCTURE]")
    def show(elem, indent=0):
        attrib_str = " ".join(f'{k}="{v}"' for k,v in elem.attrib.items())
        text = (elem.text or "").strip()[:40]
        children = len(list(elem))
        print(f"{'  '*indent}<{elem.tag}{' '+attrib_str if attrib_str else ''}> {text or ''} ({children} children)")
        for c in list(elem)[:5]:
            show(c, indent+1)
        if len(list(elem)) > 5:
            print(f"{'  '*(indent+1)}... ({len(list(elem))-5} more)")
    show(root)

    print()
    print("[DONE] XML parse complete.")

if __name__ == "__main__":
    main()
