# BioNova🚀
_“Weaving Knowledge, Driving Exploration.”_

BioNova is a knowledge engine designed to make NASA’s space biology research accessible, searchable, and actionable. By integrating bioscience publications, experiment data, and mission details into one dynamic platform, it allows users to explore the impacts and results of space biology experiments through intuitive keyword searches, interactive visualizations, and AI-generated summaries.

This platform bridges the gap between raw scientific data and human understanding, enabling researchers, educators, students, and innovators to quickly uncover insights, accelerate discovery, and support the development of sustainable life systems for future human space exploration. BioSpace Atlas transforms decades of scattered research into a unified resource that fuels learning, innovation, and humanity’s journey beyond Earth.

## Team Name: AstroNerve
### Team Members
1.Hafis Mohammed 
2.Jaishook K V
3.Jasmin Varghese
4.Gayathri V R
5.Chetan Krishna
6.Thanush P Anoop

### Problem Statement
As humanity prepares to embark on a new era of space exploration — returning to the Moon and setting its sights on Mars — understanding how life responds and adapts to space environments is more critical than ever. Over the past decades, NASA has conducted countless biological experiments aboard space missions, generating a vast body of scientific knowledge. These findings hold essential clues to sustaining human life beyond Earth — from maintaining astronaut health to growing food and developing resilient life-support systems.
However, despite being publicly available, this knowledge is scattered across numerous scientific publications, mission reports, and databases, making it difficult for researchers, educators, and innovators to find relevant information quickly. The lack of a unified, user-friendly way to search, interpret, and connect this data limits how effectively it can be used to advance future missions and scientific breakthroughs.

### Problem Solution
Our project, BioNova, addresses this challenge by creating a dynamic, AI-powered web platform that brings NASA’s space biology knowledge into one intuitive and accessible space. The platform allows users to enter a keyword or topic and instantly explore related bioscience publications, experiment results, and mission details. Using tools like artificial intelligence, natural language processing, and knowledge graphs, BioNova summarizes complex research into concise insights and interactive visualizations, enabling users to understand impacts and relationships at a glance.
By transforming scattered data into an organized, searchable knowledge engine, BioSpace Atlas accelerates discovery, supports mission planning, and empowers scientists, students, and innovators to build the biological foundations for humanity’s future in space.

## Features

- User authentication system (session-based)
- Interactive data visualization
- Advanced search and filtering
  - Experiments: query by keyword, organism, category, year range
  - Articles: CSV-backed, full-row keyword search (any column)
- Responsive design with animations
- MongoDB integration with offline fallback and auto-retry
- Contact form functionality

## Technical Details
### Technical Components Used
- Node.js
- MongoDB
- JavaScript ES6+
- CSS3
- HTML5
- Python
- Data Visualization

# Link to product walkthrough
https://www.canva.com/design/DAG00nHsml8/Z4dye0Q7qjlka3q1SRA1BQ/edit

## How it works?
🔍 Keyword Search: Users enter a biological keyword (e.g., organism, condition, experiment) into the platform.

🧠 Data Retrieval: The system searches NASA’s bioscience datasets and research archives for relevant information.

🧪 AI Processing: Natural language processing and AI summarization organize and condense complex scientific data.

🌐 Knowledge Mapping: Information is structured into a connected knowledge base, showing relationships between experiments, organisms, and outcomes.

📊 Visualization: Results are displayed through interactive dashboards and visualizations for easy exploration and understanding.

🚀 Accessible Insights: Users receive concise summaries, key findings, and experiment details — all in one place.

## How to Run
- Ensure Dependencies Are Installed
- Start the Backend Server
- Start the Frontend Application
- Open the Application
- Explore BioNova

## Screenshots
![Screenshot1]![image]![frontpage](https://github.com/user-attachments/assets/5eb02743-8ad9-4863-accb-2415e095e1e2)
*Home page*

![Screenshot2]![image]![Articles](https://github.com/user-attachments/assets/32f4a210-6d2d-4a7b-b0ce-59577b37de1c)
*Articles page*

![Screenshot3]!![image]![about page](https://github.com/user-attachments/assets/9887cfe3-6aec-445f-81ea-7962e4db3dce)
*About page*

![Screenshot4]!![image]<img width="1896" height="964" alt="Screenshot 2025-10-04 165834" src="https://github.com/user-attachments/assets/4857000b-a6a3-428a-880e-4432da692094" />
*History of space biology*


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

# Future Plans
In the future, we envision BioNova evolving into a comprehensive and intelligent platform that goes beyond information retrieval. Our goal is to integrate a broader range of NASA datasets, research papers, and mission archives, creating a richer and more connected knowledge base. With advancements in AI and semantic search, BioNova will be able to understand context, offer deeper insights, and even predict biological outcomes in space environments.

We also aim to introduce dynamic knowledge graphs to visualize complex relationships between experiments, organisms, and environmental factors, making exploration more intuitive. Collaborative tools and educational features will further transform BioNova into an interactive space where scientists, students, and enthusiasts can share insights and build upon existing research. Ultimately, BioNova aspires to become a trusted hub that not only organizes space biology knowledge but also supports the next generation of discoveries in space exploration.

----------------------------------------------------------------------------------------------------------------------------------------------------

