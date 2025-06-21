import subprocess

companies = [
    "BCOLOMBIA",
    "ECOPETROL",
    "NU",
    "PFDAVVNDA"
]

for name in companies:
    subprocess.run(["python", f"src/scripts/{name}-price-history.py"])