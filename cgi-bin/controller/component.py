import cgi
import sys
sys.path.append("tools")
import tools.files as files
import tools.load as load

class Excel():
	def __init__(self, form, output):
		self.form = form
		self.output = output
	
	def action(self):
		try:
			form_field =  self.form['action'].value
		except KeyError:
			form_field =  ""
		return form_field
		
	def selection(self):
		target = self.action()			
		files_class = files.Files(self.form, {})
		load_class = load.Load(self.form, {})
		
		if target == 'save':
			self.output = files_class.save_file()
		elif target == 'upload':
			self.output = files_class.upload_file()
		elif target == 'delete':
			self.output = files_class.delete_file()
		elif target == 'load':
			self.output = load_class.import_document()
		return self.output
	
def main(form_cgi):	
	excel_class = Excel(form_cgi, {})
	return excel_class.selection()