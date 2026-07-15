"""YAML Valid — Module 218. Parse, validate, and analyze YAML."""
import sys, re

def simple_yaml_parse(text):
    """Minimal YAML parser for validation (no PyYAML dependency needed)."""
    lines = text.split('\n')
    errors = []
    warnings = []
    indent_stack = [0]

    for i, line in enumerate(lines, 1):
        stripped = line.rstrip()
        if not stripped or stripped.lstrip().startswith('#'):
            continue
        indent = len(stripped) - len(stripped.lstrip())
        content = stripped.lstrip()

        # Tab check
        if '\t' in line:
            errors.append(f"Line {i}: Tab character found — YAML requires spaces")

        # Key-value
        if ':' in content and not content.startswith('-'):
            key_part = content.split(':', 1)[0]
            if key_part and not key_part[0] in ('"', "'", '[', '{'):
                pass  # valid key

        # Unsafe patterns
        if re.match(r'!!python/', content):
            warnings.append(f"Line {i}: !!python/ tag — deserialization risk (Python YAML)")
        if re.match(r'!!ruby/', content):
            warnings.append(f"Line {i}: !!ruby/ tag — deserialization risk")
        if re.match(r'!<', content):
            warnings.append(f"Line {i}: Custom tag — may execute arbitrary code on load")

    return errors, warnings

def detect_yaml_type(text):
    """Guess what kind of YAML this is."""
    if re.search(r'\bapiVersion\b.*\bkind\b', text):
        return "Kubernetes manifest"
    if re.search(r'\bjobs\b|\bsteps\b|\bworkflow\b', text, re.I):
        return "CI/CD pipeline (GitHub Actions / GitLab CI)"
    if re.search(r'\bservices\b.*\bimage\b', text, re.I):
        return "Docker Compose"
    if re.search(r'\bansible\b|\bhosts\b.*\btasks\b', text, re.I):
        return "Ansible playbook"
    if re.search(r'\bdependencies\b.*\bversion\b', text, re.I):
        return "Package manifest"
    return "Generic YAML"

def main():
    print("[MODULE 218] YAML VALIDATOR & ANALYZER")
    print("[SOURCE]     Local YAML parser — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  Paste YAML content as target")
        print("[USAGE]  check:YAML_CONTENT")
        sys.exit(0)

    yaml_text = raw.replace("\\n", "\n").replace("\\t", "\t")
    if yaml_text.startswith("check:"):
        yaml_text = yaml_text[6:]

    lines = yaml_text.split('\n')
    errors, warnings = simple_yaml_parse(yaml_text)

    doc_type = detect_yaml_type(yaml_text)
    keys = re.findall(r'^[\s-]*([a-zA-Z_][a-zA-Z0-9_-]*)\s*:', yaml_text, re.M)
    unique_keys = list(dict.fromkeys(keys))

    print(f"[VALID YAML]     {'NO — ' + errors[0] if errors else 'YES (basic check)'}")
    print(f"[DOCUMENT TYPE]  {doc_type}")
    print(f"[LINES]          {len(lines)}")
    print(f"[NON-EMPTY]      {sum(1 for l in lines if l.strip() and not l.strip().startswith('#'))}")
    print(f"[COMMENTS]       {sum(1 for l in lines if l.strip().startswith('#'))}")
    print(f"[TOP KEYS]       {', '.join(unique_keys[:15])}")
    print()

    if errors:
        print("[ERRORS]")
        for e in errors: print(f"  ✗  {e}")
        print()
    if warnings:
        print("[SECURITY WARNINGS]")
        for w in warnings: print(f"  ⚠  {w}")
        print()

    # Sensitive data scan
    secrets_found = []
    secret_patterns = [
        (r'password\s*:\s*\S+', "password"),
        (r'secret\s*:\s*\S+', "secret"),
        (r'api_key\s*:\s*\S+', "api_key"),
        (r'token\s*:\s*\S+', "token"),
        (r'private_key', "private_key"),
        (r'-----BEGIN.*PRIVATE KEY', "embedded private key"),
    ]
    for pattern, label in secret_patterns:
        if re.search(pattern, yaml_text, re.I):
            secrets_found.append(label)

    if secrets_found:
        print("[SENSITIVE DATA DETECTED]")
        for s in secrets_found:
            print(f"  ⚠  '{s}' field found — ensure this is not committed to version control")
        print()
    else:
        print("[SENSITIVE DATA]  None detected")

    if not errors and not warnings:
        print("[STATUS]  YAML appears well-formed with no security concerns")

    print()
    print("[DONE] YAML validation complete.")

if __name__ == "__main__":
    main()
