"""Unit Convert — Module 221. Usage: unit_convert.py "100 km to miles" or unit_convert.py "32 F to C" """
import sys, re

# Conversion factors to base unit
UNITS = {
    # Length (base: meter)
    "m": 1, "meter": 1, "meters": 1, "metre": 1,
    "km": 1000, "kilometer": 1000, "kilometers": 1000, "kilometre": 1000,
    "cm": 0.01, "centimeter": 0.01, "centimeters": 0.01,
    "mm": 0.001, "millimeter": 0.001, "millimeters": 0.001,
    "nm": 1e-9, "nanometer": 1e-9, "nanometers": 1e-9,
    "mi": 1609.344, "mile": 1609.344, "miles": 1609.344,
    "yd": 0.9144, "yard": 0.9144, "yards": 0.9144,
    "ft": 0.3048, "foot": 0.3048, "feet": 0.3048,
    "in": 0.0254, "inch": 0.0254, "inches": 0.0254,
    "nmi": 1852, "nautical mile": 1852,
    # Weight (base: kg)
    "kg": (1, "weight"), "kilogram": (1, "weight"), "kilograms": (1, "weight"),
    "g": (0.001, "weight"), "gram": (0.001, "weight"), "grams": (0.001, "weight"),
    "mg": (1e-6, "weight"), "milligram": (1e-6, "weight"),
    "lb": (0.453592, "weight"), "lbs": (0.453592, "weight"), "pound": (0.453592, "weight"), "pounds": (0.453592, "weight"),
    "oz": (0.0283495, "weight"), "ounce": (0.0283495, "weight"), "ounces": (0.0283495, "weight"),
    "t": (1000, "weight"), "tonne": (1000, "weight"), "ton": (1000, "weight"),
    "st": (6.35029, "weight"), "stone": (6.35029, "weight"),
    # Volume (base: litre)
    "l": (1, "volume"), "liter": (1, "volume"), "litre": (1, "volume"), "liters": (1, "volume"), "litres": (1, "volume"),
    "ml": (0.001, "volume"), "milliliter": (0.001, "volume"), "millilitre": (0.001, "volume"),
    "gal": (3.78541, "volume"), "gallon": (3.78541, "volume"), "gallons": (3.78541, "volume"),
    "qt": (0.946353, "volume"), "quart": (0.946353, "volume"), "quarts": (0.946353, "volume"),
    "pt": (0.473176, "volume"), "pint": (0.473176, "volume"), "pints": (0.473176, "volume"),
    "fl oz": (0.0295735, "volume"), "fluid ounce": (0.0295735, "volume"),
    "cup": (0.236588, "volume"), "cups": (0.236588, "volume"),
    "tbsp": (0.0147868, "volume"), "tablespoon": (0.0147868, "volume"),
    "tsp": (0.00492892, "volume"), "teaspoon": (0.00492892, "volume"),
    # Speed (base: m/s)
    "m/s": (1, "speed"), "mps": (1, "speed"),
    "km/h": (1/3.6, "speed"), "kph": (1/3.6, "speed"), "kmh": (1/3.6, "speed"),
    "mph": (0.44704, "speed"), "mi/h": (0.44704, "speed"),
    "knot": (0.514444, "speed"), "knots": (0.514444, "speed"),
    # Data (base: byte)
    "b": (0.125, "data"), "bit": (0.125, "data"), "bits": (0.125, "data"),
    "byte": (1, "data"), "bytes": (1, "data"),
    "kb": (1024, "data"), "kilobyte": (1024, "data"), "kilobytes": (1024, "data"),
    "mb": (1024**2, "data"), "megabyte": (1024**2, "data"), "megabytes": (1024**2, "data"),
    "gb": (1024**3, "data"), "gigabyte": (1024**3, "data"), "gigabytes": (1024**3, "data"),
    "tb": (1024**4, "data"), "terabyte": (1024**4, "data"), "terabytes": (1024**4, "data"),
    "pb": (1024**5, "data"), "petabyte": (1024**5, "data"),
    "kib": (1024, "data"), "mib": (1024**2, "data"), "gib": (1024**3, "data"), "tib": (1024**4, "data"),
    # Energy (base: joule)
    "j": (1, "energy"), "joule": (1, "energy"), "joules": (1, "energy"),
    "kj": (1000, "energy"), "kilojoule": (1000, "energy"),
    "cal": (4.184, "energy"), "calorie": (4.184, "energy"),
    "kcal": (4184, "energy"), "kilocalorie": (4184, "energy"),
    "wh": (3600, "energy"), "watt-hour": (3600, "energy"),
    "kwh": (3600000, "energy"), "kilowatt-hour": (3600000, "energy"),
    "btu": (1055.06, "energy"), "btus": (1055.06, "energy"),
    # Pressure (base: pascal)
    "pa": (1, "pressure"), "pascal": (1, "pressure"),
    "kpa": (1000, "pressure"), "kilopascal": (1000, "pressure"),
    "bar": (100000, "pressure"),
    "psi": (6894.76, "pressure"),
    "atm": (101325, "pressure"), "atmosphere": (101325, "pressure"),
    "mmhg": (133.322, "pressure"), "torr": (133.322, "pressure"),
}

