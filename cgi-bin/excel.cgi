#!/usr/bin/python3
import json
import cgi

import controller.component as component

# Blank fields must be kept so empty columns and cells are exported.
form = cgi.FieldStorage(keep_blank_values=True)
print("Content-Type: application/json; charset=utf-8")
print()
print(json.dumps(component.main(form)))