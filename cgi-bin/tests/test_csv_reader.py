import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from controller.component import Excel
from tools import files


class Field:
    def __init__(self, value):
        self.value = value


class UploadField:
    def __init__(self, filename, contents):
        self.filename = filename
        self.file = io.BytesIO(contents)


class Form(dict):
    pass


class CsvReaderTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.upload_dir = Path(self.temp_dir.name)
        self.upload_patch = patch.object(files, "UPLOAD_DIRECTORY", self.upload_dir)
        self.upload_patch.start()

    def tearDown(self):
        self.upload_patch.stop()
        self.temp_dir.cleanup()

    def test_loads_csv_rows_and_normalizes_duplicate_headers(self):
        csv_path = self.upload_dir / "source.csv"
        csv_path.write_text("name,name,\nAda,Lovelace,London\n", encoding="utf-8")
        form = Form(action=Field("load"), filename=Field("upload/source.csv"))

        result = Excel(form).selection()

        self.assertEqual(json.loads(result["table"]), [{
            "name": "Ada",
            "name (2)": "Lovelace",
            "Column 3": "London",
        }])

    def test_load_save_round_trip_normalizes_common_csv_encodings_to_utf8(self):
        text = "name,city\nAndr\u00e9,Montr\u00e9al\n"
        samples = {
            "utf-8": text.encode("utf-8"),
            "utf-8-sig": text.encode("utf-8-sig"),
            "utf-16": text.encode("utf-16"),
            "utf-16-le-no-bom": text.encode("utf-16-le"),
            "utf-16-be-no-bom": text.encode("utf-16-be"),
            "utf-32": text.encode("utf-32"),
            "utf-32-le-no-bom": text.encode("utf-32-le"),
            "utf-32-be-no-bom": text.encode("utf-32-be"),
            "cp1252": text.encode("cp1252"),
            "latin-1": text.encode("latin-1"),
        }

        for encoding, contents in samples.items():
            with self.subTest(encoding=encoding):
                source_path = self.upload_dir / "source.csv"
                source_path.write_bytes(contents)
                loaded = Excel(Form(
                    action=Field("load"),
                    filename=Field("upload/source.csv"),
                )).selection()
                rows = json.loads(loaded["table"])
                self.assertEqual(rows, [{
                    "name": "Andr\u00e9",
                    "city": "Montr\u00e9al",
                }])

                save_form = Form({
                    "action": Field("save"),
                    "file": Field("upload/source.csv"),
                    "col_index[0][0]": Field("name"),
                    "col_index[0][1]": Field("city"),
                    "col[1][0]": Field(rows[0]["name"]),
                    "col[1][1]": Field(rows[0]["city"]),
                })
                saved = Excel(save_form).selection()
                self.assertFalse(saved.get("error"), saved.get("html"))

                reloaded = Excel(Form(
                    action=Field("load"),
                    filename=Field(saved["file"]),
                )).selection()
                self.assertEqual(json.loads(reloaded["table"]), rows)

    def test_round_trips_detected_multibyte_legacy_encodings(self):
        samples = {
            "shift_jis": (
                "name,city\n\u592a\u90ce,\u6771\u4eac\n",
                "shift_jis",
            ),
            "gbk": (
                "name,city\n\u5f20\u4e09,\u5317\u4eac\n",
                "gbk",
            ),
        }
        for encoding, (text, codec) in samples.items():
            with self.subTest(encoding=encoding):
                (self.upload_dir / "source.csv").write_bytes(text.encode(codec))
                loaded = Excel(Form(
                    action=Field("load"),
                    filename=Field("upload/source.csv"),
                )).selection()
                rows = json.loads(loaded["table"])
                self.assertEqual(rows, [{
                    "name": text.splitlines()[1].split(",")[0],
                    "city": text.splitlines()[1].split(",")[1],
                }])

                saved = Excel(Form({
                    "action": Field("save"),
                    "file": Field("upload/source.csv"),
                    "col_index[0][0]": Field("name"),
                    "col_index[0][1]": Field("city"),
                    "col[1][0]": Field(rows[0]["name"]),
                    "col[1][1]": Field(rows[0]["city"]),
                })).selection()
                self.assertFalse(saved.get("error"), saved.get("html"))
                reloaded = Excel(Form(
                    action=Field("load"),
                    filename=Field(saved["file"]),
                )).selection()
                self.assertEqual(json.loads(reloaded["table"]), rows)

    def test_load_and_save_handle_bytes_that_are_not_valid_in_known_encodings(self):
        (self.upload_dir / "source.csv").write_bytes(b"name,value\nentry,\x81\n")
        loaded = Excel(Form(
            action=Field("load"),
            filename=Field("upload/source.csv"),
        )).selection()
        rows = json.loads(loaded["table"])
        save_form = Form({
            "action": Field("save"),
            "file": Field("upload/source.csv"),
            "col_index[0][0]": Field("name"),
            "col_index[0][1]": Field("value"),
            "col[1][0]": Field(rows[0]["name"]),
            "col[1][1]": Field(rows[0]["value"]),
        })

        saved = Excel(save_form).selection()

        self.assertFalse(saved.get("error"), saved.get("html"))
        self.assertTrue((self.upload_dir / Path(saved["file"]).name).read_bytes().startswith(
            b"\xef\xbb\xbf"
        ))

    def test_save_writes_header_and_rows_to_a_new_version(self):
        (self.upload_dir / "source.csv").write_text("old,data\n", encoding="utf-8")
        form = Form({
            "action": Field("save"),
            "file": Field("upload/source.csv"),
            "col_index[0][0]": Field("name"),
            "col_index[0][1]": Field("city"),
            "col[1][0]": Field("Ada"),
            "col[1][1]": Field("London"),
        })

        result = Excel(form).selection()

        saved_path = self.upload_dir / Path(result["file"]).name
        self.assertEqual(result["html"], "The file was saved")
        self.assertEqual(saved_path.read_text(encoding="utf-8-sig"), "name,city\nAda,London\n")
        self.assertNotEqual(saved_path.name, "source.csv")

    def test_save_keeps_every_frontend_column_even_when_empty(self):
        (self.upload_dir / "source.csv").write_text("old\n", encoding="utf-8")
        form = Form({
            "action": Field("save"),
            "file": Field("upload/source.csv"),
            "col_index[0][0]": Field("name"),
            "col_index[0][1]": Field(""),
            "col_index[0][2]": Field("notes"),
            "col_index[0][3]": Field(""),
            "col[1][0]": Field("Ada"),
            "col[1][1]": Field(""),
            "col[1][2]": Field(""),
            "col[1][3]": Field(""),
            "col[2][0]": Field(""),
            "col[2][1]": Field(""),
            "col[2][2]": Field(""),
            "col[2][3]": Field(""),
        })

        result = Excel(form).selection()

        saved_path = self.upload_dir / Path(result["file"]).name
        self.assertEqual(
            saved_path.read_text(encoding="utf-8-sig"),
            "name,Column 2,notes,Column 4\nAda,,,\n,,,\n",
        )

    def test_rejects_non_csv_actions(self):
        result = Excel(Form(action=Field("load"), filename=Field("notes.txt"))).selection()
        self.assertEqual(result["html"], "Please select a valid CSV file.")
        self.assertTrue(result["error"])

    def test_uploads_csv_with_a_server_generated_filename(self):
        form = Form({
            "action": Field("upload"),
            "file": UploadField("source.csv", b"name\nAda\n"),
        })

        result = Excel(form).selection()

        uploaded_path = self.upload_dir / Path(result["file"]).name
        self.assertTrue(uploaded_path.is_file())
        self.assertEqual(uploaded_path.read_bytes(), b"name\nAda\n")

    def test_converts_and_deletes_csv(self):
        csv_path = self.upload_dir / "source.csv"
        csv_path.write_bytes(b"name\nAda\n")

        converted = Excel(Form(
            action=Field("convert"),
            filename=Field("upload/source.csv"),
        )).selection()
        self.assertEqual((self.upload_dir / "source.txt").read_bytes(), b"name\nAda\n")

        deleted = Excel(Form(
            action=Field("delete"),
            filename=Field("upload/source.csv"),
        )).selection()
        self.assertEqual(deleted["html"], "The file was deleted")
        self.assertFalse(csv_path.exists())


if __name__ == "__main__":
    unittest.main()
