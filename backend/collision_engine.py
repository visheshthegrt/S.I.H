import pandas as pd
import numpy as np
import json
from skyfield.api import load, EarthSatellite
from scipy.spatial.distance import pdist, squareform
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import datetime
import requests

def auto_fetch_data():
    """Fetches live CSV data from Celestrak for Starlink and the 3 major debris events."""
    print("\n--- INGESTING GLOBAL TELEMETRY ---")
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    datasets = {
        'starlink.csv': "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=csv",
        'cosmos_debris.csv': "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=csv",
        'iridium_debris.csv': "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=csv",
        'fengyun_debris.csv': "https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=csv"
    }
    
    for filename, url in datasets.items():
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                print(f"[SUCCESS] Downloaded {filename}")
            else:
                print(f"[FAILED] HTTP {response.status_code} for {filename}")
        except Exception as e:
            print(f"Failed to fetch {filename}: {e}")

def load_data():
    """Loads all CSVs and returns the Starlink dataframe and a combined Debris dataframe."""
    try:
        df_starlink = pd.read_csv('starlink.csv')
        df_cosmos = pd.read_csv('cosmos_debris.csv')
        df_iridium = pd.read_csv('iridium_debris.csv')
        df_fengyun = pd.read_csv('fengyun_debris.csv')
        
        # Combine all debris into one massive global threat matrix
        df_debris_all = pd.concat([df_cosmos, df_iridium, df_fengyun], ignore_index=True)
        return df_starlink, df_debris_all
    except FileNotFoundError:
        print("ERROR: CSV files missing. Run auto_fetch_data() first.")
        return None, None

def ml_threat_classification(df_starlink, df_debris):
    """
    Uses Unsupervised Machine Learning (K-Means Clustering) to group satellites 
    into 'Orbital Neighborhoods' based on their 3D physical traits.
    """
    print("\n--- RUNNING AI: K-MEANS ORBITAL CLUSTERING ---")
    
    # 1. Prepare the data
    df_starlink['TYPE'] = 'STARLINK'
    df_debris['TYPE'] = 'DEBRIS'
    df_all = pd.concat([df_starlink, df_debris], ignore_index=True)
    
    # We feed the AI the 3 key dimensions of an orbit's shape
    features = ['MEAN_MOTION', 'ECCENTRICITY', 'INCLINATION']
    X = df_all[features].dropna()
    
    # 2. Normalize the data (Standard for Machine Learning)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 3. Train the Unsupervised Model to find 5 natural clusters in space
    print("Training ML Model on multidimensional orbital features...")
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    df_all.loc[X.index, 'CLUSTER'] = kmeans.fit_predict(X_scaled)
    
    # 4. Identify the "Starlink Neighborhood"
    # Find which cluster holds the majority of Starlink satellites
    starlink_cluster = df_all[df_all['TYPE'] == 'STARLINK']['CLUSTER'].mode()[0]
    
    # 5. Extract the threats: Any debris assigned to that exact same cluster by the AI
    threat_debris = df_all[(df_all['TYPE'] == 'DEBRIS') & (df_all['CLUSTER'] == starlink_cluster)]
    
    print(f"Global Debris Tracked: {len(df_debris)}")
    print(f"AI Filtered Safe Debris: {len(df_debris) - len(threat_debris)}")
    print(f"AI Identified High-Risk Debris: {len(threat_debris)} (Assigned to Cluster {int(starlink_cluster)})")
    
    # Sample 500 Starlinks for fast processing + the AI-flagged dangerous debris
    high_risk_objects = pd.concat([df_starlink.sample(n=500, random_state=42), threat_debris])
    return high_risk_objects

def run_physics_engine(high_risk_objects, output_path="collision_warnings.json", threshold_km=20.0, forecast_minutes=60):
    """Runs the Skyfield physics engine over a future time vector."""
    print(f"\n--- INITIALIZING PHYSICS ENGINE ---")
    ts = load.timescale()
    satellites = []
    names = []

    for index, row in high_risk_objects.iterrows():
        try:
            sat = EarthSatellite.from_omm(ts, row.to_dict())
            satellites.append(sat)
            names.append(row['OBJECT_NAME'])
        except Exception:
            continue

    print(f"Loaded {len(satellites)} high-risk objects into the physics engine.")
    print(f"Simulating future collisions ({forecast_minutes} minute forecast)...")

    current_time = datetime.datetime.now(datetime.timezone.utc)
    collision_events = []

    for minute_offset in range(forecast_minutes):
        future_time = current_time + datetime.timedelta(minutes=minute_offset)
        t = ts.from_datetime(future_time)
        
        coords = [sat.at(t).position.km for sat in satellites]
        coords_array = np.array(coords)
        
        distances = pdist(coords_array)
        dist_matrix = squareform(distances)
        
        close_pairs = np.where((dist_matrix > 0) & (dist_matrix < threshold_km))
        
        for i, j in zip(close_pairs[0], close_pairs[1]):
            if i < j: 
                event = {
                    "timestamp": future_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "object_1": names[i],
                    "object_2": names[j],
                    "distance_km": round(dist_matrix[i, j], 2),
                    "obj1_x": coords_array[i][0], "obj1_y": coords_array[i][1], "obj1_z": coords_array[i][2],
                    "obj2_x": coords_array[j][0], "obj2_y": coords_array[j][1], "obj2_z": coords_array[j][2]
                }
                collision_events.append(event)
                print(f"⚠️ RISK: {names[i]} vs {names[j]} at {future_time.strftime('%H:%M')} (Distance: {dist_matrix[i,j]:.2f} km)")

    with open(output_path, 'w') as f:
        json.dump(collision_events, f, indent=4)
        
    print(f"\nSimulation complete! Exported {len(collision_events)} warnings to {output_path}")

if __name__ == "__main__":
    print("==================================================")
    print("   SIH PS-33 AI COLLISION RISK ENGINE (GLOBAL)    ")
    print("==================================================")
    
    auto_fetch_data()
    df_starlink, df_debris = load_data()
    
    if df_starlink is not None and df_debris is not None:
        high_risk_subset = ml_threat_classification(df_starlink, df_debris)
        run_physics_engine(high_risk_subset)
