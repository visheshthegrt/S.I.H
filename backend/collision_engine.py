import pandas as pd
import numpy as np
import json
from skyfield.api import load, EarthSatellite
from scipy.spatial.distance import pdist, squareform
import datetime
import os
import requests
import io

def auto_fetch_data():
    """Fetches live CSV data from Celestrak and saves it to disk."""
    print("Fetching live data from Celestrak...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    
    starlink_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=csv"
    debris_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=csv"
    
    try:
        # Fetch Starlink
        response_s = requests.get(starlink_url, headers=headers)
        if response_s.status_code == 200:
            with open('starlink.csv', 'w', encoding='utf-8') as f:
                f.write(response_s.text)
                print("Starlink data updated successfully.")
        
        # Fetch Debris
        response_d = requests.get(debris_url, headers=headers)
        if response_d.status_code == 200:
            with open('debris.csv', 'w', encoding='utf-8') as f:
                f.write(response_d.text)
                print("Debris data updated successfully.")
                
    except Exception as e:
        print(f"Failed to fetch data: {e}")

def load_data(starlink_path, debris_path):
    """Loads CSV data, handling potential file missing errors."""
    try:
        df = pd.read_csv(starlink_path)
        df_debris = pd.read_csv(debris_path)
        return df, df_debris
    except FileNotFoundError:
        print(f"ERROR: Could not find the CSV files.")
        print(f"Please ensure {starlink_path} and {debris_path} exist.")
        return None, None

def ai_pre_filter(df, df_debris):
    """
    Simulates an AI-driven filter by analyzing the orbital parameters (Mean Motion).
    Only debris occupying the same orbital altitude band as Starlink is retained.
    """
    print("\n--- RUNNING AI / MATH PRE-FILTER ---")
    
    starlink_min_motion = df['MEAN_MOTION'].min()
    starlink_max_motion = df['MEAN_MOTION'].max()
    print(f"Starlink 'Danger Zone': {starlink_min_motion:.2f} to {starlink_max_motion:.2f} revs/day")

    dangerous_debris = df_debris[
        (df_debris['MEAN_MOTION'] >= starlink_min_motion) & 
        (df_debris['MEAN_MOTION'] <= starlink_max_motion)
    ]
    
    print(f"Safe Debris Ignored: {len(df_debris) - len(dangerous_debris)}")
    print(f"Dangerous Debris Remaining: {len(dangerous_debris)}")
    
    # Randomly sample 500 Starlinks for testing/demo speed, and combine with all dangerous debris
    high_risk_objects = pd.concat([df.sample(n=500, random_state=42), dangerous_debris])
    return high_risk_objects

def run_physics_engine(high_risk_objects, output_path="collision_warnings.json", threshold_km=20.0, forecast_minutes=60):
    """
    Runs the Skyfield physics engine over a future time vector and 
    uses NumPy/SciPy vectorization to instantly calculate N^2 distances.
    """
    print(f"\n--- INITIALIZING PHYSICS ENGINE ---")
    ts = load.timescale()
    satellites = []
    names = []

    # Initialize orbital tracks
    for index, row in high_risk_objects.iterrows():
        try:
            sat = EarthSatellite.from_omm(ts, row.to_dict())
            satellites.append(sat)
            names.append(row['OBJECT_NAME'])
        except Exception:
            continue

    print(f"Loaded {len(satellites)} objects into the physics engine.")
    print(f"Simulating future collisions ({forecast_minutes} minute forecast)...")

    current_time = datetime.datetime.now(datetime.timezone.utc)
    collision_events = []

    # Time-stepping loop
    for minute_offset in range(forecast_minutes):
        future_time = current_time + datetime.timedelta(minutes=minute_offset)
        t = ts.from_datetime(future_time)
        
        # Calculate all X, Y, Z coordinates for this minute
        coords = [sat.at(t).position.km for sat in satellites]
        coords_array = np.array(coords)
        
        # Vectorized distance calculation
        distances = pdist(coords_array)
        dist_matrix = squareform(distances)
        
        # Filter hazardous pairs
        close_pairs = np.where((dist_matrix > 0) & (dist_matrix < threshold_km))
        
        for i, j in zip(close_pairs[0], close_pairs[1]):
            if i < j: 
                event = {
                    "timestamp": future_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "object_1": names[i],
                    "object_2": names[j],
                    "distance_km": round(dist_matrix[i, j], 2),
                    "obj1_x": coords_array[i][0],
                    "obj1_y": coords_array[i][1],
                    "obj1_z": coords_array[i][2],
                    "obj2_x": coords_array[j][0],
                    "obj2_y": coords_array[j][1],
                    "obj2_z": coords_array[j][2]
                }
                collision_events.append(event)
                print(f"⚠️ RISK: {names[i]} vs {names[j]} at {future_time.strftime('%H:%M')} (Distance: {dist_matrix[i,j]:.2f} km)")

    # Export
    with open(output_path, 'w') as f:
        json.dump(collision_events, f, indent=4)
        
    print(f"\nSimulation complete! Exported {len(collision_events)} warnings to {output_path}")


if __name__ == "__main__":
    print("=========================================")
    print("   SIH PS-33 COLLISION RISK ENGINE       ")
    print("=========================================")
    
    # 1. Automatically fetch the freshest data from Celestrak
    auto_fetch_data()
    
    # 2. Load the newly downloaded CSV files
    df, df_debris = load_data('starlink.csv', 'debris.csv')
    
    if df is not None and df_debris is not None:
        high_risk_subset = ai_pre_filter(df, df_debris)
        run_physics_engine(high_risk_subset)
