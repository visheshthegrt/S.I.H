import pandas as pd
import json

def generate_demo_files():
    # Base TLE for a Starlink
    # 1 45177U 20001B   26042.40000000  .00010000  00000+0  10000-3 0  9990
    # 2 45177  53.0500 120.0000 0001000  90.0000 270.0000 15.0600000012345
    
    starlinks = []
    debris = []
    
    norad_id = 50000
    
    # 50 Starlinks
    for i in range(50):
        norad_id += 1
        name = f"DEMO-STARLINK-{norad_id}"
        
        # Vary the RAAN to spread them around the Earth
        raan = (i * (360/50)) % 360
        raan_str = f"{raan:08.4f}"
        mean_anomaly = 270.0000
        
        line1 = f"1 {norad_id:05d}U 20001B   26042.40000000  .00010000  00000+0  10000-3 0  9990"
        line2 = f"2 {norad_id:05d}  53.0500 {raan_str} 0001000  90.0000 {mean_anomaly:08.4f} 15.0600000012345"
        
        starlinks.append({
            "OBJECT_NAME": name,
            "NORAD_CAT_ID": norad_id,
            "MEAN_MOTION": 15.06,
            "ECCENTRICITY": 0.0001,
            "INCLINATION": 53.05,
            "TLE_LINE1": line1,
            "TLE_LINE2": line2
        })
        
        # 2 pieces of debris tailgating this exact Starlink
        for j in range(2):
            deb_norad = norad_id + 10000 + j
            deb_name = f"DEMO-DEBRIS-{deb_norad}"
            
            # Offset mean anomaly slightly so it's a few kilometers away but on the exact same track
            deb_mean_anomaly = mean_anomaly + (0.005 * (j+1))
            
            deb_line1 = f"1 {deb_norad:05d}U 20001B   26042.40000000  .00010000  00000+0  10000-3 0  9990"
            deb_line2 = f"2 {deb_norad:05d}  53.0500 {raan_str} 0001000  90.0000 {deb_mean_anomaly:08.4f} 15.0600000012345"
            
            debris.append({
                "OBJECT_NAME": deb_name,
                "NORAD_CAT_ID": deb_norad,
                "MEAN_MOTION": 15.06,
                "ECCENTRICITY": 0.0001,
                "INCLINATION": 53.05,
                "TLE_LINE1": deb_line1,
                "TLE_LINE2": deb_line2
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
