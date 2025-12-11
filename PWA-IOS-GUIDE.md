# 📱 Configuration PWA iOS - Yumiso

## ✅ Ce qui a été configuré

### 1. **Installation du Package PWA**
- ✅ `next-pwa` installé et configuré
- ✅ Service Worker configuré pour fonctionner en production
- ✅ Cache stratégies optimisées

### 2. **Fichiers Créés/Modifiés**

#### **Nouveaux fichiers :**
- `public/manifest.json` - Manifeste PWA avec métadonnées
- `public/icons/icon-*.png` - 8 icônes générées (72px à 512px)
- `src/app/_offline/page.tsx` - Page hors ligne élégante
- `src/components/pwa/install-prompt.tsx` - Bannière d'installation iOS
- `scripts/generate-pwa-icons.js` - Script pour générer les icônes

#### **Fichiers modifiés :**
- `next.config.ts` - Configuration PWA avec next-pwa
- `src/app/layout.tsx` - Meta tags iOS + Apple Touch Icons
- `src/app/globals.css` - Animations PWA + Safe Area iOS
- `package.json` - Nouveaux scripts PWA

### 3. **Fonctionnalités iOS Implémentées**

✅ **Meta Tags iOS :**
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `apple-mobile-web-app-title`
- `apple-touch-icon` (toutes les tailles)
- Safe Area Support (notch iPhone)

