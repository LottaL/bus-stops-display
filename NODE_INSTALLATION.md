# Node.js Installation Guide

## Windows

### Option 1: Direct Download (Recommended)
1. Go to https://nodejs.org/ (LTS version recommended)
2. Download the Windows Installer (.msi)
3. Run the installer and follow the prompts
4. Accept all defaults
5. Restart your computer

### Option 2: Using Chocolatey
If you have Chocolatey installed:
```powershell
choco install nodejs
```

### Option 3: Using Windows Package Manager (winget)
```powershell
winget install OpenJS.NodeJS
```

### Verify Installation
After installation, open a new PowerShell or Command Prompt and run:
```powershell
node --version
npm --version
```

Both should show version numbers (e.g., v18.19.0).

## After Installation

Once Node.js and npm are installed, run in your project directory:
```powershell
npm install
npm run dev
```

## Troubleshooting

### npm: The term 'npm' is not recognized
- Make sure to **restart PowerShell/Command Prompt** after installing Node.js
- Check if Node.js was added to PATH (it should be by default)
- Run installer again if it still doesn't work

### Still having issues?
1. Uninstall Node.js from Control Panel → Programs
2. Restart computer
3. Reinstall Node.js from https://nodejs.org/
4. Choose "Automatically install necessary tools" during setup
