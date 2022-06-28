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
import { PreOpNote } from '../models/entities/poa-note';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';


declare var $: any;

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent {

  subscriptions: Subscription = new Subscription();
  poaId: string;
  personId: string;

  staffGroups: PreOpStaffGroup[];
  poaNotes: PreOpNote[];
  //filteredNotes: PreOpNote[];
  poaNote: PreOpNote;

  getStaffListUri: string = "/GetList?synapsenamespace=local&synapseentityname=poa_staffgroup&orderby=displayorder ASC";
  getNoteListUri: string;
  getNoteUri: String = "";
  postNoteUri: string = "/PostObject?synapsenamespace=local&synapseentityname=poa_note";

  staffFilter: string = "All";

  newStaffGroup: string;
  newNote: string;

  setFilter() {
    this.staffFilter = "POA Nurse";
  }

  selectedNotesView: string;

  private _preOpAssessment: PreOpAssessment;
  @Input() set preOpAssessment(value: PreOpAssessment) {
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;
    this.selectedNotesView = 'notes';

   // this.getNoteListUri = "/GetListByAttribute?synapsenamespace=local&synapseentityname=poa_note&synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId + '&orderby=_sequenceid ASC';
    this.getNoteListUri  = "/GetBaseViewListByAttribute/poa_poanotes?synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId + '&orderby=_createddate DESC';
    //Get Staff Groups

    this.GetNotesAndStaffList();


    this.clearForNewNote();

  };
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  clearForNewNote() {
    this.poaNote = {}  as PreOpNote;
    this.poaNote.person_id = this.personId;
    this.poaNote.poa_preopassessment_id = this.poaId;
    this.poaNote.poa_note_id = String(Guid.create());
    this.poaNote.notes = null;
    this.poaNote.poa_staffgroup_id = null;
    this.GetNotesForPerson();
  }


  async GetNotesAndStaffList() {



    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + this.getStaffListUri)
      .subscribe((response) => {

        this.staffGroups = JSON.parse(response);

        this.staffFilter = "All";

        this.apiRequest.getRequest(this.appService.baseURI + this.getNoteListUri)
        .subscribe((data) => {
          this.poaNotes = JSON.parse(data);
          this.GetNotesForPerson();

        })



      })


    )


   }

   get filteredNotes(): PreOpNote[] {
    if (this.staffFilter != "All") {
      return this.poaNotes.filter((a) =>
        a.poa_staffgroup_id.includes(this.staffFilter)
      );
    }
    return this.poaNotes;
}


   async GetNotesForPerson() {

    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + this.getNoteListUri)
      .subscribe((response) => {
        this.poaNotes = JSON.parse(response);
      })


    )


   }




  @Output() viewClosed = new EventEmitter<boolean>();

  save() {
    this.appService.viewToShow = 'nursingAssessment';
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

    this.clearForNewNote();
    this.selectedNotesView = 'notes';
  }

  // cancelNew() {
  //   var r = confirm("Are you sure that you want to cancel?");
  //   if (r == false)  {
  //     //do nothing
  //     return;
  //   }
  //   else if (r == true) {
  //     this.clearForNewNote();
  //     this.selectedNotesView = 'notes';
  //   } else {
  //     //do nothing
  //     return;
  //   }
  // }

  saveNew() {

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + this.postNoteUri, this.poaNote)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","Note Saved");

         this.clearForNewNote();
         this.selectedNotesView = 'notes';


        })
      )



  }


  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, private confirmationDialogService: ConfirmationDialogService) {

  }

  addNew(evemt) {
    this.selectedNotesView = 'new';
    this.gotoTop();
  }

  //--------------------------------------
// Navigation
//--------------------------------------

async cancel() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the main menu? Any new changes will not be saved')
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
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the menu? Any new changes will not be saved')
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
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go back to the previous screen? Any new changes will not be saved')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'informationProvided';
  this.viewClosed.emit(true);
}

async next() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the next screen? Any new changes will not be saved')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'nursingAssessment';
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
