# 🚀 Simple ngrok Steps - Just Copy & Paste!

## ✅ **After Downloading ngrok:**

### **Step 1: Extract ngrok**
- Extract `ngrok.exe` from the zip file
- Move it to: `C:\ngrok\ngrok.exe`

### **Step 2: Add to PATH (One-time setup)**
1. Press `Windows + R`
2. Type: `sysdm.cpl` and press Enter
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit"
6. Click "New"
7. Type: `C:\ngrok`
8. Click "OK" on all windows

### **Step 3: Get Auth Token**
1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your token
3. Open PowerShell and run:
```powershell
ngrok authtoken YOUR_TOKEN_HERE
```

---

## 🎯 **Now Run These Commands (One by One):**

### **Command 1: Start Backend**
```powershell
cd C:\Users\nkybi\CascadeProjects\MatrimonyPro\server
npm run dev
```
✅ Wait for: "API listening on http://localhost:4000"
⚠️ Keep this window open!

---

### **Command 2: Expose Backend (New PowerShell)**
```powershell
ngrok http 4000
```
✅ You'll see: `Forwarding: https://abc123.ngrok-free.app`
📋 **COPY THIS URL!** (You'll need it in next step)
⚠️ Keep this window open!

---

### **Command 3: Update Frontend Config (New PowerShell)**
```powershell
cd C:\Users\nkybi\CascadeProjects\MatrimonyPro\client
notepad .env
```

In notepad, change the first line to:
```
VITE_API_BASE=https://abc123.ngrok-free.app
```
(Use YOUR URL from Command 2)

Save and close notepad.

---

### **Command 4: Start Frontend (Same PowerShell as Command 3)**
```powershell
npm run dev
```
✅ Wait for: "Local: http://localhost:5173"
⚠️ Keep this window open!

---

### **Command 5: Expose Frontend (New PowerShell)**
```powershell
ngrok http 5173
```
✅ You'll see: `Forwarding: https://xyz789.ngrok-free.app`
🎉 **THIS IS YOUR PUBLIC URL!**
⚠️ Keep this window open!

---

## 📱 **Share This URL:**

```
🌐 Website: https://xyz789.ngrok-free.app
(Your URL from Command 5)

📱 Test Login:
Phone: +919876543210
OTP: 123456
```

---

## ⚠️ **Important:**
- Keep all 4 PowerShell windows open
- If you close any, the website stops working
- To stop: Close all PowerShell windows

---

## 🔄 **To Restart Later:**
Just run Commands 1-5 again!

---

**That's it! Your website is now public!** 🎉
