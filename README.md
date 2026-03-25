# 🚆🎵 Trainify

A web app that generates a Spotify playlist tailored to the duration of your train journey. Enter your train details, and Trainify picks songs from your liked tracks that fill exactly the travel time.

## How It Works

![Trainify Architecture](images/trainify_architecture.jpg)

## APIs Used

| API                 | Purpose                                         | Endpoint               |
| ------------------- | ----------------------------------------------- | ---------------------- |
| **Deutsche Bahn**   | Get departure & arrival times for a train       | `v6.db.transport.rest` |
| **Spotify Web API** | Fetch liked songs, create playlists, add tracks | `api.spotify.com`      |

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Auth:** Spotify OAuth 2.0 (PKCE)
- **Styling:** CSS

## Getting Started

```bash
# Clone the repo
git clone https://github.com/sophiekeesing/lernfeld-8.git
cd lernfeld-8/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
lernfeld-8/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main application component
│   │   ├── main.tsx         # Entry point
│   │   └── assets/          # Images & icons
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── images/                  # Architecture diagrams
└── README.md
```

## License

See [LICENSE](LICENSE) for details.
