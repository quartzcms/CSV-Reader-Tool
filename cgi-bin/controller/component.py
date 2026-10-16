import logging

from tools.files import FileActionError, Files, field_value
from tools.load import Load


class Excel:
    def __init__(self, form, output=None):
        self.form = form
        self.output = output if output is not None else {}
        files = Files(form, self.output)
        self.actions = {
            "upload": files.upload_file,
            "save": files.save_file,
            "delete": files.delete_file,
            "convert": files.csv_to_text,
            "load": Load(form, self.output).import_document,
        }

    def selection(self):
        action = field_value(self.form, "action")
        handler = self.actions.get(action)
        if handler is None:
            return {"error": True, "html": "Unsupported action.", "file": "none"}
        try:
            return handler()
        except FileActionError as error:
            return {"error": True, "html": str(error), "file": "none"}
        except OSError:
            logging.exception("CSV file operation failed")
            return {
                "error": True,
                "html": "The file operation could not be completed.",
                "file": "none",
            }


def main(form_cgi):
    return Excel(form_cgi).selection()
