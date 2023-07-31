//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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
// import { ThrowStmt } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { Guid } from "guid-typescript";
import { PreOpStaffGroup } from '../models/entities/poa-staff-group';
import { PreOpTask } from '../models/entities/poa-task';
import { PreOpTaskStatus} from '../models/entities/poa-tast-status';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { PreOpCommonTask } from '../models/entities/poa-common-task';
import { TaskHistoryViewerService } from '../task-history-viewer/task-history-viewer.service';
import { PreOpTaskReferredTo } from '../models/entities/poa-task-referred-to';
import { element } from 'protractor';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent  {

  subscriptions: Subscription = new Subscription();
  poaId: string;
  personId: string;

  staffGroups: PreOpStaffGroup[];


  poaTasks: PreOpTask[];
  poaTask: PreOpTask;
  selectedTask: PreOpTask;

  editTask: PreOpTask;
  showCommonTasks: boolean = true;

  getStaffListUri: string = "/GetList?synapsenamespace=local&synapseentityname=poa_staffgroup&orderby=displayorder ASC";

  taskStatusList: PreOpTaskStatus[];
  getTaskStatusListUri: string = "/GetList?synapsenamespace=local&synapseentityname=poa_taskstatus&orderby=statusorder ASC";


  taskReferredToList: PreOpTaskReferredTo[];
  getTaskReferredToUri: string = "/GetList?synapsenamespace=local&synapseentityname=poa_taskreferredto&orderby=displayorder ASC";

  getTaskListUri: string;
  getTaskUri: string = "";
  postTaskUri: string = "/PostObject?synapsenamespace=local&synapseentityname=poa_task";

  commonTaskList:PreOpCommonTask[];
  getCommonTasksURI = "/GetList?synapsenamespace=local&synapseentityname=poa_commontask&orderby=displayorder ASC";

  staffFilter: string = "All";
  referredToFilter: string = "All";

  newStaffGroup: string;


  setFilter() {
    this.staffFilter = "POA Nurse";
  }

  selectedTasksView: string;

  //Multiselect
  dropdownList = [];
  selectedItems = [];
  dropdownSettings:IDropdownSettings = {} as IDropdownSettings;
  //Multiselect

  private _preOpAssessment: PreOpAssessment;
  @Input() set preOpAssessment(value: PreOpAssessment) {
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;
    this.selectedTasksView = 'tasks';

    this.getCommonTaskList();
    this.getTaskStatusList();
    this.getReferredToList();

    this.showCommonTasks = true;

    this.getTaskListUri  = "/GetBaseViewListByAttribute/poa_poatasks?synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId;
    this.GetTasksAndStaffList();
    this.clearForNewTask();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'taskname',
      textField: 'taskname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };
     //End Multiselect

     this.gotoTop();

  };

  //Multiselect
  onItemSelect(item: any) {
    this.getTaskName();
  }

  onItemDeSelect(item: any) {
    this.getTaskName();
  }

  onSelectAll(items: []) {
    var taskLabel = ""
    items.forEach(element => {
      taskLabel += element["taskname"] + ", ";
    });
    taskLabel = taskLabel.replace(/,\s*$/, "");
    this.poaTask.taskname = taskLabel;

  }

  onDeSelectAll(items: []) {
    this.poaTask.taskname = "";
  }


  getTaskName() {
   var taskLabel = ""
    this.poaTask.commontasks.forEach((keys : any, vals :any) => {
      taskLabel += keys.taskname + ", ";
      console.log(keys.taskname);
    })
    taskLabel = taskLabel.replace(/,\s*$/, "");
    this.poaTask.taskname = taskLabel;
    //console.log(taskLabel);
  }

  //End Multiselect





  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  clearForNewTask() {
    this.poaTask = {}  as PreOpTask;
    this.poaTask.person_id = this.personId;
    this.poaTask.poa_preopassessment_id = this.poaId;
    this.poaTask.poa_task_id = String(Guid.create());
    this.poaTask.notes = null;
    this.poaTask.assignedto = null;
    this.poaTask.taskcreatedby = this.appService.loggedInUserName;
    this.poaTask.taskcreateddatetime = this.getDateTime();;
    this.poaTask.taskdetails = null;
    this.poaTask.poa_staffgroup_id = null;
    this.poaTask.poa_taskstatus_id = "New";
    this.showCommonTasks = true;

    this.poaTask.commontasks = [];
  }


  async GetTasksAndStaffList() {



    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + this.getStaffListUri)
      .subscribe((response) => {

        this.staffGroups = JSON.parse(response);

        this.staffFilter = "All";
        this.referredToFilter = "All";

        this.apiRequest.getRequest(this.appService.baseURI + this.getTaskListUri)
        .subscribe((data) => {
          this.poaTasks = JSON.parse(data);
          this.GetTasksForPOA();

        })



      })


    )


   }

   refresh() {
     this.GetTasksForPOA();
   }

   async selectOption(taskId: String) {
    this.selectedTask = null;
    this.getTaskUri = this.appService.baseURI + "/GetObject?synapsenamespace=local&synapseentityname=poa_task&id=" + taskId;
    await this.apiRequest.getRequest(this.getTaskUri)
    .subscribe((data) => {
      this.selectedTask = JSON.parse(data);
    })

    this.selectedTasksView = 'edit';

    this.gotoTop();

   }




   async getTaskStatusList() {
    await this.apiRequest.getRequest(this.appService.baseURI + this.getTaskStatusListUri)
    .subscribe((data) => {
      this.taskStatusList = JSON.parse(data);
    })

   }

   async getCommonTaskList() {
    await this.apiRequest.getRequest(this.appService.baseURI + this.getCommonTasksURI)
    .subscribe((data) => {
      this.commonTaskList = JSON.parse(data);
      //console.log('data');
    })
  }


  async getReferredToList() {
    await this.apiRequest.getRequest(this.appService.baseURI + this.getTaskReferredToUri)
    .subscribe((data) => {
      this.taskReferredToList = JSON.parse(data);
      //console.log('data');
    })
  }

   get filteredTasks(): PreOpTask[] {
    if (this.staffFilter != "All" && this.referredToFilter != "All") {
      return this.poaTasks.filter((a) =>
        a.poa_staffgroup_id.includes(this.staffFilter) && a.referredto.includes(this.referredToFilter)
      );
    }
    else if (this.staffFilter != "All" && this.referredToFilter == "All") {
      return this.poaTasks.filter((a) =>
        a.poa_staffgroup_id.includes(this.staffFilter)
      );
    }
    if (this.staffFilter == "All" && this.referredToFilter != "All") {
      return this.poaTasks.filter((a) =>
        a.referredto.includes(this.referredToFilter)
      );
    }
    return this.poaTasks;
  }


   async GetTasksForPOA() {

    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + this.getTaskListUri)
      .subscribe((response) => {
        this.poaTasks = JSON.parse(response);
      })


    )


   }




  @Output() viewClosed = new EventEmitter<boolean>();

  save() {
    this.viewClosed.emit(true);
  }




  async cancelNew() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to cancel?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.clearForNewTask();
    this.selectedTasksView = 'tasks';
  }

  // cancelNew() {
  //   var r = confirm("Are you sure that you want to cancel?");
  //   if (r == false)  {
  //     //do nothing
  //     return;
  //   }
  //   else if (r == true) {
  //     this.clearForNewTask();
  //     this.selectedTasksView = 'tasks';
  //   } else {
  //     //do nothing
  //     return;
  //   }
  // }

  saveNew() {

    this.showCommonTasks = false;
    this.poaTask.commontasks = JSON.stringify(this.poaTask.commontasks);
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + this.postTaskUri, this.poaTask)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","Task Saved");

         this.clearForNewTask();
         this.GetTasksForPOA();
         this.selectedTasksView = 'tasks';
         this.showCommonTasks = true;

        })
      )


  }

  saveEdit() {

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + this.postTaskUri, this.selectedTask)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","Task Saved");

         this.GetTasksForPOA();

         this.selectedTasksView = 'tasks';


        })
      )



  }


  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, private confirmationDialogService: ConfirmationDialogService, private taskHistoryViewerService: TaskHistoryViewerService) {

  }

  addNew(evemt) {
    this.clearForNewTask();
    this.selectedTasksView = 'new';
    this.gotoTop();
  }

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




  async viewHistory() {
    var response = false;
    await this.taskHistoryViewerService.confirm(this.selectedTask.poa_task_id, 'General History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }


  //--------------------------------------
// Navigation
//--------------------------------------

async cancel() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the main menu? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'home';
  this.viewClosed.emit(true);
}

async mainmenu() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the menu? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }
  this.appService.viewToShow = 'home';
  this.viewClosed.emit(true);
}


async back() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go back to the previous screen? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'medicalHistory';
  this.viewClosed.emit(true);
}

async next() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the next screen? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'baselineObservations';
  this.viewClosed.emit(true);
}

gotoTop() {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}

//--------------------------------------
// End Navigation
//--------------------------------------





}
