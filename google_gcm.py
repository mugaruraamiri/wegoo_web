
from gcm import GCM
import json
from bson import json_util

class GoogleGcm:
	"""docstring for GoogleGcm"""
	def __init__(self):
		#self.gcm = GCM("AIzaSyB5t50hsVaAmaDl0Vmk4QIVXqREvKW6eF0")
		self.gcm = GCM("AIzaSyCbx2F9DO1AGTyeNJWraQjC2Z7WEnBfwgo")

	def sendNotification(self, userToken, notification):

		#registration_ids = ["your token 1", "your token 2"]

		# notification = {
		#     "title": "Awesome App Update",
		#     "message": "Tap here to start the update!",
		#     "uri": "market://details?id=gcm.play.android.samples.com.gcmquickstart"
		# }

		notification_array = json.dumps({'registration_ids':userToken, 
										   'data': notification,
										   'collaspe_key':'wegooapp_update',
										   'restricted_package_name':"gcm.play.android.samples.com.gcmquickstart",
										   'priority':'hight',
										   'delay_while_idle':False})

		gcm_server = self.gcm
		responce = gcm_server.json_request(registration_ids = userToken,data = notification)

		if responce and 'success' in responce:
			for reg_id, success_id in responce['success'].items():
				return 'Successfully sent notification for reg_id {0}'.format(reg_id)

		if 'errors' in responce:
			for error, reg_ids in responce['errors'].items():
				if error in ['NotRegistered', 'InvalidRegistration']:
					for reg_id in reg_ids:
						return "Removing reg_id: {0} from db".format(reg_id) 

if __name__ == "__main__":
	notification = GoogleGcm()

		