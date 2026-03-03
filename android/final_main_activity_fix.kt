package com.example.neuronav

import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // --- SESSION FIX: Save Login & Cookies ---
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true // Required for Firebase Auth (LocalStorage)
        webView.settings.databaseEnabled = true
        
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true) // Required for Google/Social Login
        
        // Stay inside the app when clicking links
        webView.webViewClient = WebViewClient()
        
        // Load the App
        // Use "10.0.2.2:3000" if running on Emulator
        // Use your computer's IP (e.g. 192.168.1.5:3000) if on real phone
        webView.loadUrl("https://neuro-nav-demo.vercel.app") 
    }
    
    // --- BACK BUTTON FIX: Go back in browser, don't close app ---
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
