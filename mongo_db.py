import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId

class WegooDb:
	""" this class conaines all the database methodes: creating collectons and documents entries """
	def __init__(self, host, databaseName):
		self.host = host
		self.databaseName = databaseName
		try:
			client = MongoClient(self.host)
			self.db = client[self.databaseName]
			print "databse conected successfuly"
		except Exception as e:
			print e

	def add_user(self, user):
		users = self.db.users
		try:
			userinfo = users.insert_one(user).inserted_id
			return userinfo
		except Exception as e:
			return e

	def update_user(self, userid, name, email, organ, title, phone, desc):
		user = self.db.users
		try:
			entry = user.update(
				                {'name': name},
					            {
					              '$set': 
					                {"name": name,"email": email,"organization": organ,"title": title,"phone": phone,"description": desc}}				                )
			return entry
		except Exception, e:
			return e

	def user_online(self, name, status):
		user = self.db.users
		try:
			entry = user.update(
					{'name': name},
					{'$set':
						{
							"online":status
						}
					}
				)
		except Exception, e:
			raise e

	#find patient by name-- letter add by ID and which devices
	def entry_exist(self, user_name):
		patientExist = self.db.patientInfos
		try:
			print "###########finding user ###############"
			entry = patientExist.find({"name":user_name})
			if entry:
			 	for d in entry:
			 		print "----------------------------"
			 		print d
			 		print "----------------------------"
			 		if d['name']:
			 			return True
			 		else:
			 			return False
			else:
				return False
		except Exception, e:
			print e
			return

	#Update patient info by name
	def updateDataFromApp(self, name, sensor_data):
	 	patientRecord = self.db.patientInfos
	 	try:
	 		print "Updating data from user"
	 		entry = patientRecord.update(
	 			{'name':name},
	 			{'$push':
	 				{
	 				  "vitalsigns":sensor_data
	 				}
	 			}
	 		)
	 		print "Data has been updated"
	 		return entry
	 	except Exception, e:
	 		print e
	 		return 
	 	
		

	def saveDataFromApp(self, patientData):
		patientInfos = self.db.patientInfos
		try:
			patient_id = patientInfos.insert_one(patientData).inserted_id
			print "Data has been saved"
			return patient_id
		except Exception as e:
			return e

	def getAllSensorData(self):
		entries = self.db.patientInfos
		try:
			entry = entries.find({ }, {"data": 0, "vitalsigns": 0 })
			if entry:
				return entry
		except Exception, e:
			raise e
			return "failed to get data"

	def getItemDetails(self, id):
		entry = self.db.patientInfos
		try:
			detail = entry.find({"_id": ObjectId(id)}).limit(15)
			if detail:
				return detail
		except Exception, e:
			raise e

	def UserAuthantication(self, username, password):
		#find user by username and password
		user = self.db.users
		try:
			userfound = user.find({"email":username, "password":password})
			return userfound
		except Exception as e:
			print e
			return e

	def find_user_by_name(self, username):
		#find user by username
		user = self.db.users
		try:
			entry = user.find({"name":username})
			return entry
		except Exception as e:
			print e

	def getFeedbackByptnId(self, id):
		#find feedback by patient id
		feedBackInfo = self.db.feedbacks
		try:
			entries = feedBackInfo.find({"patineID":id})
			return entries
		except Exception, e:
			raise e

	def add_feedback(self, newFeedBack):
		feedBackInfo = self.db.feedbacks
		try:
			feedback_id = feedBackInfo.insert_one(newFeedBack).inserted_id
			print "Data has been saved"
			return patient_id
		except Exception as e:
			return e

	def registerToken(self, token):
		userToken = self.db.userTokensInfo
		#return "success"
		print token
		try:
			result = userToken.insert_one(token)
			return "success"
		except Exception, e:
			raise e


	def deleteFeedbackItem(self, id):
		feedBackInfo = self.db.feedbacks
		try:
			deletedItem = feedBackInfo.delete_many({"_id": ObjectId(id)})
			return deletedItem
		except Exception, e:
			raise e

	def get_all_users(self):
		#find all users
		user = self.db.users
		try:
			entrys = user.find()
			return entrys
		except Exception as e:
			print e

	def getDeviceUuid(self, deviceuuid):
		entry = self.db.userTokensInfo
		try:
			result = entry.find({"Device_uuid":deviceuuid}, {"_id":0, "registered":0}).limit(1)
			return result
		except Exception, e:
			raise e

	def getFinalID(self, uid):
		entry = self.db.userTokensInfo
		try:
			result = entry.find({"Device_uuid":uid}, {"_id":0, "Device_uuid":0, "token":1})
			return result
		except Exception, e:
			raise e


if __name__ == "__main__":
	d = WegooDb()
