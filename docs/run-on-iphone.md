# Run Threshold on your iPhone with Xcode

This puts the web app inside a small native app, so it sits on your home screen and opens like any other app. It takes about 20 minutes the first time.

**You need:** a Mac with Xcode (free from the Mac App Store), your iPhone and its cable, and your Apple ID. A free Apple ID works; you don't need the paid developer program to put it on your own phone.

> This is the quick version: the same screens as the web app, wrapped natively. Making Threshold appear *when you tap Instagram* needs the Screen Time version described in [`ios-architecture.md`](ios-architecture.md).

## 1. Get the code onto your Mac
Open Terminal and run:
```bash
git clone https://github.com/Vratzz/Threshold.git
```
That creates a `Threshold` folder in your home folder.

## 2. Create the Xcode project
1. Open Xcode → **Create New Project…**
2. Choose **iOS** at the top → **App** → Next
3. Fill in:
   - **Product Name:** `Threshold`
   - **Team:** click *Add Account…* and sign in with your Apple ID, then pick it (it shows as "Your Name (Personal Team)")
   - **Organization Identifier:** something unique, like `com.vartikaverma`
   - **Interface:** SwiftUI · **Language:** Swift · leave the boxes unticked
4. Save it somewhere **outside** the cloned `Threshold` folder (e.g. Desktop)

## 3. Add the app files
1. In Finder, open the cloned `Threshold` folder
2. Select **`index.html`**, **`src`** and **`assets`** (hold ⌘ to select all three)
3. Drag them into Xcode's left sidebar, onto the yellow `Threshold` folder
4. In the box that appears:
   - tick **Copy items if needed** (newer Xcode calls it *Action: Copy files to destination*)
   - choose **Create folder references** (newer Xcode: *Groups: Create folder references*) (the folders turn **blue**, not yellow; this matters, because it keeps the `src/…` paths the app uses)
   - make sure the **Threshold** target is ticked → Finish

## 4. Paste in the shell
1. In Xcode's sidebar, click **`ContentView.swift`**
2. Select everything in it (⌘A) and delete it
3. Paste in the contents of [`ios/ContentView.swift`](../ios/ContentView.swift) from this repo

## 5. Add the app icon (optional but nice)
Sidebar → **Assets** → **AppIcon** → drag `assets/icons/icon-512.png` into the 1024×1024 slot. Xcode will warn it's smaller than 1024; it still works for testing.

## 6. Prepare your iPhone
1. Plug your iPhone into the Mac and tap **Trust** on the phone
2. On the iPhone: **Settings → Privacy & Security → Developer Mode → On**, then restart when asked (this option appears only after you've connected it to Xcode once)

## 7. Run it
1. At the top of Xcode, click the device menu (next to "Threshold") and pick **your iPhone**
2. Press **▶︎ Run** (or ⌘R)
3. The first time, the phone will refuse to open it. On the iPhone go to **Settings → General → VPN & Device Management**, tap your Apple ID, then **Trust**
4. Press ▶︎ again. Threshold opens on your phone 🐰

## Good to know
- **With a free Apple ID the app stops opening after 7 days.** Plug in and press ▶︎ again to renew it. The paid Apple Developer Program ($99/year) removes this limit and lets you ship to TestFlight or the App Store.
- **Your collection is saved on the phone** and survives restarts. Deleting the app deletes it.
- **To update it** after changing the code: `git pull` in the cloned folder, delete the old `index.html`, `src` and `assets` from Xcode (*Move to Trash*), redo step 3, then ▶︎.
- **Fonts** load from Google Fonts, so the first launch needs internet. Without it, the app falls back to system fonts and still works.
- **Reminders** don't fire in this wrapper (web notifications aren't available in an embedded web view). Native reminders come with the Screen Time version.
- **Simulator:** you can also pick an iPhone simulator from the device menu to try it without a phone.
