import subprocess
import datetime
import os

script_folder = "src/scripts"
this_script_prefix = "update"

# Step 0: Detect all relevant scripts
companies = []

for filename in os.listdir(script_folder):
    if filename.endswith("-price-history.py") and not filename.startswith(this_script_prefix):
        company = filename.split("-")[0]  # Extract the company name before the first dash
        companies.append(company)

# Step 1: Run update scripts
for company in companies:
    print(f"Updating {company}...")
    result = subprocess.run(["python", f"{script_folder}/{company}-price-history.py"])
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
