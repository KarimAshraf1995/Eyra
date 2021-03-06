/*
Copyright 2016 The Eyra Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
File author/s:
    Simon Klüpfel <simon.kluepfel@gmail.com>
    Matthias Petursson <oldschool01123@gmail.com>
*/

create user 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.device to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.instructor to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.session to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.speaker to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.speaker_info to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.token to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.recording to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.evaluation to 'username'@'%' IDENTIFIED BY 'password';  
grant select on recordings_master.evaluation_sets to 'username'@'%' IDENTIFIED BY 'password';  

grant insert on recordings_master.device to 'username'@'%' IDENTIFIED BY 'password';  
grant insert on recordings_master.instructor to 'username'@'%' IDENTIFIED BY 'password';  
grant insert on recordings_master.recording to 'username'@'%' IDENTIFIED BY 'password';  
grant insert on recordings_master.session to 'username'@'%' IDENTIFIED BY 'password';  
grant insert on recordings_master.speaker to 'username'@'%' IDENTIFIED BY 'password';  
grant insert on recordings_master.speaker_info to 'username'@'%' IDENTIFIED BY 'password';  
grant insert on recordings_master.evaluation to 'username'@'%' IDENTIFIED BY 'password';  

grant update on recordings_master.session to 'username'@'%' IDENTIFIED BY 'password';  
grant update on recordings_master.token to 'username'@'%' IDENTIFIED BY 'password';
