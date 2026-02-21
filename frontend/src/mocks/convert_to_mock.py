import json

INPUT_FILE = "fleet_mock_data.json"
OUTPUT_FILE = "data.ts"

def format_ts_export(name, data):
    return f"export const {name} = {json.dumps(data, indent=2)};\n\n"

with open(INPUT_FILE, "r") as f:
    data = json.load(f)

ts_content = ""

ts_content += format_ts_export("mockUsers", data["users"])
ts_content += format_ts_export("mockVehicles", data["vehicles"])
ts_content += format_ts_export("mockDrivers", data["drivers"])
ts_content += format_ts_export("mockTrips", data["trips"])
ts_content += format_ts_export("mockExpenses", data["expenses"])

with open(OUTPUT_FILE, "w") as f:
    f.write(ts_content)

print("✅ TypeScript mock file generated as mockData.ts")