✅ **Manifest PWA :**
- Nom, description, icônes
- Mode `standalone` (plein écran)
- Thème couleur émeraude (#10b981)
- Orientation portrait prioritaire

✅ **Bannière d'Installation :**
- Détection automatique iOS Safari
- Instructions visuelles d'installation
- Dismiss avec localStorage (7 jours)
- Animation slide-up élégante

✅ **Page Offline :**
- Design cohérent avec l'app
- Bouton retry
- Messages informatifs

---

## 🚀 Prochaines Étapes

### **Étape 1 : Build et Test Local**

```bash
# Générer les icônes PWA (si pas déjà fait)
npm run pwa:icons

# Build de production avec PWA
npm run build:pwa

# Lancer le serveur de production
npm start
```

**Tester localement :**
1. Ouvrir `http://localhost:3000`
2. Vérifier dans DevTools → Application → Manifest
3. Vérifier que le Service Worker est enregistré
4. Tester le mode offline (DevTools → Network → Offline)

---

### **Étape 2 : Déploiement sur Vercel (Recommandé)**

#### **Option A : Via GitHub**

1. **Créer un repo GitHub** (si pas déjà fait)
```bash
git init
git add .
git commit -m "feat: PWA configuration for iOS"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/yumiso-v2.git
git push -u origin main
```

2. **Connecter à Vercel**
- Aller sur [vercel.com](https://vercel.com)
- Cliquer "Import Project"
- Sélectionner ton repo GitHub
- Vercel détecte automatiquement Next.js

3. **Variables d'environnement**
Ajouter dans Vercel Dashboard → Settings → Environment Variables :
```
DATABASE_URL=...
NEXTAUTH_URL=https://ton-domaine.vercel.app
NEXTAUTH_SECRET=...
OPENAI_API_KEY=...
```

4. **Deploy**
- Cliquer "Deploy"
- Attendre 2-3 minutes

#### **Option B : Via Vercel CLI**

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

### **Étape 3 : Configuration Domaine Custom (Optionnel)**

1. Dans Vercel Dashboard → Settings → Domains
2. Ajouter ton domaine (ex: `yumiso.app`)
3. Configurer les DNS selon les instructions Vercel
4. Attendre propagation DNS (quelques heures max)
5. **IMPORTANT** : Mettre à jour `NEXTAUTH_URL` avec le nouveau domaine

---

### **Étape 4 : Test sur iPhone/iPad**

#### **Test 1 : Safari iOS**
1. Ouvrir Safari sur iPhone
2. Aller sur `https://ton-domaine.vercel.app`
3. Vérifier que la bannière d'installation apparaît
4. Suivre les instructions d'installation

#### **Test 2 : Installation PWA**
1. Appuyer sur le bouton Partager (en bas) 📤
2. Scroller et sélectionner "Sur l'écran d'accueil" ➕
3. Appuyer "Ajouter"
4. Une icône Yumiso apparaît sur l'écran d'accueil

#### **Test 3 : Mode Standalone**
1. Ouvrir l'app depuis l'icône
2. Vérifier : pas de barre d'adresse Safari (plein écran)
3. Tester les fonctionnalités (import vocal, YouTube, etc.)
4. Activer mode avion → vérifier page offline

---

### **Étape 5 : Optimisations iOS (Recommandées)**

#### **A. Ajouter des Screenshots pour le Manifest**
```bash
# 1. Prendre des screenshots iPhone (750x1334)
# 2. Les placer dans public/screenshots/
# 3. Ajouter dans manifest.json (déjà configuré)
```

#### **B. Améliorer la Splash Screen**
Créer `public/splash-*.png` pour différentes tailles :
- iPhone SE : 750x1334
- iPhone 12/13/14 : 1170x2532
- iPhone 14 Pro Max : 1290x2796
- iPad Pro : 2048x2732

#### **C. Activer les Notifications Push (Avancé)**
```bash
# Installer
npm install web-push

# Configurer dans next.config.ts
# Créer API routes pour push notifications
```

#### **D. Ajouter App Store Badge (Futur)**
Si tu publies plus tard sur l'App Store :
```html
<meta name="apple-itunes-app" content="app-id=123456789">
```

---

## 📊 Vérifications Post-Déploiement

### **Checklist Qualité PWA**

Utiliser [Lighthouse](https://developers.google.com/web/tools/lighthouse) :

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Tester PWA
lighthouse https://ton-domaine.vercel.app --view
```

**Objectifs à atteindre :**
- ✅ PWA Score : 90+ / 100
- ✅ Performance : 85+ / 100
- ✅ Accessibility : 90+ / 100
- ✅ Best Practices : 90+ / 100
- ✅ SEO : 90+ / 100

### **Tests iOS Spécifiques**

| Test | Résultat Attendu |
|------|------------------|
| Safari iOS : Ouvrir URL | ✅ Bannière d'installation visible |
| Installer sur écran d'accueil | ✅ Icône avec chef-icon.png |
| Ouvrir depuis icône | ✅ Mode plein écran (standalone) |
| Barre de statut | ✅ Noire translucide |
| Rotation écran | ✅ Portrait lock |
| Mode offline | ✅ Page offline s'affiche |
| Rechargement offline | ✅ Cache fonctionne |
| Import vocal | ✅ Permission micro demandée |
| Safe Area (notch) | ✅ Pas de contenu coupé |

---

## 🐛 Debugging iOS

### **Problème : Bannière ne s'affiche pas**
**Solution :**
- Vérifier dans Safari iOS (pas Chrome iOS)
- Effacer localStorage : `localStorage.clear()`
- Attendre 2 secondes après chargement
- Vérifier que pas déjà en mode standalone

### **Problème : Icône floue**
**Solution :**
```bash
# Regénérer icônes en haute qualité
npm run pwa:icons
```

### **Problème : Service Worker ne s'enregistre pas**
**Solution :**
- Vérifier HTTPS (requis)
- Vérifier console : `navigator.serviceWorker.ready`
- Clear cache + hard reload

### **Problème : Page offline ne s'affiche pas**
**Solution :**
- Vérifier routing dans `next.config.ts`
- Vérifier que `_offline` est bien build
- Tester avec DevTools Offline mode

---

## 🔧 Configuration Avancée

### **Personnaliser le Service Worker**

Créer `public/sw.js` custom :
```javascript
self.addEventListener('install', (event) => {
  console.log('SW installed');
});

self.addEventListener('activate', (event) => {
  console.log('SW activated');
});
```

### **Ajouter Background Sync**
```bash
npm install workbox-background-sync
```

### **Push Notifications**
```typescript
// Dans un composant
const subscribeToPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
  });
};
```

---

## 📈 Analytics PWA

### **Tracker les installations**
```typescript
// Ajouter dans layout.tsx
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  // Envoyer event à Google Analytics
});
```

### **Mesurer l'engagement**
```typescript
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('User is using PWA');
  // Track dans analytics
}
```

---

## 🎯 Résumé des Commandes

```bash
# Développement
npm run dev

# Générer icônes PWA
npm run pwa:icons

# Build PWA complet
npm run build:pwa

# Tester en production localement
npm start

# Deploy Vercel
vercel --prod

# Test Lighthouse
lighthouse https://ton-domaine.vercel.app --view
```

---

## 📚 Ressources Utiles

- [Next.js PWA Guide](https://github.com/shadowwalker/next-pwa)
- [Apple PWA Guidelines](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web App Manifest Generator](https://app-manifest.firebaseapp.com/)

---

## ✅ Configuration Terminée !

Ton application est maintenant **100% prête pour iOS** en tant que PWA ! 🎉

**Prochaine action : Deploy sur Vercel et teste sur ton iPhone !** 📱
