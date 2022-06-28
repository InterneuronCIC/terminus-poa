//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

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
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { Person } from '../models/entities/core-person.model';
import { PreOpTask } from '../models/entities/poa-task';
import { POATaskCount } from '../models/baseviews/poa-task-count';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { UserSettings } from '../models/entities/user-settings';
import { LinkedEncounter } from '../models/baseviews/linked-encounter';
import { PreOpNote } from '../models/entities/poa-note';
import { POANoteCount } from '../models/baseviews/poa-note-count';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent{

  subscriptions: Subscription = new Subscription();
  selectedView: string;
  personId: string;
  poaId: string;
  homePOA: PreOpAssessment;
  getTaskListUri: string;

  getLinkedEncounterListURI: string;
  linkedEncounterList: LinkedEncounter[];

  getLinkedEncounterURI: string;
  linkedEncounter: LinkedEncounter;



  tasksNotCompleted : POATaskCount[];
  taskCount:POATaskCount;
  noteCount: POANoteCount;

  userSettings: UserSettings;

  showSettings: boolean = false;



  toggleShowSettings() {
    this.showSettings = !this.showSettings;
  }




  private _preOpAssessment: PreOpAssessment;
  @Input() set preOpAssessment(value: PreOpAssessment) {
    this.selectedView = 'home';
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;
    this.homePOA = value;
    this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
    this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";
    this.getTaskListUri  = "/GetBaseViewListObjectByAttribute/poa_tasksnotcompleted?synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId;
    this.getNoteListUri  = "/GetBaseViewListObjectByAttribute/poa_notecount?synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId;
    this.getUserSettings();



  };


  async checkLockedOrBlocked() {
    if(this.appService.authoriseAction('Edit POA')) {
      this.appService.blocked = false;
    }
    else
    {
      this.appService.blocked = true;
    }

    //Need to check if locked
    this.appService.locked = this.selectedPOA.islocked;

    if(this.appService.blocked || this.appService.locked) {
      this.appService.lockedOrBlocked = true;
    }
    else
    {
      this.appService.lockedOrBlocked = false;
    }


  }


  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  async GetTasksForPOA() {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + this.getTaskListUri)
      .subscribe((response) => {
        this.taskCount = JSON.parse(response);

        if(!this.taskCount) {
          this.taskCount = {} as POATaskCount;
          this.taskCount.poa_preopassessment_id = this.poaId;
          this.taskCount.tasks = 0;
        }

      })
    )
   }

   getNoteListUri: string;
   async GetNotesForPOA() {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + this.getNoteListUri)
      .subscribe((response) => {
        this.noteCount = JSON.parse(response);

        //console.log(this.noteCount);

        if(!this.noteCount) {
          this.noteCount = {} as POANoteCount;
          this.noteCount.poa_preopassessment_id = this.poaId;
          this.noteCount.notes = 0;
        }

      })
    )
   }


  @Input('view') viewName: string;

  @Output() poaChange:EventEmitter<PreOpAssessment> =new EventEmitter<PreOpAssessment>();
    //Raise the event using the emit method.

    update() {
    this.appService.poaId = this.poaId;
    this.poaChange.emit(this.homePOA);
  }


  onViewClosed(childViewClosed: boolean) {
    this.GetLivePOA();
    this.GetTasksForPOA();

    try {
      this.selectedView = this.appService.viewToShow;
    }
    catch(err) {
      this.selectedView = "home";
    }

    if(!this.selectedView) {
      this.selectedView = "home";
    }


  }


  getPOAURI: string;
  postPOAURI: string;
  selectedPOA: PreOpAssessment;
  currentPOA: PreOpAssessment;

  async GetLivePOA() {
     this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);

        this.checkLockedOrBlocked();

        this.GetTasksForPOA();
        this.GetNotesForPOA();

      })
    )
   }
   async markSectionCompleted(completed) {
     //Get the latest version in case someone has changed something in another section at the same time
    this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);
        //Ubdate the observable
        this.selectedPOA.iscompletedpastmedicalhistory = completed;
        //update the entity record
        this.subscriptions.add(
          this.apiRequest.postRequest(this.postPOAURI, this.selectedPOA)
            .subscribe((response) => {
             //this.toasterService.showToaster("Success","Note Saved");
            })
          )

      })
    )
   }


  goBack() {
    this.appService.personId = this.personId;
    this.subjects.apiServiceReferenceChange.next();
    this.subjects.personIdChange.next();
  }

  gotoHome() {
    this.selectedView = "home";
  }



  gotoView(view: string) {
    this.selectedView = view;
  }




  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, private confirmationDialogService: ConfirmationDialogService) {

  }

  async getUserSettings() {
    await this.apiRequest.getRequest(this.appService.baseURI + '/GetListByAttribute?synapsenamespace=local&synapseentityname=poa_usersettings&synapseattributename=username&attributevalue=' + this.appService.loggedInUserName)
    .subscribe((response) => {
      this.userSettings = JSON.parse(response)[0];


      if(!this.userSettings) {
        this.userSettings = {} as UserSettings;
        this.userSettings.username = this.appService.loggedInUserName;
        this.userSettings.poa_usersettings_id = this.appService.loggedInUserName;
        this.userSettings.displaywarnings = true;
       this.postUserSettings();

      }

      if(!this.userSettings.username) {
        this.userSettings = {} as UserSettings;
        this.userSettings.username = this.appService.loggedInUserName;
        this.userSettings.poa_usersettings_id = this.appService.loggedInUserName;
        this.userSettings.displaywarnings = true;

       this.postUserSettings();

      }

      this.appService.displayWarnings = this.userSettings.displaywarnings;

      this.GetLivePOA();

    })
  }

  async toggleShowWarnings() {
    this.userSettings.displaywarnings = !this.userSettings.displaywarnings;
    await this.postUserSettings();
    this.appService.displayWarnings = this.userSettings.displaywarnings;
  }

  async toggleAutoProceed() {
    this.userSettings.autoproceedtonextsection = !this.userSettings.autoproceedtonextsection;
    await this.postUserSettings();
    this.appService.autoproceedtonextsection = this.userSettings.autoproceedtonextsection;
  }


  async postUserSettings() {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI  + "/PostObject?synapsenamespace=local&synapseentityname=poa_usersettings", this.userSettings)
        .subscribe((response) => {
         //this.toasterService.showToaster("Success","Note Saved");
        })
      )
  }


  async GetLinkedEncounter(postUpdateToServer: boolean) {

    if(!this.selectedPOA.linkedencounterid) {
      this.linkedEncounter = null;
      this.selectedPOA.lockedonadmission = false;
      this.selectedPOA.islocked = false;
      return;
    }
    if(this.selectedPOA.linkedencounterid === null) {
      this.linkedEncounter = null;
      this.selectedPOA.lockedonadmission = false;
      this.selectedPOA.islocked = false;
      return;
    }

    if(this.selectedPOA.linkedencounterid === "null") {
      this.linkedEncounter = null;
      this.selectedPOA.lockedonadmission = false;
      this.selectedPOA.islocked = false;
      return;
    }

    this.getLinkedEncounterURI = this.appService.baseURI + "/GetBaseViewListObjectByAttribute/poa_linkedencounters?synapseattributename=encounter_id&attributevalue=" + this.selectedPOA.linkedencounterid;
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getLinkedEncounterURI)
      .subscribe((dataResponse) => {
        this.linkedEncounter = JSON.parse(dataResponse);
        var promptUser = false;
        var updateMeta = false;
        if(this.selectedPOA.surgeon != this.linkedEncounter.consultingdoctortext) {
          updateMeta = true;
          if(this.selectedPOA.surgeon) {
            promptUser = true;
          }
        }
        if(!this.selectedPOA.admissiondate && this.linkedEncounter.patientclasstext === 'TCI') {
          if(this.selectedPOA.admissiondate != this.linkedEncounter.intendedadmissiondate) {
            updateMeta = true;
            if(this.selectedPOA.admissiondate) {
              promptUser = true;
            }
          }
        }
        if(!this.selectedPOA.admissiondate && this.linkedEncounter.patientclasstext != 'TCI') {
          if(this.selectedPOA.admissiondate != this.linkedEncounter.admitdatetime) {
            updateMeta = true;
            if(this.selectedPOA.admissiondate) {
              promptUser = true;
            }
          }

          if(this.selectedPOA.dischargedate != this.linkedEncounter.dischargedatetime) {
            updateMeta = true;
            if(this.selectedPOA.dischargedate) {
              promptUser = true;
            }
          }
        }


        if(updateMeta) {
          if(promptUser) {

            var displayConfirmation = this.appService.displayWarnings;
            if(displayConfirmation) {
              var response = false;
              this.confirmationDialogService.confirm('Information', 'Linked encounter details have been updated on PAS - Consultant, Admission Date and Dischage Date will be updated')
              .then((confirmed) => response = confirmed)
              .catch(() => response = false);
              // if(!response) {
              //   return;
              // }
            }
          }
        }

        // console.log("lockedonadmission:" + this.selectedPOA.lockedonadmission);
        // console.log("islocked:" + this.selectedPOA.islocked);


        this.selectedPOA.surgeon = this.linkedEncounter.consultingdoctortext;

        if(this.linkedEncounter.patientclasstext === 'TCI') {
            this.selectedPOA.admissiondate = new Date (this.linkedEncounter.intendedadmissiondate as Date);
            this.selectedPOA.lockedonadmission = false;
            this.selectedPOA.islocked = false;
        }

        if(this.linkedEncounter.patientclasstext != 'TCI') {
          this.selectedPOA.admissiondate = new Date (this.linkedEncounter.admitdatetime as Date);
          if(this.linkedEncounter.dischargedatetime) {
            this.selectedPOA.dischargedate = new Date (this.linkedEncounter.dischargedatetime as Date);
          }

          if(!this.selectedPOA.lockedonadmission) {
            this.selectedPOA.lockedonadmission = true;
            this.selectedPOA.islocked = true;
          }



        }

        if(postUpdateToServer) {
          this.postAssessment();
        }

      })

    )



  }

  async postAssessment() {
    //Get the latest version in case someone has changed something in another section at the same time
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.currentPOA = JSON.parse(response);
        //Update the observables with the latest statuses

        this.selectedPOA.iscompletedallergies = this.currentPOA.iscompletedallergies;
        this.selectedPOA.iscompletedassessments = this.currentPOA.iscompletedassessments;
        this.selectedPOA.iscompletedbaselineobservations = this.currentPOA.iscompletedbaselineobservations;
        this.selectedPOA.iscompletedfamilyhistory = this.currentPOA.iscompletedfamilyhistory;
        this.selectedPOA.iscompletedinfectioncontrol = this.currentPOA.iscompletedinfectioncontrol;
        this.selectedPOA.iscompletedinformationprovided = this.currentPOA.iscompletedinformationprovided;
        this.selectedPOA.iscompletedmedicationhistory = this.currentPOA.iscompletedmedicationhistory;
        this.selectedPOA.iscompletednursingassessment = this.currentPOA.iscompletednursingassessment;
        this.selectedPOA.iscompletedpastmedicalhistory = this.currentPOA.iscompletedpastmedicalhistory;
        this.selectedPOA.iscompletedphysicalexamination = this.currentPOA.iscompletedphysicalexamination;
        this.selectedPOA.iscompletedsocialhistory = this.currentPOA.iscompletedsocialhistory;
        this.selectedPOA.iscompletedsurgicalhistory = this.currentPOA.iscompletedsurgicalhistory;

        //Convert any dates
        this.selectedPOA.poadate = this.selectedPOA.poadate as Date;
        this.selectedPOA.admissiondate = this.selectedPOA.admissiondate as Date;
        this.selectedPOA.dischargedate = this.selectedPOA.dischargedate as Date;
        this.selectedPOA.revalidateddate = this.selectedPOA.revalidateddate as Date;


        //update the entity record
        this.subscriptions.add(
          this.apiRequest.postRequest(this.postPOAURI, this.selectedPOA)
            .subscribe((response) => {

              this.appService.locked = this.selectedPOA.islocked;
              if(this.appService.blocked || this.appService.locked) {
                this.appService.lockedOrBlocked = true;
              }
              else
              {
                this.appService.lockedOrBlocked = false;
              }

            })
          )

      })
    )
    }






}
