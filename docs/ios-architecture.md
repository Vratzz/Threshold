# Native iOS architecture (planned)

The web version relies on you tapping Threshold *instead of* Instagram. The native version makes Threshold appear **when you tap Instagram itself**, using Apple's Screen Time APIs.

> Status: architecture designed, implementation in progress. Screen Time APIs only work on a physical device, not in the Simulator.

## Targets

All four targets share one App Group (`group.<bundle-id>.threshold`) so they can read the same selection and log.

| Target | Framework | Job |
|---|---|---|
| **Threshold** (main app, SwiftUI) | FamilyControls, ManagedSettings | Onboarding, the pause flow, garden |
| **ShieldConfigurationExtension** | ManagedSettingsUI | Styles the screen that covers Instagram |
| **ShieldActionExtension** | ManagedSettings | Handles the shield's buttons |
| **DeviceActivityMonitorExtension** | DeviceActivity | Puts the shield back after a grace period |

## Flow

```
 Tap Instagram
      │
      ▼
 ┌──────────────────────────┐
 │  Shield (charcoal + blue) │   ShieldConfigurationExtension
 │  "Wait a second"          │
 │  [Let's pause first]      │──► ShieldActionExtension
 │  [Not now]                │      schedules a local notification
 └──────────────────────────┘      "Ready when you are", then .close
                                         │
                       tap notification  ▼
                              Threshold opens on the door screen
                              (bunnies → reason → breathe → moment)
                                         │
                 ┌───────────────────────┴───────────────────────┐
        "I'll do this instead"                         "Still want to open"
        log + grow a flower                            remove shield, then
                                                       DeviceActivityMonitor
                                                       re-applies it after 2 min
```

### Why a notification hop?
Shield action extensions **can't open the containing app directly**: Apple doesn't allow `UIApplication.shared.open` or URL schemes from that extension. A local notification the user taps is the reliable workaround that apps in this category use.

## Key pieces

```swift
// Onboarding: pick the apps to pause (Instagram, Netflix, Prime Video…)
FamilyActivityPicker(selection: $selection)

// Apply the shield
let store = ManagedSettingsStore()
store.shield.applications = selection.applicationTokens

// "Still want to open": lift the shield briefly
store.shield.applications = nil
try DeviceActivityCenter().startMonitoring(.graceWindow,
    during: DeviceActivitySchedule(intervalStart: now, intervalEnd: now + 2min, repeats: false))

// DeviceActivityMonitorExtension
override func intervalDidEnd(for activity: DeviceActivityName) {
    store.shield.applications = savedSelection.applicationTokens
}
```

## Shared data
- `FamilyActivitySelection`, encoded into `UserDefaults(suiteName: appGroup)`
- Pause log `[{ timestamp, reason, outcome }]`, the same shape as the web version's `state.log`, so both versions share one data model

## Design-token mapping
| Web | SwiftUI |
|---|---|
| `--base #141416` | `Color("Base")` |
| `--blue #0099FF` | `Color("Accent")` |
| Inter | SF Pro (system font) until Inter is bundled |

## Setup checklist (Xcode)
1. New iOS App → `Threshold`
2. File → New → Target ×3: Shield Configuration, Shield Action and Device Activity Monitor extensions
3. Main target → Signing & Capabilities → add **Family Controls** and **App Groups**
4. Add the same **App Group** to all three extensions
5. Run on a real iPhone signed in with your Apple ID
6. For App Store distribution, request the Family Controls entitlement from Apple
