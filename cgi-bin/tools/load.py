import sys
import cgi
import os
import requests
import pandas as pd
import chardet

class Load():
	def __init__(self, form, output):
		try:
			self.file = form['filename'].value
		except KeyError:
			self.file =  ""
		self.output = output
	
	def import_document(self):
		if self.file:
			try:
				rawdata = b''
				with open(self.file, 'rb') as thefile:
					while True:
						getdata = thefile.read(100000)
						if not getdata:
							break
						rawdata += getdata
				file_encoding = chardet.detect(rawdata)
					
				table = pd.DataFrame.from_csv(self.file, header=0, sep=',', index_col=None, parse_dates=False, encoding=file_encoding['encoding'])
				table = table.to_json(orient = 'records')
				self.output["table"] = table.replace("null", "\"\"")
				
			except FileNotFoundError:
				self.output["html"] = 'No files to load'
		return self.output
def main():
	pass