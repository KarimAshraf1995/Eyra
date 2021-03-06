# Copyright 2016 The Eyra Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# File author/s:
#     Matthias Petursson <oldschool01123@gmail.com>

from flask import Flask, request, Response
import json

from db_handler import DbHandler
from auth_handler import AuthHandler
from qc.qc_handler import QcHandler

from util import log

app = Flask(__name__)

# TODO move to config file (along with configs in DbHandler and AuthHandler mayhaps)
app.config['MAIN_RECORDINGS_PATH'] = '/data/eyra/recordings'

dbHandler = DbHandler(app)
authHandler = AuthHandler(app) # sets up /auth/login @app.route and @login_required()
qcHandler = QcHandler(app, dbHandler)

# SUBMISSION ROUTES

@app.route('/submit/general/<method>', methods=['POST'])
@authHandler.login_required()
def submit_general(method):
    """
    supports everything in the client-server API
    right now, /submit/general/{device,instuctor}
    
    requires sender to be authenticated with JWT, see auth_handler.py 
    remove @authHandler.login_required() if you don't want that
    """
    validMethod = False
    processingFunction = None
    if method=='device':
        processingFunction = dbHandler.processDeviceData
        validMethod = True
    elif method=='instructor':
        processingFunction = dbHandler.processInstructorData
        validMethod = True
    # not used currently, speaker data is sent with each session
    #elif method=='speaker':
    #    processingFunction = dbHandler.processSpeakerData
    #    validMethod = True

    if method is not None and validMethod:
        data = None
        if request.method == 'POST':
            #log('Data: ' + str(request.form) + '\n')

            if 'json' in request.form:
                data = request.form['json']
            else:
                msg = 'No %s data found in submission, aborting.' % method
                log(msg)
                return msg, 400

            result = processingFunction(data)
            return result['msg'], result['statusCode']

        return 'Unexpected error.', 500

    return 'Not a valid submission method url.', 404

@app.route('/submit/session', methods=['GET', 'POST'])
def submit_session():
    sessionData = None
    recordings = []
    if request.method == 'GET':
        msg = 'GET success baby'
        #log(msg)
        return msg, 200
    if request.method == 'POST':
        #log('Form: ' + str(request.form) + '\nFiles: ' + str(request.files) + '\n')
        #log('Headers: ' + str(request.headers))

        if 'json' in request.form:
            sessionData = request.form['json']
        else:
            msg = 'No metadata found, aborting.'
            log(msg)
            return msg, 400

        i = 0
        while True:
            key = 'rec'+str(i)
            if key in request.files:
                recordings.append(request.files[key])
                #log('Got file: ' + str(request.files[key]))
            else:
                #log('No more recordings.')
                break
            i += 1

        if i==0:
            msg = 'No recordings received, aborting.'
            log(msg)
            return msg, 400

        result = dbHandler.processSessionData(sessionData, recordings)
        return result['msg'], result['statusCode']

    return 'Unexpected error.', 500

@app.route('/submit/gettokens/<int:numTokens>', methods=['GET'])
def submit_gettokens(numTokens):
    if request.method == 'GET':
        response = ''
        if numTokens > 0:
            tokens = dbHandler.getTokens(numTokens)
        else:
            msg = 'Can\'t grab <= 0 tokens.'
            log(msg)
            return msg, 404

        if len(tokens) > 0:
            response += json.dumps(tokens)
            #log('Got tokens from db: ' + response)
            return response, 200
        else:
            msg = 'Failed getting tokens from database.'
            log(msg)
            return msg, 500

    return 'Unexpected error.', 500

# QC ROUTES

@app.route('/qc/report/session/<int:sessionId>', methods=['GET'])
def qc_report(sessionId):
    """Get a QC report

    Returned JSON if the QC report is not available, but is being
    processed:

        {"sessionId": ...,
         "status": "started",
         "modules":{}}

    Returned JSON definition if no QC module is active:

        {"sessionId": ...,
         "status": "inactive",
         "modules":{}}

    Returned JSON definition:

        {"sessionId": ...,
         "status": "processing",
         "modules"  {
            "module1" :  {
                            "totalStats": {"accuracy": [0.0;1.0]"},
                            "perRecordingStats": [{"recordingId": ...,
                                "stats": {"accuracy": [0.0;1.0]}}]}
                          }, 
                          ...
                    }
        }
    """
    if request.method == 'GET':
        qcReport = qcHandler.getReport(sessionId)
        if qcReport:
            return json.dumps(qcReport), 200
        else:
            return 'Session doesn\'t exist', 404

    return 'Unexpected error.', 500

# EVALUATION ROUTES

@app.route('/evaluation/set/<string:eval_set>/progress/<int:progress>/count/<int:count>', methods=['GET'])
def get_from_set(eval_set, progress, count):
    """
    Get link/prompt pairs from specified set in ascending order by recording id.

    Format described in client-server API and db_handler.
    """
    if request.method == 'GET':
        partialSet = dbHandler.getFromSet(eval_set, progress, count)
        return json.dumps(partialSet[0]), partialSet[1]

@app.route('/evaluation/submit/<string:eval_set>', methods=['POST'])
def submit_evaluation(eval_set):
    """
    Client submits evaluation of X utterances.

    Form should contain key 'json' with value on format as described
    in client-server API or db_handler.
    """
    if request.method == 'POST':
        if 'json' in request.form:
            data = request.form['json']
            #log(data)
        else:
            msg = 'No data found in submission, aborting.'
            log(msg + ' For set: {}'.format(eval_set))
            return msg, 400
        return dbHandler.processEvaluation(eval_set, data)

@app.route('/evaluation/setinfo/<string:eval_set>', methods=['GET'])
def get_set_info(eval_set):
    """
    Get info about set as json. More info in client-server API and db_handler.
    """
    if request.method == 'GET':
        return dbHandler.getSetInfo(eval_set)

@app.route('/evaluation/progress/user/<string:user>/set/<string:eval_set>', methods=['GET'])
def get_user_progress(user, eval_set):
    """
    Get user progress into a specific set. If user has recorded 5, progress is 5.
    """
    if request.method == 'GET':
        return dbHandler.getUserProgress(user, eval_set)

@app.route('/evaluation/possiblesets', methods=['GET'])
def get_possible_sets():
    """
    Get a list of all possible sets.
    """
    if request.method == 'GET':
        return dbHandler.getPossibleSets()

if __name__ == '__main__':
    app.run(debug=True)
