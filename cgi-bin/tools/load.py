import csv
import io
import json

from tools.files import FileActionError, decode_csv, field_value, resolve_upload_file


class Load:
    def __init__(self, form, output=None):
        self.form = form
        self.output = output if output is not None else {}

    def import_document(self):
        path = resolve_upload_file(field_value(self.form, "filename"))
        if not path.is_file():
            raise FileActionError("No files to load.")

        text = decode_csv(path.read_bytes())
        reader = csv.reader(io.StringIO(text, newline=""))
        try:
            headers = next(reader)
        except StopIteration:
            raise FileActionError("The CSV file is empty.")

        unique_headers = []
        used_headers = set()
        for index, header in enumerate(headers):
            name = header.strip() or "Column {}".format(index + 1)
            candidate = name
            suffix = 2
            while candidate in used_headers:
                candidate = "{} ({})".format(name, suffix)
                suffix += 1
            unique_headers.append(candidate)
            used_headers.add(candidate)

        records = []
        for row in reader:
            records.append({
                header: row[index] if index < len(row) else ""
                for index, header in enumerate(unique_headers)
            })

        self.output["table"] = json.dumps(records, ensure_ascii=False)
        return self.output
