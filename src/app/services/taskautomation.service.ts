//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 


import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { AppService } from './app.service';
import { Observable, from, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { ApirequestService } from './apirequest.service';
import { ToasterService } from './toaster-service.service';
import { PreOpAssessmentSummary } from '../models/entities/poa-assessmentsummary';
import { PreOpTask } from '../models/entities/poa-task';
import { Guid } from 'guid-typescript';
import { PreOpTaskSummary } from '../models/entities/poa-tasksummary';

@Injectable({
  providedIn: 'root'
})
export class TaskAutomationService {

  constructor(private httpClient: HttpClient, public authService: AuthenticationService, private appService: AppService, private apiRequest: ApirequestService, private toasterService: ToasterService) {
  }



  subscriptions: Subscription = new Subscription();
  getTaskSummaryURI: string;
  postTaskSummaryURI: string;
  //poaSummary: PreOpAssessmentSummary;

  poaTask: PreOpTask;
  postTaskUri: string;

  public async checkTask( poaTaskSummary: PreOpTaskSummary, poaId: string, personId: string, taskType: string, taskStaffGroup: string, taskName: string, messageToShow: string) {
    this.getTaskSummaryURI = this.appService.baseURI + "/GetObject?synapsenamespace=local&synapseentityname=poa_tasksummary&id=" + poaId;
    this.postTaskSummaryURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_tasksummary";
    this.postTaskUri = "/PostObject?synapsenamespace=local&synapseentityname=poa_task";

    switch(taskType) {
      case 'taskrefercomplexcase':
        if(poaTaskSummary.taskrefercomplexcase) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskrefercomplexcase = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Complex Case Team');
        }
        break;
      case 'taskrefergp':
        if(poaTaskSummary.taskrefergp) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskrefergp = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'GP');
        }
        break;
      case 'taskreferdieteticteam':
        if(poaTaskSummary.taskreferdieteticteam) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskreferdieteticteam = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Dietetic Team');
        }
        break;
      case 'taskreferdiabetesteam':
        if(poaTaskSummary.taskreferdiabetesteam) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskreferdiabetesteam = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Diabetes Team');
        }
        break;
      case 'taskprovideakiinfo':
        if(poaTaskSummary.taskprovideakiinfo) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskprovideakiinfo = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        }
        break;
      case 'taskcspinexray':
        if(poaTaskSummary.taskcspinexray) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskcspinexray = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow, taskStaffGroup, taskName, poaId, personId);
        }
        break;
      case 'taskreferacutepainteam':
        if(poaTaskSummary.taskreferacutepainteam) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskreferacutepainteam = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Pain Team');
        }
        break;

      case 'taskreferpharmacy':
        if(poaTaskSummary.taskreferpharmacy) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskreferpharmacy = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow, taskStaffGroup, taskName, poaId, personId, 'Pharmacy');
        }
        break;

      case 'taskbedmanagementsideroom':
          if(poaTaskSummary.taskbedmanagementsideroom) {
            this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
          }
          else{
            poaTaskSummary.taskbedmanagementsideroom = true;
            this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
          }
          break;


      case 'taskreferanaesthetist':
        if(poaTaskSummary.taskreferanaesthetist) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskreferanaesthetist = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow, taskStaffGroup, taskName, poaId, personId, 'Anaesthetist');
        }
        break;

      case 'taskconsiderreferanaesthetist':
        if(poaTaskSummary.taskconsiderreferanaesthetist) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskconsiderreferanaesthetist = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow, taskStaffGroup, taskName, poaId, personId, 'Anaesthetist');
        }
        break;


      case 'taskinsertdeleriumproforma':
        if(poaTaskSummary.taskinsertdeleriumproforma) {
          this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
        }
        else{
          poaTaskSummary.taskinsertdeleriumproforma = true;
          this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        }
        break;

        case 'taskbookhdubed':
          if(poaTaskSummary.taskbookhdubed) {
            this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
          }
          else{
            poaTaskSummary.taskbookhdubed = true;
            this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
          }
          break;

        case 'taskflaghaem':
          if(poaTaskSummary.taskflaghaem) {
            this.CreateTaskOrShowMessage(poaTaskSummary, false, messageToShow + ' - Task created previously');
          }
          else{
            poaTaskSummary.taskflaghaem = true;
            this.CreateTaskOrShowMessage(poaTaskSummary, true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
          }
          break;



    }

    // await this.subscriptions.add(
    //   this.apiRequest.getRequest(this.getTaskSummaryURI)
    //   .subscribe((response) => {
    //     this.poaTaskSummary = JSON.parse(response);
    //     if(!this.poaTaskSummary.poa_tasksummary_id) {
    //      this.poaTaskSummary.poa_tasksummary_id = poaId;
    //      this.poaTaskSummary.poa_tasksummary_id = poaId;
    //      this.PostTaskSummary();
    //     }

        //console.log("Checking Task:" + messageToShow) + ' : ' + taskType;
        //console.log(this.poaSummary);

        // switch(taskType) {
        //   case 'taskrefercomplexcase':
        //     if(this.poaTaskSummary.taskrefercomplexcase) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskrefercomplexcase = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Complex Case Team');
        //     }
        //     break;
        //   case 'taskrefergp':
        //     if(this.poaTaskSummary.taskrefergp) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskrefergp = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'GP');
        //     }
        //     break;
        //   case 'taskreferdieteticteam':
        //     if(this.poaTaskSummary.taskreferdieteticteam) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskreferdieteticteam = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Dietetic Team');
        //     }
        //     break;
        //   case 'taskreferdiabetesteam':
        //     if(this.poaTaskSummary.taskreferdiabetesteam) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskreferdiabetesteam = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Diabetes Team');
        //     }
        //     break;
        //   case 'taskprovideakiinfo':
        //     if(this.poaTaskSummary.taskprovideakiinfo) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskprovideakiinfo = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        //     }
        //     break;
        //   case 'taskcspinexray':
        //     if(this.poaTaskSummary.taskcspinexray) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskcspinexray = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow, taskStaffGroup, taskName, poaId, personId);
        //     }
        //     break;
        //   case 'taskreferacutepainteam':
        //     if(this.poaTaskSummary.taskreferacutepainteam) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskreferacutepainteam = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId, 'Pain Team');
        //     }
        //     break;

        //   case 'taskreferpharmacy':
        //     if(this.poaTaskSummary.taskreferpharmacy) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskreferpharmacy = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow, taskStaffGroup, taskName, poaId, personId, 'Pharmacy');
        //     }
        //     break;

        //   case 'taskbedmanagementsideroom':
        //       if(this.poaTaskSummary.taskbedmanagementsideroom) {
        //         this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //       }
        //       else{
        //         this.poaTaskSummary.taskbedmanagementsideroom = true;
        //         this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        //       }
        //       break;


        //   case 'taskreferanaesthetist':
        //     if(this.poaTaskSummary.taskreferanaesthetist) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskreferanaesthetist = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow, taskStaffGroup, taskName, poaId, personId, 'Anaesthetist');
        //     }
        //     break;

        //   case 'taskconsiderreferanaesthetist':
        //     if(this.poaTaskSummary.taskconsiderreferanaesthetist) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskconsiderreferanaesthetist = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow, taskStaffGroup, taskName, poaId, personId, 'Anaesthetist');
        //     }
        //     break;


        //   case 'taskinsertdeleriumproforma':
        //     if(this.poaTaskSummary.taskinsertdeleriumproforma) {
        //       this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //     }
        //     else{
        //       this.poaTaskSummary.taskinsertdeleriumproforma = true;
        //       this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        //     }
        //     break;

        //     case 'taskbookhdubed':
        //       if(this.poaTaskSummary.taskbookhdubed) {
        //         this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //       }
        //       else{
        //         this.poaTaskSummary.taskbookhdubed = true;
        //         this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        //       }
        //       break;

        //     case 'taskflaghaem':
        //       if(this.poaTaskSummary.taskflaghaem) {
        //         this.CreateTaskOrShowMessage(false, messageToShow + ' - Task created previously');
        //       }
        //       else{
        //         this.poaTaskSummary.taskflaghaem = true;
        //         this.CreateTaskOrShowMessage(true, messageToShow,  taskStaffGroup, taskName, poaId, personId);
        //       }
        //       break;



        // }
    //   })
    // )

  }

  async CreateTaskOrShowMessage(poaTaskSummary: PreOpTaskSummary, createTask: boolean, messageToShow: string, taskStaffGroup?: string, taskName?: string, poaId?: string, personId?: string, referredTo?: string) {

      if(createTask) {
      //Update Summary
      this.subscriptions.add(
        this.apiRequest.postRequest(this.postTaskSummaryURI, poaTaskSummary)
          .subscribe((response) => {
            //Create the task
            this.poaTask = {}  as PreOpTask;
            this.poaTask.person_id = personId;
            this.poaTask.poa_preopassessment_id = poaId;
            this.poaTask.poa_task_id = String(Guid.create());
            this.poaTask.notes = null;
            this.poaTask.assignedto = null;
            this.poaTask.taskcreatedby = this.appService.loggedInUserName;
            this.poaTask.taskcreateddatetime = this.getDateTime();;
            this.poaTask.taskdetails = messageToShow + " (Automate task generated by system)";
            this.poaTask.taskname = taskName;
            this.poaTask.poa_staffgroup_id = taskStaffGroup;
            this.poaTask.poa_taskstatus_id = "New";
            this.poaTask.referredto = referredTo;

            this.poaTask.commontasks = [];
            this.poaTask.commontasks = '[]';
            this.subscriptions.add(
              this.apiRequest.postRequest(this.appService.baseURI + this.postTaskUri, this.poaTask)
                .subscribe((response) => {

                 this.toasterService.showToaster("success",messageToShow + ' - Task created');


                })
              )
          })
        )
      }
      else
      {
        this.toasterService.showToaster("info",messageToShow);
      }
  }

  // async PostTaskSummary() {
  //   this.subscriptions.add(
  //     this.apiRequest.postRequest(this.postTaskSummaryURI, this.poaTaskSummary)
  //       .subscribe((response) => {
  //        //this.toasterService.showToaster("Success","Note Saved");
  //       })
  //     )
  // }

  getDateTime(): string {
    var date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();

    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) +
      "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));

    return returndate;
  }

}
