# Neuro-Nav: Safe Haven & Noise Logic Technical Documentation

This document explains the technical implementation of how Neuro-Nav identifies "Safe Havens" and calculates noise-level inferences (Calm Scores) for users.

## 1. Safe Haven Discovery Logic

The core of the Safe Haven system is built on **OpenStreetMap (OSM)** data, accessed dynamically via the **Overpass API**.

### Discovery Mechanism
1.  **Geolocation**: The application retrieves the user's current GPS coordinates (`latitude`, `longitude`) via the browser's Geolocation API.
2.  **API Querying**: A specialized query is sent to multiple Overpass API mirrors (to ensure high availability).
3.  **Proximity Filtering**: The system scans within a radius of **1.5km to 3.0km** for specific amenities known for their sensory-friendly characteristics.

### Identification Heuristics
Safe Havens are classified into three primary categories based on their inherent acoustic and structural properties:

| Category | OSM Tag | Rationale | Noise Profile |
| :--- | :--- | :--- | :--- |
| **Parks** | `leisure=park` | Open spaces with soft landscaping (trees/grass) that naturally dampen urban sound. | Low (Inferred) |
| **Libraries** | `amenity=library` | Indoor environments with enforced silence policies and thick acoustic walls. | Minimal (Inferred) |
| **Cafes** | `amenity=cafe` | Transition zones that provide moderate isolation from street traffic. | Moderate (Filtered) |

---

## 2. Noise Level (Low Decibel) Inference

Neuro-Nav currently uses a **Heuristic Noise Inference Model** rather than real-time hardware decibel sensors. This approach provides a predictive "atmospheric" score of the surrounding area.

### The "Calm Score" Algorithm
The system calculates a `Calm Score` on a scale of **1.0 (High Stress)** to **10.0 (Absolute Calm)** using the following weighted formula:

$$Score = \text{Base (3.5)} + (Parks \times 0.8) + (Libraries \times 0.7) + (Cafes \times 0.25)$$

#### Variable Breakdown:
*   **Base Score (3.5)**: Represents the default ambient noise level of a standard urban environment.
*   **Park Weight (0.8)**: High contribution toward calm as vegetation significantly reduces decibel levels.
*   **Library Weight (0.7)**: Significant contribution due to interior soundproofing and cultural silence.
*   **Cafe Weight (0.25)**: Slight contribution as they provide respite from direct traffic noise but may have internal sound.

### Normalization
The final value is bounded using `Math.min(10, Math.max(1, score))` to ensure it remains within the standard 1-10 range before being presented to the user.

---

## 3. Data Integrity & Retrieval
To ensure that "low decibel" data is accurate and available:
*   **Haversine Formula**: Used to calculate precise distances from the user to the destination.
*   **Mirroring Strategy**: The system rotates through 4 distinct global Overpass servers (`overpass-api.de`, `lz4.overpass-api.de`, etc.) to prevent failures.
*   **Real-time Processing**: Data is never cached; it is fetched fresh whenever the user enters the Safe Havens directory or the Dashboard, ensuring reflecting the most current area mapping.
