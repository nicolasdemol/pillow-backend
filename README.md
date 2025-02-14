<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🚀 Pillow Backend & API - Authentications, Users, Subscriptions, Payments, Chats, Contents

Bienvenue dans **Pillow API**, une architecture backend sécurisée avec **Keycloak SSO (OpenID Connect)**.  
Ce projet est conçu pour fournir une API robuste et sécurisée pour la gestion des utilisateurs, des paiements, des abonnements, des contenus et des messages.

## 🛠️ Stack Technique

- **NestJS** - Framework Node.js modulaire et scalable.
- **Keycloak** - Gestion des identités et authentification SSO (OpenID Connect).
- **PostgreSQL** - Base de données relationnelle pour les utilisateurs et les transactions.
- **Nginx** - Reverse proxy pour le routage des requêtes API et d’authentification.
- **Docker & Docker Compose** - Conteneurisation et orchestration des services.
- **Modsecurity** - Pare-feu (à implémenter)

---

## 📌 Fonctionnalités

### 🔐 Authentification (Keycloak SSO)

- Protocole OpenIDConnect
- Login & gestion des utilisateurs via Keycloak.
- Protection des routes API avec JWT.
- Gestion des rôles et permissions (RBAC).

### 🧑‍💻 API Utilisateurs

- `GET /users/me` → Récupérer son propre profil.
- `GET /users/:id` → Voir le profil public d’un utilisateur.
- `PUT /users/me` → Modifier son profil (nom, bio, avatar, etc.).
- `GET /users/search?query=` → Recherche d’utilisateurs.

### Plan d'implémentation

- [x] **Étape 1 : Authentification et gestion des rôles**

  - ✅ Intégration Keycloak avec NestJS.
  - ✅ Vérification des rôles.

- [ ] **Étape 2 : Gestion des utilisateurs**

  - ✅ CRUD des profils utilisateurs.
  - ✅ Gestion des abonnements et des rôles.

- [ ] **Étape 3 : Gestion des paiements**

  - ✅ Intégration Stripe Checkout & Paypal.
  - ✅ Webhook pour activer les abonnements.

- [ ] **Étape 4 : Gestion du contenu**

  - ✅ API pour publier du contenu.
  - ✅ Stockage des images/vidéos.

- [ ] **Étape 5 : Messagerie et notifications**

  - ✅ Chat privé avec WebSockets.
  - ✅ Notifications pour nouveaux messages & abonnements.

- [ ] **Étape 6 : Intelligence Artificielle**
  - ✅ Récolte des données utilisateurs et stockage vectoriel.
  - ✅ Contrôle du contenu pré-sélectionné par l'IA.

### 🔄 Reverse Proxy (Nginx)

- **api.pillow.com** → Redirige vers l'API NestJS.
- **auth.pillow.com** → Redirige vers Keycloak.

### 🛡️ Sécurité

- 🛡️ Keycloak : Gestion des autorisations et des permissions, identifications des activitées suspectes, analyse du traffic.
- 🔄 Reverse Proxy : Contrôle le flux à l'entrée du domaine.
- 🔐 WAF (à implémenter) : Mettre en place un pare-feu applicatif pour protéger les API sensibles.
- 🛑 HTTPS en production : Activer SSL/TLS avec Let's Encrypt via Nginx.

---

## 🚀 Installation & Déploiement

### Cloner le projet

```sh
git clone https://github.com/nicolasdemol/pillow-backend
cd pillow-backend
npm install
```

### Configuration des variables d'environnement

```sh
# ===============================
#  Configuration globale
# ===============================
PORT=3000

# ===============================
#  Configuration PostgreSQL - API
# ===============================
POSTGRES_API_TYPE=postgres
POSTGRES_API_HOST=postgres_api
POSTGRES_API_PORT=5432
POSTGRES_API_USER=api
POSTGRES_API_PASSWORD=test
POSTGRES_API_DB=api
POSTGRES_API_SYNCHRONIZE=true
POSTGRES_API_LOGGING=false

# ===============================
#  Configuration PostgreSQL - Keycloak
# ===============================
POSTGRES_KEYCLOAK_TYPE=postgres
POSTGRES_KEYCLOAK_HOST=postgres_keycloak
POSTGRES_KEYCLOAK_USER=keycloak
POSTGRES_KEYCLOAK_PASSWORD=test
POSTGRES_KEYCLOAK_DB=keycloak

# ===============================
# 🔒 Configuration Keycloak
# ===============================
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=auth
KEYCLOAK_CLIENT_ID=backend
KEYCLOAK_CLIENT_SECRET=test
KEYCLOAK_CALLBACK_URL=http://localhost:3000
```

### Lancer l’environnement Docker

```sh
docker-compose up -d
```

Cela démarre :

- PostgreSQL (API)
- PostgreSQL (Keycloak)
- Keycloak (SSO)
- NestJS (API)
- Nginx (Reverse Proxy)

### (Optionnel) Ajouter les entrées DNS (uniquement localhost)

```sh
127.0.0.1    api.pillow.com
127.0.0.1    auth.pillow.com
```
