# Guide de Résolution : Plantages du Rendu WebGL dans Google Chrome

Ce document décrit les procédures nécessaires pour résoudre les échecs de création de contexte WebGL dans Google Chrome, particulièrement fréquents lors de l'utilisation d'environnements virtualisés ou de bureaux à distance (Remote Desktop).

## 🚨 Symptômes courants
Les journaux de console navigateur peuvent afficher des erreurs telles que :
*   `A WebGL context could not be created`
*   `ANGLE (Mesa, llvmpipe ...)`
*   `BindToCurrentSequence failed`

---

## 🛠️ Méthode 1 : Configuration via les Drapeaux Internes (Chrome Flags)

Cette méthode est recommandée pour une configuration graphique persistante et facile à appliquer.

### Étapes :

1.  **Accéder aux drapeaux de configuration :**
    Ouvrez Google Chrome et saisissez l'adresse suivante dans la barre d'adresse :
    ```text
    chrome://flags/
    ```

2.  **Forcer le rendu logiciel (Outrepasser la liste de blocage) :**
    *   Recherchez `#ignore-gpu-blocklist` ou "**Override software rendering list**".
    *   Définissez le paramètre sur **Enabled**.
    *   *Explication : Permet d'utiliser l'accélération graphique même sur des pilotes GPU virtuels initialement rejetés.*

3.  **Configurer le Backend Graphique ANGLE :**
    *   Recherchez "**Choose ANGLE graphics backend**" (ou `#use-angle`).
    *   Dans le menu déroulant, sélectionnez **OpenGL**.
    *   *Note : Dans certains cas de virtualisation Linux/Remote Desktop, le moteur OpenGL offre une bien meilleure compatibilité que les options par défaut.*

4.  **Redémarrer le navigateur :**
    Cliquez sur le bouton bleu **Relaunch** en bas à droite de la fenêtre pour appliquer immédiatement les modifications.

---

## 💻 Méthode 2 : Lancement forcé par Ligne de Commande (CLI)

Si l'interface graphique plante toujours, vous pouvez forcer Chrome à utiliser le moteur CPU de secours ultra-compatible (**SwiftShader**) directement depuis votre terminal.

### Commande de lancement :

Exécutez la commande suivante dans votre terminal :

```bash
google-chrome --use-gl=angle --use-angle=swiftshader --ignore-gpu-blocklist
```

### Détail des options utilisées :

| Option | Description |
| :--- | :--- |
| `--use-gl=angle` | Force l'utilisation de la couche de traduction ANGLE. |
| `--use-angle=swiftshader` | Force l'exécution du rendu logiciel stable par le CPU. |
| `--ignore-gpu-blocklist` | Force Chrome à ignorer les blocages de compatibilité matérielle. |

---

## ✅ Vérification
Pour confirmer que le problème est résolu, naviguez vers cette adresse interne dans Chrome :
```text
chrome://gpu/
```
Recherchez la section **Graphics Feature Status**. La ligne **WebGL** doit désormais afficher un état fonctionnel (ex: `Hardware accelerated` ou `Software only`), confirmant que le contexte 3D a pu s'ouvrir sans planter !
