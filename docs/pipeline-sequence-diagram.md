# Trainify CI/CD Pipeline — Sequenzdiagramm

Dieses Dokument beschreibt die CI/CD-Pipeline des Trainify-Projekts als
Sequenzdiagramm. Es zeigt den Ablauf von der lokalen Entwicklung über
Qualitätssicherung bis hin zum Deployment und Monitoring.

## Pipeline-Sequenzdiagramm

```mermaid
sequenceDiagram
    participant Dev as Entwickler (Lokal)
    participant Git as GitHub Repository
    participant CI as CI Pipeline (GitHub Actions)
    participant QA as Qualitätssicherung
    participant CD as CD Pipeline
    participant Prod as Produktivumgebung
    participant Mon as Monitoring

    Note over Dev,Mon: ── Entwicklung & Commit ──

    Dev->>Dev: Code schreiben & lokal testen
    Dev->>Git: git push (Branch / PR)

    Note over Git,CI: ── Continuous Integration ──

    Git->>CI: Webhook: push / pull_request Event
    activate CI

    CI->>QA: 1. ESLint — Code-Qualität prüfen
    QA-->>CI: Lint-Ergebnis (pass/fail)

    CI->>QA: 2. TypeScript — Typ-Prüfung
    QA-->>CI: Typecheck-Ergebnis (pass/fail)

    CI->>QA: 3. Unit Tests (Frontend — Vitest)
    QA-->>CI: Test-Ergebnis (pass/fail)

    CI->>QA: 4. Integrationstests (Backend — Vitest + Supertest)
    QA-->>CI: Test-Ergebnis (pass/fail)

    CI->>QA: 5. Security Audit (npm audit)
    QA-->>CI: Audit-Ergebnis

    CI->>QA: 6. Build-Verifikation (vite build)
    QA-->>CI: Build-Artefakt erstellt

    deactivate CI

    alt Alle Checks bestanden
        CI-->>Git: ✅ Status: success
    else Ein Check fehlgeschlagen
        CI-->>Git: ❌ Status: failure
        Git-->>Dev: Benachrichtigung: Pipeline fehlgeschlagen
    end

    Note over Git,Prod: ── Continuous Deployment (nur main) ──

    Git->>CD: Push auf main Branch
    activate CD
    CD->>CD: Docker Images bauen
    CD->>Prod: Deployment ausführen
    deactivate CD

    Note over Prod,Mon: ── Monitoring ──

    Mon->>Prod: Health-Check (HTTP-Endpunkte prüfen)
    Prod-->>Mon: HTTP Status-Codes

    alt Alle Endpunkte erreichbar
        Mon-->>Dev: ✅ Alle Checks bestanden
    else Endpunkt nicht erreichbar
        Mon-->>Dev: ❌ Alarm: Service nicht verfügbar
    end
```

## Verwendete Protokolle

| Protokoll           | Verwendung                                             |
| ------------------- | ------------------------------------------------------ |
| **HTTPS**           | GitHub Webhooks, Spotify OAuth 2.0, npm Registry       |
| **HTTP**            | Lokale Entwicklung (Backend ↔ Frontend), Health-Checks |
| **Git (SSH/HTTPS)** | Code-Push an GitHub Repository                         |
| **OAuth 2.0**       | Spotify-Authentifizierung (Authorization Code Flow)    |
| **REST/JSON**       | Backend-API (Express), Spotify Web API, DB HAFAS API   |

## Qualitätssicherungsmaßnahmen

1. **ESLint** — Statische Code-Analyse und Stilprüfung
2. **TypeScript Type-Checking** — Typensicherheit zur Kompilierzeit
3. **Unit Tests** — Vitest + React Testing Library (Frontend-Logik & Komponenten)
4. **Integrationstests** — Vitest + Supertest (Backend-API-Routen)
5. **Security Audit** — npm audit auf bekannte Schwachstellen
6. **Build-Verifikation** — Sicherstellen, dass das Projekt kompiliert
