import pandas as pd
import json
import random

def generate_demo_files():
    starlinks = []
    debris = []
    
    norad_id = 50000
    
    # 50 Randomly scattered Starlinks
    for i in range(50):
        norad_id += 1
        name = f"DEMO-STARLINK-{norad_id}"
        
        # Randomize RAAN and Mean Anomaly for realistic scatter
        raan = random.uniform(0, 360)
        mean_anomaly = random.uniform(0, 360)
        
        line1 = f"1 {norad_id:05d}U 20001B   26042.40000000  .00010000  00000+0  10000-3 0  9990"
        line2 = f"2 {norad_id:05d}  53.0500 {raan:08.4f} 0001000  90.0000 {mean_anomaly:08.4f} 15.0600000012345"
        
        starlinks.append({
            "OBJECT_NAME": name,
            "NORAD_CAT_ID": norad_id,
            "MEAN_MOTION": 15.06,
            "ECCENTRICITY": 0.0001,
            "INCLINATION": 53.05,
            "TLE_LINE1": line1,
            "TLE_LINE2": line2
        })
        
    # ONLY 1 piece of rigged debris on a direct collision course with the first Starlink
    target_starlink = starlinks[0]
    deb_norad = 60001
    deb_name = "DEMO-DEBRIS-THREAT"
    
    # Same RAAN but slightly offset mean anomaly so it crashes in the near future
    target_raan = float(target_starlink["TLE_LINE2"][17:25])
    target_mean_anomaly = float(target_starlink["TLE_LINE2"][43:51])
    deb_mean_anomaly = (target_mean_anomaly + 0.005) % 360
    
    deb_line1 = f"1 {deb_norad:05d}U 20001B   26042.40000000  .00010000  00000+0  10000-3 0  9990"
    deb_line2 = f"2 {deb_norad:05d}  53.0500 {target_raan:08.4f} 0001000  90.0000 {deb_mean_anomaly:08.4f} 15.0600000012345"
    
    debris.append({
        "OBJECT_NAME": deb_name,
        "NORAD_CAT_ID": deb_norad,
        "MEAN_MOTION": 15.06,
        "ECCENTRICITY": 0.0001,
        "INCLINATION": 53.05,
        "TLE_LINE1": deb_line1,
        "TLE_LINE2": deb_line2
    })
    
    # 20 randomly scattered safe debris pieces for background noise
    for i in range(20):
        safe_deb_norad = 60002 + i
        safe_deb_name = f"DEMO-DEBRIS-{safe_deb_norad}"
        safe_raan = random.uniform(0, 360)
        safe_mean_anomaly = random.uniform(0, 360)
        
        safe_line1 = f"1 {safe_deb_norad:05d}U 20001B   26042.40000000  .00010000  00000+0  10000-3 0  9990"
        safe_line2 = f"2 {safe_deb_norad:05d}  53.0500 {safe_raan:08.4f} 0001000  90.0000 {safe_mean_anomaly:08.4f} 15.0600000012345"
        
        debris.append({
            "OBJECT_NAME": safe_deb_name,
            "NORAD_CAT_ID": safe_deb_norad,
            "MEAN_MOTION": 15.06,
            "ECCENTRICITY": 0.0001,
            "INCLINATION": 53.05,
            "TLE_LINE1": safe_line1,
            "TLE_LINE2": safe_line2
        })
            
    df_starlink = pd.DataFrame(starlinks)
    df_debris = pd.DataFrame(debris)
    
    df_starlink.to_csv("demo_starlink.csv", index=False)
    df_debris.to_csv("demo_debris.csv", index=False)
    
    # Also create a JSON for the frontend to render the initial points
    frontend_catalog = []
    
    for obj in starlinks:
        frontend_catalog.append({
            "id": str(obj["NORAD_CAT_ID"]),
            "noradId": obj["NORAD_CAT_ID"],
            "name": obj["OBJECT_NAME"],
            "category": "starlink",
            "country": "USA",
            "launchYear": 2026,
            "orbitType": "LEO",
            "inclinationDeg": obj["INCLINATION"],
            "periodMinutes": 95,
            "apogeeKm": 550,
            "perigeeKm": 550,
            "description": "Demo mode satellite",
            "tle": {
                "line1": obj["TLE_LINE1"],
                "line2": obj["TLE_LINE2"]
            }
        })
        
    for obj in debris:
        frontend_catalog.append({
            "id": str(obj["NORAD_CAT_ID"]),
            "noradId": obj["NORAD_CAT_ID"],
            "name": obj["OBJECT_NAME"],
            "category": "debris",
            "country": "UNKNOWN",
            "launchYear": 2026,
            "orbitType": "LEO",
            "inclinationDeg": obj["INCLINATION"],
            "periodMinutes": 95,
            "apogeeKm": 550,
            "perigeeKm": 550,
            "description": "Demo mode threat",
            "tle": {
                "line1": obj["TLE_LINE1"],
                "line2": obj["TLE_LINE2"]
            }
        })
        
    with open("demo_catalog.json", "w") as f:
        json.dump(frontend_catalog, f, indent=4)
        
    print("Hollywood Demo files generated: demo_starlink.csv, demo_debris.csv, demo_catalog.json")

if __name__ == "__main__":
    generate_demo_files()
