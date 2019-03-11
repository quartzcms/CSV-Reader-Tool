import sys
import cgi
import os
import requests
import pandas as pd

class Files():
	def __init__(self, form, output):
		self.form = form
		self.output = output
	
	def upload_file(self):
		try:
			uploaded_file_path = "none"
			form_file = self.form['file']
			if not form_file.file:
				message = 'Not found parameter: file'
			if not form_file.filename:
				message = 'Not found parameter: file'
			filename, file_extension = os.path.splitext(form_file.filename)
			if file_extension == '.csv':
				uploaded_file_path = os.path.join('../upload', os.path.basename(form_file.filename))
				with open(uploaded_file_path, 'wb') as fout:
					while True:
						chunk = form_file.file.read(100000)
						if not chunk:
							break
						fout.write(chunk)
				message = 'The file "' + form_file.filename + '" was uploaded successfully'
			else:
				message = 'The file is not a CSV document (.csv)'
			self.output["file"] = uploaded_file_path
		except KeyError:
			message = 'No file was uploaded'
		self.output["html"] = message
		
		return self.output
	
	def save_file(self):
		url_path = self.server.server_name + "/functions/save.php"
		params_form = self.form.keys()
		r = requests.post(url_path, params = params_form)
		data = r.json()
		self.output["html"] = data.output
		
		return self.output
	
	def delete_file(self):
		try:
			form_file = self.form['filename'].value
			if form_file != '':
				os.remove(form_file)
				message = 'The file was deleted'
			else:
				message = 'No file was deleted'
		except KeyError:
			message = 'No file was deleted'
		self.output["html"] = message
		
		return self.output
		
def main():
	pass