package com.example.neuronav

import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // 1. Setup WebView Settings (Storage & Cookies for Firebase)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)
        
        webView.webViewClient = WebViewClient()

        // 2. Modern Back Button Handler (Fixes "Direct Exit" issue)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack() // Go back in website
                } else {
                    isEnabled = false // Disable check
                    onBackPressedDispatcher.onBackPressed() // Exit app
                }
            }
        })
        
        // 3. Load URL
        // --- OPTION A: For Production (Vercel) ---
        webView.loadUrl("https://neuro-nav-demo.vercel.app")
        
        // --- OPTION B: For Local Testing (Emulator) ---
        // webView.loadUrl("http://10.0.2.2:3000")
        
        // --- OPTION C: For Local Testing (Real Phone) ---
        // Replace 192.168.x.x with your PC's IP address (Run 'ipconfig' in terminal)
        // webView.loadUrl("http://192.168.1.5:3000") 
    }
}
