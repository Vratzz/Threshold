// Threshold — iPhone shell
//
// Runs the web app (index.html, src/, assets/) inside a native iOS app.
// Paste this over the ContentView.swift that Xcode creates for a new
// "App" project, then follow docs/run-on-iphone.md.

import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        ThresholdWebView()
            .ignoresSafeArea() // the web app handles the notch itself (env(safe-area-inset-*))
            .background(Color(red: 0x14 / 255, green: 0x14 / 255, blue: 0x16 / 255))
            .preferredColorScheme(.dark)
    }
}

struct ThresholdWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default() // keeps your collection between launches

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0x14 / 255, green: 0x14 / 255, blue: 0x16 / 255, alpha: 1)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false

        if let index = Bundle.main.url(forResource: "index", withExtension: "html"),
           let root = Bundle.main.resourceURL {
            webView.loadFileURL(index, allowingReadAccessTo: root)
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        // Links to the web (e.g. "Open Instagram") open outside the app,
        // so Instagram's own app launches if it's installed.
        func webView(_ webView: WKWebView,
                     decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = action.request.url,
               ["http", "https"].contains(url.scheme ?? ""),
               action.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        // target="_blank" links arrive here instead.
        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url { UIApplication.shared.open(url) }
            return nil
        }
    }
}

#Preview { ContentView() }
