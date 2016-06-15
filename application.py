from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url
import tornado.wsgi
import os
import json
from bson import json_util
import tornado.escape
from datetime import datetime
from mongo_db import WegooDb
from google_gcm import GoogleGcm 

db = WegooDb('mongodb://localhost:27017/', 'test-wegoo')


gcm = GoogleGcm()
# new_user = {
#     "name":"Mugarura",
#     "username":"Amiri",
#     "password":"Amiri",
#     "registered_date":"10-10-10",
#     "last_login":"10-10-10"}
#
# db.add_user(new_user)

siteTitle = "WeGoo"

class BaseHadler(tornado.web.RequestHandler):
    def get_login_url(self):
        return "/login"

    def get_current_user(self):
        currentUser = self.get_secure_cookie("user")
        if currentUser:
            return currentUser
        else:
            return None

class MainHandler(BaseHadler):
    def get(self):
        if not self.current_user:
            self.redirect("/login")
            return
        self.redirect("/dash")

class LoginHandler(BaseHadler):
    def get(self):
        self.render("template/login.html")

    def check_permission(self, username,password):
        userExit = db.UserAuthantication(username,password)
        return userExit

    def post(self):
        userdata_json = self.request.body
        userdata = json.loads(userdata_json)
        # self.set_secure_cookie("user", userdata["username"])
        # print userdata
        if userdata:
            userfound = self.check_permission(userdata["username"], userdata["password"])
            if userfound:
                foundInfo = list(userfound[:])
                for info in foundInfo:
                    self.set_curent_user(info["name"])
                self.write(json.dumps({'status': 'success', 'redirect':'/dash'}))
                self.set_header("Content-Type", "application/json")
            else:
                self.write(json.dumps({'status': 'user not found'}))
                self.set_header("Content-Type", "application/json")

    def set_curent_user(self, user):
        if user:
            #udate user online
            try:
                db.user_online(user, 1)
            except Exception, e:
                raise e
            self.set_secure_cookie("user", user)
        else:
            self.clear_cookie("user")


class RegisterNewPatientHandler(BaseHadler):
    """docstring for RegisterNewPatientHandler"""
    def post(self):
        data = self.request.body
        data = json.loads(data)
        if data:
            print data
            print ("////////////////////////////////////")
            new_patient = {
                "name": data["name"],
                "IDnumber": data['IDnumber'],
                "gender": data['gender'],
                "location": data['location'],
                "Device_uuid": data['Device_uuid'],
                "vitalsigns":[],
                "data":[],
                "last_updated": datetime.now().strftime("%d, %b %Y %H:%M")
            }
            patientID = db.saveDataFromApp(new_patient)
            if patientID:
                self.write(json.dumps({'status': "success"}))
                self.set_header("Content-Type", "application/json")
            else:
                self.write(json.dumps({'status': "failed"}))
                self.set_header("Content-Type", "application/json")
    get = post

class returnData(BaseHadler):
    def post(self):
        data = self.request.body
        data = json.loads(data)

        if data:
            print data
            #check if the name or ID alrerady exist
            try:
                entry = db.entry_exist(data['name'])
                #if entry exist update the fields
                if entry:
                    print "printing intry$$$$$$$$$$$$$$$"
                    print entry
                    sensor_data = {
                        "oxygen":data['oxygen'],
                        "temperature":data['temperature'],
                        "ecgvalue":data['ecgvalue'],
                        "pulse":data['pulse'],
                        "lat":data['lat'],
                        "lon":data['lon'],
                        "cTime":data['cTime']
                    }
                    patientID = db.updateDataFromApp(data['name'], sensor_data)
                    if patientID:
                        print "((((((((((((((((()))))))))))))))))))))"
                        self.write(json.dumps({'status': "ok"}))
                        self.set_header("Content-Type", "application/json")
                    else:
                        self.write(json.dumps({'status': "Un error has occured while saving"}))
                        self.set_header("Content-Type", "application/json")
                else:
                    new_info = {
                        "name":data['name'],
                        "IDnumber":data['IDnumber'],
                        "vitalsigns":[{
                            "oxygen":data['oxygen'],
                            "temperature":data['temperature'],
                            "ecgvalue":data['ecgvalue'],
                            "pulse":data['pulse'],
                            "lat":data['lat'],
                            "lon":data['lon'],
                            "cTime":data['cTime']
                        }],
                        "data": [{
                            "data":"",
                            "time":datetime.now()
                        }],
                        "Device_uuid":data['Device_uuid'],
                        "last_updated": datetime.now().strftime("%d, %b %Y %H:%M")
                    }
                    patientID = db.saveDataFromApp(new_info)
                    if patientID:
                        self.write(json.dumps({'status': "ok"}))
                        self.set_header("Content-Type", "application/json")
                    else:
                        self.write(json.dumps({'status': "Un error has occured while saving"}))
                        self.set_header("Content-Type", "application/json")
            except Exception as e:
                print e
                self.write(json.dumps({'status': "Exception raise"}))
                self.set_header("Content-Type", "application/json")
            self.finish()

    def get(self):
        self.write("returned data here from database")

