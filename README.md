# Three.js Robot API

The **Robot API Control Server** enables real-time command over the Three.js WebGL Robot. Through a standardized RESTful interface, developers can list available behaviors and execute transitions across distinct animation categories.

---

### API Description

#### Base URL
`http://localhost:3000/robot/v1`

#### Core Capabilities
The API tracks three operational modes:
- **States:** Persistent loop-based animations reflecting a baseline physical mode (Walking, Idle, Dance, etc.).
- **Emotes:** Instantaneous, one-shot trigger actions that overlay the current state and return control once complete (Jump, Wave, ThumbsUp).
- **Expressions:** Fine-grained blend-weight manipulations for facial morph targets (Angry, Surprised, Sad).

#### Endpoints

##### 📡 Get Capabilities
Retrieves the absolute registry of accepted directive strings known to the model.
- **Method:** `GET`
- **Path:** `/capabilities`

##### 🏃 Set Current Movement State
Transitions the underlying looped animation track.
- **Method:** `POST`
- **Path:** `/state`
- **Body:** `{ "name": "Running" }`

##### 🎭 Fire One-Shot Emote
Executes a solitary action snippet immediately.
- **Method:** `POST`
- **Path:** `/emote`
- **Body:** `{ "name": "Jump" }`

##### 🙂 Set Facial Expression Weight
Drives granular morph target control to modulate facial features.
- **Method:** `POST`
- **Path:** `/expression`
- **Body:** `{ "name": "Surprised", "value": 0.85 }`

---

### 🔌 Real-Time API Execution Logs

The app features a modern, interactive, and semi-transparent **Execution Logs Panel** overlaying the right side of the screen (using 30% width). It provides a premium live-stream of all requests received by the API:

*   **Live Stream:** Powered by Socket.io, instantly captures all inbound API calls (method, path, timestamp, query/body, and headers) while ignoring static page asset noise.
*   **Glassmorphism Interface:** Designed using a sleek dark-mode theme with Tailwind-inspired colors, a premium `backdrop-filter: blur(12px)` overlay, and a custom-built scrollable feed.
*   **Adjustable Opacity Control:** Includes a slider in the header allowing users to adjust the translucency of the log overlay from **10% to 100%** in real time.
*   **Automatic JWT Decoder:** Scans incoming headers (like `Authorization: Bearer ...` or custom JWT headers) and decodes base64url payloads on the fly in the backend without heavy libraries.
*   **Collapsible & Highlighted Code blocks:** Allows expanding **Headers**, **Bodies**, and **JWT payloads** directly in the list with a custom client-side JSON syntax highlighter.
*   **Traffic Simulator Script:** A helper script `send_demo_requests.sh` is provided in the repository to generate dummy traffic, custom headers, and full JWT signatures for quick verification.

---

## Getting Started

### Prerequisites

*   **Node.js** (v16.x or later recommended)
*   **npm** (comes bundled with Node.js)

### Installation

1.  **Install dependencies**:
    Execute the following command in the project root directory:
    ```bash
    npm install
    ```

### Configuration

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The network port the server will listen on. | `3000` |

### Running the Server

To start the Node.js backend and serve the static frontend:

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`.

---

## Cloud Run Deployment

This section explains how to build the container image using Google Cloud Build and deploy it to Cloud Run.

### Prerequisites

1.  Ensure the `gcloud` SDK is installed and initialized.
2.  Ensure your active Google Cloud Project is set:
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```
3.  Enable services:
    ```bash
    gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
    ```

### Step 1: Build and Push the Image

```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/threejs-robot-api
```

### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy threejs-robot-api \
  --image gcr.io/$(gcloud config get-value project)/threejs-robot-api \
  --platform managed \
  --region [REGION] \
  --allow-unauthenticated
```
