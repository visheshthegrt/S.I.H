# Smart India Hackathon 2026 - Project Proposals

This document outlines the two primary problem statements our team is evaluating for the internal hackathon. Both projects are highly technical, data-driven, and perfectly suited for a "vibecoding" approach (heavy AI-assisted generation).

---

## Proposal 1: AI-Driven Collision Risk Assessment for Mega-Constellation Satellites (PS-33)

**Domain:** Space Technology
**The Problem:** With thousands of satellites in orbit, space is getting crowded. Traditional orbital mechanics math used to calculate collision risks is slow and computationally expensive.
**The Goal:** Build an application that processes orbital trajectories and uses an AI filter to instantly predict the probability of a collision much faster than traditional physics engines.

### Technical Architecture
*   **Data Source:** Publicly available Two-Line Elements (TLEs) from Space-Track.org or CelesTrak (JSON/CSV formats).
*   **Backend (Math Engine):** Python using the `sgp4` library to calculate exact X, Y, Z coordinates from the TLEs.
*   **The AI Component:** A lightweight Machine Learning model that acts as a rapid filter to flag "Potentially Hazardous Pairs" before running the heavy physics calculations.
*   **Frontend (Visualization):** A React application using **CesiumJS** (a 3D globe library) to plot the Earth and satellite orbits.

### Hackathon Strategy & "Wow Factor"
*   **Avoid the N^2 Trap:** We will *not* try to calculate all 36,000 objects in space live (which would crash the laptop). We will pre-calculate the data in Google Colab and feed a static JSON file to our frontend for a flawless, 60fps demo.
*   **The Pitch Scenario:** We will inject a simulated piece of space debris into the JSON data so that it intercepts a Starlink satellite during our 4-minute demo. The 3D UI will flash a red alert and suggest an evasive maneuver.

---

## Proposal 2: Identifying Taxonomy and Assessing Biodiversity from eDNA Datasets (PS-07)

**Domain:** MedTech / BioTech / HealthTech & Life on Land
**The Problem:** Biologists collect environmental DNA (eDNA) from water/soil, resulting in massive text files of genomic sequences. They need software to identify which species those sequences belong to and map the biodiversity.
**The Goal:** Build a user-friendly bioinformatics dashboard that processes eDNA samples, matches them against known databases, and provides ecological insights (like detecting invasive species).

### Technical Architecture
*   **Data Source (The Database):** We will download the real DNA sequences of ~40 specific Indian animals/plants from the NCBI GenBank (forming a fast, local reference database).
*   **Data Source (The Location):** The GBIF (Global Biodiversity Information Facility) REST API.
*   **Backend (Processing):** A Python script that matches the uploaded eDNA sample against our curated local database using K-mer hashing (simulating tools like Kraken2).
*   **Frontend (Dashboard):** Next.js/React featuring interactive D3.js Sunburst charts for taxonomy.

### Hackathon Strategy & "Wow Factor"
*   **The Mock Sample:** We will construct a realistic `.FASTQ` sample file containing DNA from native Indian species, plus one highly invasive species (e.g., Water Hyacinth).
*   **The Pitch Scenario:** We upload the sample live. The dashboard instantly identifies the species and flashes a red alert for the invasive species. The app then automatically pings the GBIF API to pull a map showing everywhere else in India that invasive species has been found, providing real-time, actionable geospatial data.

---

## Next Steps for the Team
1.  **Recruit:** We must recruit 3 more members (including at least 1 female) to meet the strict SIH 6-member rule by August 11th.
2.  **Decide:** Choose between the 3D graphics challenge (Satellites) or the Data Visualization/Dashboard challenge (eDNA).
3.  **Prototype:** Begin using AI tools to generate the Python backend logic and the React frontend structure for the chosen project.