class SensorDataHandler(BaseHadler):
    """docstring for DataHandler"""
    def post(self):
        try:
            sensorEntries = db.getAllSensorData()
            if sensorEntries:
                self.set_header("Content-Type", "application/json")
                self.write(json.dumps(list(sensorEntries), default=json_util.default))
            else:
                self.set_header("Content-Type", "application/json")
                self.write(json.dumps("status", "failed"))
        except Exception, e:
            raise e
            
    #android app route for patient list data
    def get(self):
        Json_data = list()
        try:
            sensorEntries = db.getAllSensorData()
            if sensorEntries:
                entries = list(sensorEntries[:])
                for entry in entries:
                    if 'last_updated' in entry:
                        updated_time = entry['last_updated']
                    else:
                        updated_time = "10, Feb 2016 14:45"
                    item = {
                    "_id":str(entry["_id"]),
                    "IDnumber":entry['IDnumber'],
                    "name":entry['name'],
                    "Device_uuid":entry['Device_uuid'],
                    "last_updated":updated_time
                    }
                    Json_data.append(item)
                self.set_header("Content-Type", "application/json")
                #self.write(json.dumps(list(sensorEntries), default=json_util.default))

                self.write(json.dumps(Json_data, default=json_util.default))
            else:
                self.set_header("Content-Type", "application/json")
                self.write(json.dumps("status", "failed"))
        except Exception, e:
            raise e

############################### log data page #####################################################
class LogDataHandler(BaseHadler):
    """docstring for LogDataHandler"""
    def get(self, id):
        logedUser = self.get_current_user();
        if logedUser:
            if id:
                self.render("template/logdata.html", username=logedUser, id=id)
        else:
            #raise tornado.web.HTTPError(404)
            self.clear()
            self.set_status(400)
            self.render("template/404.html")


class itemDetailsHandler(BaseHadler):

    def get(self, itemId):
        try:
            entryDetails = db.getItemDetails(itemId)
            if entryDetails:
                self.set_header("Content-Type", "application/json")
                self.write(json.dumps(list(entryDetails), default=json_util.default))
            else:
                self.set_header("Content-Type", "application/json")
                self.write(json.dumps("status", "failed"))
        except Exception, e:
            raise e
        
        
########################### Register Users #######################################################
class Register(BaseHadler):
    def get(self):
        self.render("template/register.html", title=siteTitle)

    def post(self):
        data_json = self.request.body
        data = json.loads(data_json)
        #print data
        if data:
            print "----------------------------------------"
            print data['name']
            print "----------------------------------------"

            # post = {"author": "Mike",
            # "text": "My first blog post!",
            # "tags": ["mongodb", "python", "pymongo"],
            # "date": datetime.datetime.utcnow()}

            new_user = {
                "name":data['name'],
                "email":data['email'],
                "organization":"",
                "title":"",
                "phone":"",
                "description":"",
                "password":data['password'],
                "online":0,
                "active":0,
                "registered_date":datetime.now()
                }
            try:
                userid = db.add_user(new_user)
                self.write(json.dumps({'status': 'success'}))
                self.set_header("Content-Type", "application/json")
            except Exception as e:
                self.write(json.dumps({'status': 'failed'}))
                self.set_header("Content-Type", "application/json")
            self.finish()

###############Users profile information #####################################
class UserProfile(BaseHadler):
    """docstring for UserProfile"""
    def get(self, username):
        logedUser = self.get_secure_cookie("user")
        if logedUser:
            if logedUser != username:
                #raise tornado.web.HTTPError(404)
                self.clear()
                self.set_status(400)
                self.render("template/404.html")
            else:
                entry = db.find_user_by_name(username)
                if not entry:
                    #raise tornado.web.HTTPError(404)
                    self.clear()
                    self.set_status(400)
                    self.render("template/404.html")
                details = list(entry[:])
                print details
                for info in details:
                    user_name = info["name"]
                    user_email = info["email"]
                    user_org = info["organization"]
                    user_phone = info["phone"]
                    user_descr = info["description"]
                    user_title = info["title"]
                    user_id = info["_id"]
                self.render("template/profile.html",
                             username=user_name,
                             useremail=user_email,
                             userphone = user_phone,
                             userorg = user_org,
                             userdesc = user_descr,
                             usertitle = user_title,
                             userid = user_id
                )
