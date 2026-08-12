# SIH Project: Collision Risk Engine (PS-33)

This repository contains the minimum viable product (MVP) for the **PS-33: AI-Driven Space Collision Risk Assessment** hackathon challenge.

## Architecture

This project is separated into two decoupled tiers:

### 1. The Backend (`/backend`)
A high-performance Python engine designed to ingest thousands of live telemetry datasets, filter them using mathematical and orbital heuristics, and calculate future Cartesian vectors.
*   **Technologies**: `pandas`, `skyfield`, `numpy`, `scipy`
*   **Key Feature**: Utilizes SciPy's C-optimized `pdist` for massive $N^2$ pairwise vectorization, bypassing the computational limits of standard Python execution.

### 2. The Frontend (`/frontend`)
A highly optimized, dependency-free vanilla JavaScript dashboard that natively renders complex 3D orbital data.
*   **Technologies**: `HTML5`, `CSS3`, `Vanilla JS`, `CesiumJS`
*   **Key Feature**: Runs instantly in any modern web browser without requiring a Node.js runtime, ensuring flawless live demonstrations.

## Setup & Demo

To run the live demonstration for the judges:
1. Ensure your backend has run and generated the collision warnings.
2. Navigate to the `frontend/` directory.
3. Open `index.html` in Google Chrome or Microsoft Edge.
4. The dashboard will automatically zoom to the critical collision vector.
