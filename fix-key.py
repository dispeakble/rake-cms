#!/usr/bin/env python3
path = "/home/hermes/rake-cms-2/src/lib/theme-generator/wordpress-output.ts"
with open(path, "r") as f:
    content = f.read()

old_key = "AIzaSyAzSNn342NHMLnqCAhyBd14PMckXJ0IZXc"
new_key = "${config.googleMapsApiKey || ''}"
count = content.count(old_key)
content = content.replace(old_key, new_key)

with open(path, "w") as f:
    f.write(content)

print(f"Replaced {count} occurrences of hardcoded Google Maps key")