###################################### Feedback Handler ##############################################
class PatientFeedbackHandler(BaseHadler):
        """docstring for PatientFeedback"""

        def SendNotification(self, message, token, _id, name):
            userToken = []
            userToken.append(token)
            # for idd in dId:
            #     userToken.append(idd["token"])
            notification = {
                "title": "wegoo notification",
                "message": message,
                "_id": _id,
                "name": name
            }

            try:
                result = gcm.sendNotification(userToken, notification)
                #if result set status to sent
                return result
            except Exception, e:
                return e

        def get(self, id, deviceInfo):
            logedUser = self.get_secure_cookie("user")
            if not id:
                self.clear()
                self.set_status(400)
                self.render("template/404.html")
            else:
                self.render("template/feedback.html", username=logedUser, id=id, device=deviceInfo)

        def post(self, id, deviceInfo):
            data = json.loads(self.request.body)
            logedUser = self.get_secure_cookie("user")
            if data:
                new_feedback = {
                 "patineID": data['ptnid'],
                 "name": logedUser,
                 "feedback": data['feedbcktext'],
                 "deviceuuid": data['deviceinfo'],
                 "time": datetime.now().strftime("%d, %b %Y %H:%M"),
                 "status": "processing"
                }
                try:
                    #get patient informatin
                    patientInfo = db.getItemDetails(id)
                    if patientInfo:
                        for patienName in patientInfo:
                            name = patienName['name']
                    #get device uuid that sents the data
                    uuidThatSentData = db.getDeviceUuid(data['deviceinfo'])
                    if uuidThatSentData:
                        for deviceInfo in uuidThatSentData:
                            deviceTokenid = deviceInfo['token']
                        result = self.SendNotification(data['feedbcktext'], deviceTokenid, id, name)
                        print result
                    feedbackid = db.add_feedback(new_feedback)
                    self.write(json.dumps({'status': 'success'}))
                    self.set_header("Content-Type", "application/json")
                except Exception as e:
                    self.write(json.dumps({'status': 'failed'}))
                    self.set_header("Content-Type", "application/json")
                self.finish()
        def delete(self, id):
            try:
                result = db.deleteFeedbackItem(id)
                if result:
                    print result.deleted_count
                    if result.deleted_count == 1:
                        self.write(json.dumps({'status': 'success'}))
                        self.set_header("Content-Type", "application/json")
            except Exception, e:
                self.write(json.dumps({'status': 'failed'}))
                self.set_header("Content-Type", "application/json")

class getFeebackHandler(BaseHadler):
    """docstring for getFeebackHandler"""
    def get(self, id):
        try:
            ptnFeddback = db.getFeedbackByptnId(id)
            self.set_header("Content-Type", "application/json")
            self.write(json.dumps(list(ptnFeddback), default=json_util.default))
        except Exception, e:
            raise e

class UserTokenHandler(BaseHadler):
    """docstring for UserTokenHandler"""
    def get(self, tokenNumber, deviceuuid):
        if tokenNumber:
            print tokenNumber

            tokenEntry = {
             "token": tokenNumber,
             "Device_uuid": deviceuuid,
             "registered": datetime.now().strftime("%d, %b %Y %H:%M")
            }

            try:
                token_id = db.registerToken(tokenEntry)
                print token_id
                if token_id == 'success':
                    self.write(json.dumps({'status': 'success'}))
                    self.set_header("Content-Type", "application/json")
            except Exception, e:
                print e
                self.write(json.dumps({'status': 'failed'}))
                self.set_header("Content-Type", "application/json")
            self.finish()

########################## Send Notification handler ###################################### 
class NotificationHandler(BaseHadler):
    """docstring for NotificationHandler"""
    def post(self):
        pass
        
    
        

class updateUser(BaseHadler):
    def post(self):
        data_json = self.request.body
        data = json.loads(data_json)

        if data:
            try:
                userUpdated = db.update_user(data['id'],data['name'], data['email'], data['organ'], data['title'], data['phone'],data['desc'])
                if userUpdated:
                    print userUpdated['nModified']
                    if userUpdated['nModified'] == 1:
                        self.write(json.dumps({'status': 'success'}))
                        self.set_header("Content-Type", "application/json")
                    else:
                        self.write(json.dumps({'status': 'failed'}))
                        self.set_header("Content-Type", "application/json")
            except Exception as e:
                print e
            self.finish()