def parse_input(text: str):
    text = text.strip().lower()
    # "VALUE UNIT to UNIT" or "VALUE UNIT in UNIT"
    m = re.match(r'^([\d.]+)\s+(.+?)\s+(?:to|in)\s+(.+)$', text)
    if m:
        return float(m.group(1)), m.group(2).strip(), m.group(3).strip()
    # Temperature: "32 F to C"
    return None, None, None

def temp_convert(val: float, from_u: str, to_u: str) -> float | None:
    F_UNITS = {"f", "fahrenheit"}
    C_UNITS = {"c", "celsius", "°c"}
    K_UNITS = {"k", "kelvin"}
    if from_u in C_UNITS and to_u in F_UNITS:
        return val * 9/5 + 32
    if from_u in F_UNITS and to_u in C_UNITS:
        return (val - 32) * 5/9
    if from_u in C_UNITS and to_u in K_UNITS:
        return val + 273.15
    if from_u in K_UNITS and to_u in C_UNITS:
        return val - 273.15
    if from_u in F_UNITS and to_u in K_UNITS:
        return (val - 32) * 5/9 + 273.15
    if from_u in K_UNITS and to_u in F_UNITS:
        return (val - 273.15) * 9/5 + 32
    return None

def smart_format(n: float) -> str:
    if abs(n) >= 1e12 or (abs(n) < 1e-6 and n != 0):
        return f"{n:.6e}"
    if abs(n) >= 1000:
        return f"{n:,.6g}"
    return f"{n:.10g}"

def main():
    print("[MODULE 221] UNIT CONVERTER")
    print("[SOURCE]     Pure Python — length/weight/volume/speed/data/energy/pressure/temperature")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  unit_convert.py \"100 km to miles\"")
        print("         unit_convert.py \"5 GB to MB\"")
        print("         unit_convert.py \"32 F to C\"")
        print("         unit_convert.py \"1 atm to psi\"")
        sys.exit(0)

    text = raw
    print(f"[INPUT]  {text}")
    print()

    val, from_u, to_u = parse_input(text)
    if val is None:
        print("[ERROR] Could not parse — use format: VALUE UNIT to UNIT")
        print("  Example: 100 km to miles")
        sys.exit(1)

    # Temperature
    temp_res = temp_convert(val, from_u, to_u)
    if temp_res is not None:
        print(f"[RESULT]  {smart_format(val)} {from_u.upper()} = {smart_format(temp_res)} {to_u.upper()}")
        # Show all three
        C_UNITS = {"c", "celsius", "°c"}
        F_UNITS = {"f", "fahrenheit"}
        if from_u in C_UNITS:
            c = val; f = val*9/5+32; k = val+273.15
        elif from_u in F_UNITS:
            f = val; c = (val-32)*5/9; k = c+273.15
        else:
            k = val; c = val-273.15; f = c*9/5+32
        print()
        print(f"  Celsius:    {smart_format(c)} °C")
        print(f"  Fahrenheit: {smart_format(f)} °F")
        print(f"  Kelvin:     {smart_format(k)} K")
        sys.exit(0)

    # Other units
    from_entry = UNITS.get(from_u)
    to_entry   = UNITS.get(to_u)

    if not from_entry:
        print(f"[ERROR] Unknown unit: '{from_u}'")
        sys.exit(1)
    if not to_entry:
        print(f"[ERROR] Unknown unit: '{to_u}'")
        sys.exit(1)

    from_factor = from_entry[0] if isinstance(from_entry, tuple) else from_entry
    to_factor   = to_entry[0] if isinstance(to_entry, tuple) else to_entry
    from_cat    = from_entry[1] if isinstance(from_entry, tuple) else "length"
    to_cat      = to_entry[1] if isinstance(to_entry, tuple) else "length"

    if from_cat != to_cat:
        print(f"[ERROR] Cannot convert between {from_cat} and {to_cat}")
        sys.exit(1)

    base  = val * from_factor
    result = base / to_factor

    print(f"[RESULT]  {smart_format(val)} {from_u} = {smart_format(result)} {to_u}")
    print(f"[CATEGORY] {from_cat}")

    print()
    print("[DONE] Unit conversion complete.")

if __name__ == "__main__":
    main()
