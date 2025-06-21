import subprocess
import datetime

# Step 1: Run your update scripts
companies = ["BCOLOMBIA", "ECOPETROL", "PFDAVVNDA"]

for company in companies:
    print(f"Updating {company}...")
    result = subprocess.run(["python", f"src/scripts/{company}-price-history.py"])
    if result.returncode != 0:
        print(f"❌ Error updating {company}")
        exit(1)

# Step 2: Git add the updated files
print("Staging changes...")
subprocess.run(["git", "add", "src/data/*.ts"], shell=True)

# Step 3: Commit with timestamp
commit_message = f"Update price data: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
print("Committing changes...")
subprocess.run(["git", "commit", "-m", commit_message], shell=True)

# Step 4: Push to GitHub
print("Pushing to GitHub...")
push_result = subprocess.run(["git", "push"], shell=True)

if push_result.returncode == 0:
    print("✅ Push successful!")
else:
    print("❌ Push failed.")