###### Users #################################
class UsersInfo(BaseHadler):
    """docstring for UsersInfo"""
    def get(self):
        logedUser = self.get_secure_cookie("user")
        if logedUser:
            try:
                all_users = db.get_all_users()
                self.render("template/userlist.html", username=logedUser, users=all_users)
            except Exception, e:
                raise
    def post(self):
        try:
            all_users = db.get_all_users()
            #all_users_list = list(all_users[:])
            #all_users_list = json.dumps(all_users_list, sort_keys=True,indent=4, separators=(',', ': '))
            self.set_header("Content-Type", "application/json")
            self.write(json.dumps(list(all_users), default=json_util.default))
        except Exception, e:
            print e
            self.set_header("Content-Type", "application/json")
            self.write(json.dumps({'status':'failed to fetch users'}))
        self.finish()

#################### location map d3 ####################################

class LocationMap(BaseHadler):
    def get(self):
        logedUser = self.get_secure_cookie("user")
        self.render("template/map.html", username=logedUser)

            
class LogoutHandler(BaseHadler):
    def get(self):
        user = self.get_secure_cookie("user")
        try:
            db.user_online(user, 0)
            self.clear_cookie("user")
            self.redirect("/login")
        except Exception, e:
            raise e

class HomePage(BaseHadler):
    def get(self):
        #this is for html production
        logedUser = self.get_secure_cookie("user")
        if logedUser:
            self.render("template/home.html", username=logedUser)
        else:
            self.redirect("/login")

################################################################################
# def make_app():
#     settings = {
#         "debug": True,
#         "static_path": os.path.join(os.path.dirname(__file__), "static"),
#         "cookie_secret": "wegoo_123_app",
#         "login_url": "/"
#     }
#     return Application([
#     url(r"/", MainHandler),
#     url(r"/dash", HomePage),
#     url(r"/mydata", returnData),
#     url(r"/data", SensorDataHandler),
#     url(r"/data/api/v/([^/]+)", itemDetailsHandler),
#     url(r"/data/api/v/registerPatient",RegisterNewPatientHandler),
#     url(r"/logdata/([^/]+)", LogDataHandler),
#     url(r"/login", LoginHandler),
#     url(r"/register", Register),
#     url(r"/profile/([^/]+)", UserProfile),
#     url(r"/feedbck/([^/]+)/([^/]+)", PatientFeedbackHandler),
#     url(r"/getfeedback/([^/]+)", getFeebackHandler),
#     url(r"/register/token/([^/]+)", UserTokenHandler),
#     url(r"/notification", NotificationHandler),
#     url(r"/map", LocationMap),
#     url(r"/upateuser", updateUser),
#     url(r"/userinfo", UsersInfo),
#     url(r"/logout", LogoutHandler),
#     #dict(path=settings['static_path'])),
#     ], **settings)

# def main():
#     app = make_app()
#     app.listen(8888)
#     IOLoop.current().start()

# if __name__ == '__main__':
#     main()

###################################################################################S
settings = {
    "debug": True,
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
    "cookie_secret": "wegoo_123_app",
    "login_url": "/"
}

application = tornado.web.Application([
    url(r"/", MainHandler),
    url(r"/dash", HomePage),
    url(r"/mydata", returnData),
    url(r"/data", SensorDataHandler),
    url(r"/data/api/v/([^/]+)", itemDetailsHandler),
    url(r"/data/api/registerPatient",RegisterNewPatientHandler),
    url(r"/logdata/([^/]+)", LogDataHandler),
    url(r"/login", LoginHandler),
    url(r"/register", Register),
    url(r"/profile/([^/]+)", UserProfile),
    url(r"/feedbck/([^/]+)/([^/]+)", PatientFeedbackHandler),
    url(r"/register/token/([^/]+)/([^/]+)", UserTokenHandler),
    url(r"/notification", NotificationHandler),
    url(r"/getfeedback/([^/]+)", getFeebackHandler),
    url(r"/map", LocationMap),
    url(r"/upateuser", updateUser),
    url(r"/userinfo", UsersInfo),
    url(r"/logout", LogoutHandler),
], **settings)

application = tornado.wsgi.WSGIAdapter(application)
