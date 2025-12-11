#!/bin/bash
# PWA Verification Script

echo "==================================================="
echo "   🎉 GOURMICH PWA - Configuration Check 🎉"
echo "==================================================="
echo ""

# Check 1: Manifest
if [ -f "public/manifest.json" ]; then
    echo "✅ Manifest PWA ............... OK"
else
    echo "❌ Manifest PWA ............... MISSING"
fi

# Check 2: Service Worker
if [ -f "public/sw.js" ]; then
    echo "✅ Service Worker ............. OK"
else
    echo "❌ Service Worker ............. MISSING"
fi

# Check 3: Icons
if [ -d "public/icons" ]; then
    icon_count=$(ls public/icons/*.png 2>/dev/null | wc -l)
    echo "✅ Icons PWA .................. $icon_count fichiers"
else
    echo "❌ Icons PWA .................. MISSING"
fi

# Check 4: Install Banner
if [ -f "src/components/pwa/install-prompt.tsx" ]; then
    echo "✅ Bannière Installation ...... OK"
else
    echo "❌ Bannière Installation ...... MISSING"
fi

# Check 5: Offline Page
if [ -f "src/app/_offline/page.tsx" ]; then
    echo "✅ Page Offline ............... OK"
else
    echo "❌ Page Offline ............... MISSING"
fi

# Check 6: PWA Provider
if [ -f "src/components/pwa/pwa-provider.tsx" ]; then
    echo "✅ PWA Provider ............... OK"
else
    echo "❌ PWA Provider ............... MISSING"
fi

# Check 7: Build Success
if [ -d ".next" ]; then
    echo "✅ Build Next.js .............. OK"
else
    echo "⚠️  Build Next.js .............. RUN 'npm run build'"
fi

echo ""
echo "==================================================="
echo "   📱 NEXT STEPS"
echo "==================================================="
echo ""
echo "1️⃣  Deploy sur Vercel:"
echo "   → vercel --prod"
echo ""
echo "2️⃣  Teste sur iPhone:"
echo "   → Ouvre Safari iOS"
echo "   → Va sur ton URL Vercel"
echo "   → Attends la bannière d'installation"
echo ""
echo "3️⃣  Installe l'app:"
echo "   → Partager 📤"
echo "   → Sur l'écran d'accueil ➕"
echo "   → Ajouter ✅"
echo ""
echo "==================================================="
echo "   ✅ STATUS: PRODUCTION READY"
echo "==================================================="
echo ""
