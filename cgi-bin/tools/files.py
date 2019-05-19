import sys
import cgi
import os
import requests
import pandas as pd
import csv
import chardet

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
	
	def csv_to_text(self):
		file_base = os.path.basename(self.form['filename'].value)
		filename, file_extension = os.path.splitext(file_base)
		csv_file = "../upload/" + file_base
		txt_file = "../upload/" + filename + ".txt"
		
		rawdata = b''
		with open(csv_file, 'rb') as thefile:
			while True:
				getdata = thefile.read(100000)
				if not getdata:
					break
				rawdata += getdata
		file_encoding = chardet.detect(rawdata)
		
		with open(csv_file, 'r', encoding=file_encoding['encoding']) as f:
			lines = f.readlines()
			with open(txt_file, "w", encoding=file_encoding['encoding']) as f1:
				f1.writelines(lines)
		self.output["html"] = 'File converted to text'		
		return self.output
		
def main():
	pass