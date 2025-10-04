# Space Biology Knowledge Engine

A comprehensive dashboard for exploring NASA's space biology research data.

## Features

- User authentication system (session-based)
- Interactive data visualization
- Advanced search and filtering
  - Experiments: query by keyword, organism, category, year range
  - Articles: CSV-backed, full-row keyword search (any column)
- Responsive design with animations
- MongoDB integration with offline fallback and auto-retry
- Contact form functionality

---

## Quickstart (Linux/Kali/Debian)

Follow these steps in order to run the app smoothly. This method starts MongoDB without requiring a system service.

1) Change into the project directory
```bash
cd /home/kali/Desktop/nasa/space-engine-main
```

2) Install Node dependencies
```bash
npm install
```

3) Start MongoDB (background, no systemd needed)
```bash
mkdir -p /home/kali/.local/share/mongodb
nohup mongod \
  --dbpath /home/kali/.local/share/mongodb \
  --bind_ip 127.0.0.1 --port 27017 \
  --fork --logpath /home/kali/mongod.log
```
Optionally verify that MongoDB is running:
```bash
pgrep -x mongod
tail -n 50 /home/kali/mongod.log
```

4) Configure CSV Articles (optional but recommended)
- Place your CSV file inside this repository (any subfolder up to depth 3). The app auto-discovers a file named `csv` or any file with a `.csv` extension.
- If your CSV is elsewhere or you have multiple CSV files, specify the exact path when starting the server using the `ARTICLES_CSV` environment variable.

5) Start the server
- With auto-discovery of CSV (recommended if your CSV lives in this repo):
```bash
npm run start
```
- With explicit CSV path (if your CSV is outside the repo or not auto-detected):
```bash
ARTICLES_CSV=/absolute/path/to/your.csv npm run start
```
The server finds a free port starting at 3000 and prints the Local URL.

6) Open the app
- Dashboard: `http://localhost:<port>/dashboard`
- API Health: `http://localhost:<port>/api/test`
  - `database` will show `Connected` once MongoDB is up.

---

## One-liner startup (convenience)
Run this to start MongoDB (if not running) and then the server:
```bash
mkdir -p /home/kali/.local/share/mongodb \
&& pgrep -x mongod >/dev/null || (nohup mongod --dbpath /home/kali/.local/share/mongodb --bind_ip 127.0.0.1 --port 27017 --fork --logpath /home/kali/mongod.log && sleep 2) \
&& npm install \
&& npm run start
```
If your CSV isn’t auto-detected, use:
```bash
ARTICLES_CSV=/absolute/path/to/your.csv npm run start
```

---

## Usage Notes
- Admin login (development credentials):
  - Email: `admin@nasa.gov`
  - Password: `admin123`
- Dashboard search bar searches both Experiments and Articles (CSV). For Articles, any keyword contained in any CSV column will match.
- Articles Presented section displays all CSV columns as key/value pairs per row. Link is resolved from `url` field or any http(s) column value.
- Offline behavior: If MongoDB is not running, experiments use sample data and admin operations are stored in memory. The app automatically retries connecting to MongoDB every 10 seconds and persists buffered admin operations once connected (no restart needed).

---

## Environment Variables (optional)
- `PORT` — Preferred port to start from (default: 3000). The server will auto-increment if busy.
- `ARTICLES_CSV` — Absolute path to the CSV file (overrides auto-discovery)
- `DB_RETRY_INTERVAL_MS` — Interval for DB reconnect attempts (default: 10000)

---

## Troubleshooting

- "Unit mongod.service does not exist"
  - The quickstart uses direct `mongod` launch; no systemd unit is required.

- Locale warnings in terminal (optional permanent fix)
```bash
sudo sed -i 's/^# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
sudo locale-gen
sudo update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
```

- CSV not found / not the correct file
  - Place the CSV in this repo (depth <= 3) or set `ARTICLES_CSV=/absolute/path/to/your.csv` when starting.

- Freeing port 3000 (if necessary)
  - The server auto-finds a free port, but you can also run:
```bash
npm run fix-port
```

- Checking logs
```bash
# MongoDB
tail -n 100 /home/kali/mongod.log

# Server (run in the same terminal where you started it)
# Logs are printed directly to the console
```

---

## Project Scripts
- `npm run start` — Start server
- `npm run dev` — Start with nodemon (auto-restart on changes)
- `npm run fix-port` — Free port 3000 on macOS/Linux/Windows
