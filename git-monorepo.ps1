$gitPath = "C:\Users\ELCOT\.gemini\antigravity\scratch\tools\git\cmd\git.exe"
$baseDir = "C:\Users\ELCOT\.gemini\antigravity\scratch\psy-care"

# 1. Clean up nested git folders
if (Test-Path "$baseDir\backend\.git") {
    Remove-Item -Path "$baseDir\backend\.git" -Recurse -Force | Out-Null
    Write-Host "Removed backend/.git"
}
if (Test-Path "$baseDir\frontend\.git") {
    Remove-Item -Path "$baseDir\frontend\.git" -Recurse -Force | Out-Null
    Write-Host "Removed frontend/.git"
}

# 2. Init root git repo
cd $baseDir
& $gitPath init

# Configure local commits
& $gitPath config user.name "maniz1407"
& $gitPath config user.email "maniz1407@github.local"

# Set remote origin
& $gitPath remote add origin "https://github.com/maniz1407/PsyCare.git"

# Add and commit
& $gitPath add .
& $gitPath commit -m "Initial commit of PsyCare monorepo"
& $gitPath branch -M main

Write-Host "Unified monorepo git initialized and remote pointed to GitHub."
