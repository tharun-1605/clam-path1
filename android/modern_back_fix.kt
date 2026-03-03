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
        
        // 1. Setup WebView Settings (Session & Cookies)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)
        
        webView.webViewClient = WebViewClient()

        // 2. Modern Back Button Handler (Fixes "Direct Exit" issue)
        // This tells Android: "I want to handle the back button myself"
        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    // If WebView has history, go back in browser
                    webView.goBack()
                } else {
                    // If no history, disable this interceptor and call system back (exits app)
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, callback)
        
        // 3. Load URL
        webView.loadUrl("https://neuro-nav-demo.vercel.app") 
    }
}
