import uuid
import random
import json
from datetime import datetime, timedelta
import math

# ==============================
# CONFIGURATION
# ==============================

NUM_VEHICLES = 50
NUM_DRIVERS = 70
NUM_TRIPS = 200
MONTHS_HISTORY = 6

BASE_REVENUE = 500
RATE_PER_KM = 25
FUEL_COST_PER_LITER = 95
KM_PER_LITER = 5

# India bounding box
INDIA_LAT_MIN = 8.0
INDIA_LAT_MAX = 37.0
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 97.0

vehicle_categories = ['Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck']
vehicle_capacity_map = {
    'Bike': (30, 80),
    '3_Wheeler': (200, 600),
    'Mini_Truck': (500, 1200),
    'Medium_Truck': (1500, 3000),
    'Heavy_Truck': (4000, 10000),
}

# New vehicle attributes
vehicle_brands = ['Tata', 'Mahindra', 'Ashok Leyland', 'Eicher', 'Force Motors', 'Bajaj', 'Toyota', 'Ford']

def random_brand():
    return random.choice(vehicle_brands)

def random_manufacturing_year():
    current_year = datetime.utcnow().year
    return random.randint(1990, current_year)

def random_registration_date():
    # Random date within last 10 years
    days = random.randint(0, 365 * 10)
    return (datetime.utcnow() - timedelta(days=days)).date().isoformat()


# ==============================
# UTILITIES
# ==============================

def random_point_india():
    return (
        random.uniform(INDIA_LAT_MIN, INDIA_LAT_MAX),
        random.uniform(INDIA_LON_MIN, INDIA_LON_MAX),
    )

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

def random_date():
    days = MONTHS_HISTORY * 30
    return datetime.utcnow() - timedelta(days=random.randint(0, days))

# ==============================
# USERS
# ==============================

users = [
    {
        "id": str(uuid.uuid4()),
        "email": "dispatcher@fleet.com",
        "full_name": "Main Dispatcher",
        "role": "Dispatcher",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "email": "finance@fleet.com",
        "full_name": "Finance Officer",
        "role": "Finance",
        "is_active": True
    }
]

dispatcher_id = users[0]["id"]
finance_id = users[1]["id"]

# ==============================
# VEHICLES
# ==============================

vehicles = []
for _ in range(NUM_VEHICLES):
    category = random.choice(vehicle_categories)
    min_cap, max_cap = vehicle_capacity_map[category]

    vehicles.append({
        "id": str(uuid.uuid4()),
        "license_plate": f"IN-{random.randint(1000,9999)}",
        "category": category,
        "capacity_kg": random.randint(min_cap, max_cap),
        "capacity_volume_cft": round(random.uniform(50, 1200), 2),
        "current_odometer": random.randint(10000, 80000),
        "acquisition_cost": random.randint(300000, 3000000),
        "status": "Available",
        "brand": random_brand(),
        "manufacturing_year": random_manufacturing_year(),
        "registration_date": random_registration_date()
    })

# ==============================
# DRIVERS
# ==============================

drivers = []
for _ in range(NUM_DRIVERS):
    category = random.choice(vehicle_categories)

    drivers.append({
        "id": str(uuid.uuid4()),
        "full_name": f"Driver {random.randint(1000,9999)}",
        "phone_number": f"+91{random.randint(6000000000,9999999999)}",
        "license_number": f"LIC-{random.randint(100000,999999)}",
        "license_class": category,
        "license_expiry": (datetime.utcnow() + timedelta(days=1000)).date().isoformat(),
        "safety_score": random.randint(70, 100),
        "status": "Available"
    })

# Index drivers by class
drivers_by_class = {}
for d in drivers:
    drivers_by_class.setdefault(d["license_class"], []).append(d)

# ==============================
# TRIPS
# ==============================

trips = []
expenses = []

for _ in range(NUM_TRIPS):

    vehicle = random.choice(vehicles)

    # Find matching driver
    eligible_drivers = drivers_by_class.get(vehicle["category"], [])
    if not eligible_drivers:
        continue
    driver = random.choice(eligible_drivers)

    pickup_lat, pickup_lon = random_point_india()
    drop_lat, drop_lon = random_point_india()

    distance = round(haversine(pickup_lat, pickup_lon, drop_lat, drop_lon), 2)
    revenue = round(BASE_REVENUE + distance * RATE_PER_KM, 2)

    max_capacity = vehicle["capacity_kg"]
    cargo_weight = random.randint(int(max_capacity * 0.3), max_capacity)

    start_odo = vehicle["current_odometer"]
    end_odo = start_odo + int(distance)

    vehicle["current_odometer"] = end_odo

    trip_id = str(uuid.uuid4())

    status = random.choices(
        ["Completed", "In_Transit", "Cancelled"],
        weights=[0.7, 0.2, 0.1]
    )[0]

    trip_date = random_date()

    trips.append({
        "id": trip_id,
        "tracking_number": f"TRP-{random.randint(10000000,99999999)}",
        "vehicle_id": vehicle["id"],
        "driver_id": driver["id"],
        "dispatcher_id": dispatcher_id,
        "pickup_location": {"lat": pickup_lat, "lon": pickup_lon},
        "dropoff_location": {"lat": drop_lat, "lon": drop_lon},
        "pickup_address": "Random Pickup Location",
        "dropoff_address": "Random Drop Location",
        "cargo_weight_kg": cargo_weight,
        "estimated_distance_km": distance,
        "expected_revenue": revenue,
        "start_odometer": start_odo,
        "end_odometer": end_odo if status == "Completed" else None,
        "status": status,
        "receiver_otp": str(random.randint(100000,999999)) if status == "Completed" else None,
        "created_at": trip_date.isoformat()
    })

    # Fuel expense
    liters = distance / KM_PER_LITER
    fuel_cost = round(liters * FUEL_COST_PER_LITER, 2)

    expenses.append({
        "id": str(uuid.uuid4()),
        "vehicle_id": vehicle["id"],
        "trip_id": trip_id,
        "logged_by": finance_id,
        "category": "Fuel",
        "cost": fuel_cost,
        "volume_liters": round(liters, 2),
        "description": "Auto-generated fuel expense",
        "logged_at": trip_date.isoformat()
    })

# ==============================
# EXPORT JSON
# ==============================

output = {
    "users": users,
    "vehicles": vehicles,
    "drivers": drivers,
    "trips": trips,
    "expenses": expenses
}

with open("fleet_mock_data.json", "w") as f:
    json.dump(output, f, indent=2)

print("✅ Data generated successfully.")