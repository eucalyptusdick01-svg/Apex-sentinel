"""JSON Format — Module 216. Usage: json_format.py '{"key":"value"}' or json_format.py "min:JSON" """
import sys, json, re

def analyze_json(data, depth=0, path="$"):
    stats = {"nodes":0, "strings":0, "numbers":0, "bools":0, "nulls":0,
             "objects":0, "arrays":0, "max_depth":depth, "paths":[]}

    def walk(obj, d, p):
        stats["nodes"] += 1
        stats["max_depth"] = max(stats["max_depth"], d)
        if isinstance(obj, dict):
            stats["objects"] += 1
            for k, v in obj.items():
                walk(v, d+1, f"{p}.{k}")
        elif isinstance(obj, list):
            stats["arrays"] += 1
            for i, v in enumerate(obj):
                walk(v, d+1, f"{p}[{i}]")
        elif isinstance(obj, str):
            stats["strings"] += 1
            if d <= 2:
                stats["paths"].append(f"{p} = {obj!r}")
        elif isinstance(obj, bool):
            stats["bools"] += 1
        elif isinstance(obj, (int, float)):
            stats["numbers"] += 1
        elif obj is None:
            stats["nulls"] += 1
    walk(data, depth, path)
    return stats

def main():
    print("[MODULE 216] JSON FORMAT")
    print("[SOURCE]     Python json stdlib — format, validate, minify, analyze")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  json_format.py '{\"name\":\"Alice\",\"age\":30}'")
        print("         json_format.py 'min:{\"name\":\"Alice\"}'   (minify)")
        print("         json_format.py 'get:.name:{\"name\":\"Alice\"}'  (extract path)")
        sys.exit(0)

    mode = "pretty"
    json_str = raw

    if raw.lower().startswith("min:"):
        mode = "minify"
        json_str = raw[4:]
    elif raw.lower().startswith("get:"):
        rest = raw[4:]
        colon = rest.index(":")
        path_expr = rest[:colon]
        json_str  = rest[colon+1:]
        mode = "get"
    elif raw.lower().startswith("validate:"):
        mode = "validate"
        json_str = raw[9:]

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"[ERROR]  Invalid JSON: {e}")
        print(f"[LINE]   {e.lineno}  col {e.colno}")
        # Try to show context
        lines = json_str.split("\n")
        if e.lineno <= len(lines):
            print(f"[CONTEXT] {lines[e.lineno-1]}")
            print(f"          {'~'*(e.colno-1)}^")
        sys.exit(1)

    if mode == "validate":
        print(f"[VALID]  ✓ JSON is valid")
        stats = analyze_json(data)
        print(f"[STATS]")
        for k, v in stats.items():
            if k != "paths":
                print(f"  {k:12s}  {v}")
        sys.exit(0)

    if mode == "minify":
        result = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
        print(f"[MINIFIED]  ({len(json_str)} → {len(result)} bytes, -{100*(len(json_str)-len(result))//max(len(json_str),1)}%)")
        print()
        print(result)
        sys.exit(0)

    if mode == "get":
        # Simple path expression: .key or .key.subkey or [0]
        obj = data
        try:
            for part in re.split(r'\.(?=[^\]]+)', path_expr.lstrip(".")):
                if "[" in part:
                    key, _, idx = part.partition("[")
                    idx = int(idx.rstrip("]"))
                    if key:
                        obj = obj[key]
                    obj = obj[idx]
                elif part:
                    obj = obj[part]
            print(f"[PATH]   {path_expr}")
            print(f"[VALUE]  {json.dumps(obj, indent=2, ensure_ascii=False)}")
        except (KeyError, IndexError, TypeError) as e:
            print(f"[ERROR]  Path not found: {e}")
        sys.exit(0)

    # Pretty print
    pretty = json.dumps(data, indent=2, ensure_ascii=False)
    print(f"[FORMATTED]  ({len(json_str)} → {len(pretty)} bytes)")
    print()
    print(pretty)
    print()
    stats = analyze_json(data)
    print(f"[ANALYSIS]")
    print(f"  Type:       {type(data).__name__}")
    print(f"  Nodes:      {stats['nodes']}")
    print(f"  Objects:    {stats['objects']}")
    print(f"  Arrays:     {stats['arrays']}")
    print(f"  Strings:    {stats['strings']}")
    print(f"  Numbers:    {stats['numbers']}")
    print(f"  Booleans:   {stats['bools']}")
    print(f"  Nulls:      {stats['nulls']}")
    print(f"  Max depth:  {stats['max_depth']}")

    print()
    print("[DONE] JSON format complete.")

if __name__ == "__main__":
    main()
