export interface CollisionWarning {
  timestamp: string;
  object_1: string;
  object_2: string;
  distance_km: number;
  obj1_x: number;
  obj1_y: number;
  obj1_z: number;
  obj2_x: number;
  obj2_y: number;
  obj2_z: number;
  risk_level: string;
  event_type: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getCollisionWarnings(): Promise<CollisionWarning[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/collision-warnings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch collision warnings:', error);
    return [];
  }
}

export async function runCollisionAnalysis(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/run-collision`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to trigger collision analysis:', error);
    throw error;
  }
}

export async function runDemoSimulation(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/run-demo`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to trigger demo simulation:', error);
    throw error;
  }
}
