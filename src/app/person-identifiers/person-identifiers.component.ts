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
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
//import { SubjectsService } from './services/subjects.service';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
//import { EscalationForm } from '../models/fluidbalanceescalation.model';
import { v4 as uuidv4 } from 'uuid';
import { SubjectsService } from '../services/subjects.service';
import { Person } from '../models/entities/core-person.model';
import { PersonIdentifier } from '../models/entities/core-personidentifier.model';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { ConfigService } from '../services/config.service';
import { FormControl, SelectMultipleControlValueAccessor } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DataContract } from '../models/filter.model';
import { KeyValuePair } from '../models/keyvaluepair';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-person-identifiers',
  templateUrl: './person-identifiers.component.html',
  styleUrls: ['./person-identifiers.component.css']
})
export class PersonIdentifiersComponent implements OnInit, OnDestroy {

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService) { }
  
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  subscriptions: Subscription = new Subscription();

  personIdentifiers: PersonIdentifier[];
  
 private _personData: Person;
 
 @Input() set person(value: Person) {

  this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + '/GetListByAttribute?synapsenamespace=core&synapseentityname=personidentifier&synapseattributename=person_id&attributevalue=' + value.person_id)      
      .subscribe((response) => {
        var data = JSON.parse(response); 
            //console.log(data);
            this.personIdentifiers = data;            
      })
      );

  }
  get person(): Person { return this._personData; }
 


  ngOnInit() {

   
   

  }

  

}
