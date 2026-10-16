import csv
import codecs
import html
import re
import shutil
import uuid
from datetime import datetime
from pathlib import Path, PurePosixPath

import chardet
try:
    from charset_normalizer import from_bytes as charset_candidates
except ImportError:
    charset_candidates = None


UPLOAD_DIRECTORY = Path(__file__).resolve().parents[2] / "upload"
FIELD_PATTERN = re.compile(r"^(col|col_index)\[(\d+)\]\[(\d+)\]$")


class FileActionError(Exception):
    """An expected error caused by an invalid or unavailable file action."""


def field_value(form, name, default=""):
    try:
        field = form[name]
    except KeyError:
        return default
    if isinstance(field, list):
        field = field[0] if field else default
    return getattr(field, "value", field)


def resolve_upload_file(value):
    normalized = str(value or "").replace("\\", "/")
    filename = PurePosixPath(normalized).name
    if not filename or filename in (".", "..") or Path(filename).suffix.lower() != ".csv":
        raise FileActionError("Please select a valid CSV file.")

    path = (UPLOAD_DIRECTORY / filename).resolve()
    if path.parent != UPLOAD_DIRECTORY.resolve():
        raise FileActionError("Invalid file path.")
    return path


def new_filename():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return "{}_{}.csv".format(timestamp, uuid.uuid4().hex[:8])


def decode_csv(raw_data):
    byte_order_marks = (
        (codecs.BOM_UTF32_LE, "utf-32"),
        (codecs.BOM_UTF32_BE, "utf-32"),
        (codecs.BOM_UTF8, "utf-8-sig"),
        (codecs.BOM_UTF16_LE, "utf-16"),
        (codecs.BOM_UTF16_BE, "utf-16"),
    )
    for mark, encoding in byte_order_marks:
        if raw_data.startswith(mark):
            return raw_data.decode(encoding)

    encoding = detect_unicode_byte_order(raw_data)
    if encoding:
        return raw_data.decode(encoding)

    try:
        return raw_data.decode("utf-8")
    except UnicodeDecodeError:
        pass

    detection = chardet.detect(raw_data)
    detected_encoding = detection.get("encoding")
    if detected_encoding and detection.get("confidence", 0) >= 0.9:
        try:
            return raw_data.decode(detected_encoding)
        except (LookupError, UnicodeDecodeError):
            pass

    if charset_candidates is not None:
        for candidate in charset_candidates(raw_data):
            if candidate.percent_chaos > 10:
                continue
            try:
                return raw_data.decode(candidate.encoding)
            except (LookupError, UnicodeDecodeError):
                continue

    if detected_encoding:
        try:
            return raw_data.decode(detected_encoding)
        except (LookupError, UnicodeDecodeError):
            pass

    for encoding in ("cp1252", "latin-1"):
        try:
            return raw_data.decode(encoding)
        except UnicodeDecodeError:
            continue

    return raw_data.decode("utf-8", errors="replace")


def detect_unicode_byte_order(raw_data):
    sample = raw_data[:4096]
    if not sample or b"\x00" not in sample:
        return None

    length = len(sample)
    if length >= 4:
        positions = [sample[index::4].count(0) for index in range(4)]
        totals = [len(sample[index::4]) for index in range(4)]
        ratios = [
            positions[index] / totals[index] if totals[index] else 0
            for index in range(4)
        ]
        if ratios[1] > 0.6 and ratios[2] > 0.6 and ratios[3] > 0.6 and ratios[0] < 0.1:
            return "utf-32-le"
        if ratios[0] > 0.6 and ratios[1] > 0.6 and ratios[2] > 0.6 and ratios[3] < 0.1:
            return "utf-32-be"

    if length >= 2:
        even_ratio = sample[0::2].count(0) / len(sample[0::2])
        odd_ratio = sample[1::2].count(0) / len(sample[1::2])
        if odd_ratio > 0.3 and even_ratio < 0.1:
            return "utf-16-le"
        if even_ratio > 0.3 and odd_ratio < 0.1:
            return "utf-16-be"
    return None


class Files:
    def __init__(self, form, output=None):
        self.form = form
        self.output = output if output is not None else {}

    def upload_file(self):
        try:
            form_file = self.form["file"]
        except KeyError:
            raise FileActionError("No file was uploaded.")

        if isinstance(form_file, list):
            form_file = form_file[0] if form_file else None
        if form_file is None or not getattr(form_file, "file", None):
            raise FileActionError("No file was uploaded.")

        original_name = str(getattr(form_file, "filename", "") or "")
        if Path(original_name.replace("\\", "/")).suffix.lower() != ".csv":
            raise FileActionError("The file is not a CSV document (.csv).")

        UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
        filename = new_filename()
        destination = UPLOAD_DIRECTORY / filename
        try:
            with destination.open("xb") as output_file:
                while True:
                    chunk = form_file.file.read(100000)
                    if not chunk:
                        break
                    output_file.write(chunk)
        except OSError:
            try:
                destination.unlink()
            except FileNotFoundError:
                pass
            raise

        self.output.update({
            "file": "upload/" + filename,
            "html": 'The file "{}" was uploaded successfully'.format(
                html.escape(PurePosixPath(original_name.replace("\\", "/")).name)
            ),
        })
        return self.output

    def save_file(self):
        source = resolve_upload_file(field_value(self.form, "file"))
        if not source.is_file():
            raise FileActionError("The file to save could not be found.")

        headers = {}
        rows = {}
        for name in self.form.keys():
            match = FIELD_PATTERN.match(name)
            if not match:
                continue
            kind, row_index, column_index = match.groups()
            field = self.form[name]
            if isinstance(field, list):
                value = field[0].value if field else ""
            else:
                value = getattr(field, "value", field)
            target = headers if kind == "col_index" else rows
            target.setdefault(int(row_index), {})[int(column_index)] = str(value or "")

        if not headers:
            raise FileActionError("The table contains no column headers.")

        header_cells = headers.get(0, {})
        column_count = max(
            max(header_cells, default=-1) + 1,
            max((max(row) + 1 for row in rows.values() if row), default=0),
        )
        ordered_headers = [
            header_cells.get(index, "").strip() or "Column {}".format(index + 1)
            for index in range(column_count)
        ]
        ordered_rows = [
            [row.get(index, "") for index in range(column_count)]
            for _, row in sorted(rows.items())
        ]

        filename = new_filename()
        destination = UPLOAD_DIRECTORY / filename
        try:
            with destination.open("w", encoding="utf-8-sig", newline="") as csv_file:
                writer = csv.writer(csv_file)
                writer.writerow(ordered_headers)
                writer.writerows(ordered_rows)
        except OSError:
            try:
                destination.unlink()
            except FileNotFoundError:
                pass
            raise

        self.output.update({
            "html": "The file was saved",
            "file": "upload/" + filename,
        })
        return self.output

    def delete_file(self):
        path = resolve_upload_file(field_value(self.form, "filename"))
        if not path.is_file():
            raise FileActionError("No file was deleted.")
        path.unlink()
        self.output["html"] = "The file was deleted"
        return self.output

    def csv_to_text(self):
        source = resolve_upload_file(field_value(self.form, "filename"))
        if not source.is_file():
            raise FileActionError("No files to convert.")
        destination = source.with_suffix(".txt")
        shutil.copyfile(source, destination)
        self.output.update({
            "html": "File converted to text",
            "file": "upload/" + destination.name,
        })
        return self.output
