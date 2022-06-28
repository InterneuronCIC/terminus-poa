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
import { Injectable } from '@angular/core';
import { Encounter } from '../models/entities/encounter.model';
import { ConfigModel } from '../models/config.model';
import { action } from '../models/filter.model';
// @ts-ignore
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public personId: string;
  public encounterId: string;
  public poaId: string;
  public contexts: object;
  public encounter: Encounter;
  public isCurrentEncouner = false;
  public apiService: any;

  public baseURI: string;
  public carerecordURI: string;
  public terminologyURI: string;
  public autonomicURI: string;
  public imageserverURI: string;
  public identityserverURI: string;
  public currentMedicationModuleURI: string;
  public lc: Array<loadedcomponents> = [];

  public displayWarnings: boolean = true;

  public autoproceedtonextsection = true;

  public viewToShow: string = "home";

  public appConfig = new ConfigModel();
  public loggedInUserName: string = null;
  public currentPersonName: string = null;
  public enableLogging = true;
  public roleActions: action[] = [];

  public locked = true;
  public blocked = true;
  public lockedOrBlocked = true;

  reset(): void {
    this.contexts = null;
    this.personId = null;
    this.poaId = null;
    this.encounter = null;
    this.encounterId = null;
    this.isCurrentEncouner = false;
    this.apiService = null;
    this.baseURI = null;
    this.appConfig = new ConfigModel();
    this.loggedInUserName = null;
    this.enableLogging = true;
    this.roleActions = [];
    this.displayWarnings = true;
    this.currentPersonName = null;
    this.locked = true;
    this.blocked = true;
    this.lockedOrBlocked = true;
  }

  constructor() { }

  logToConsole(msg: any) {
    if (this.enableLogging) {
     //console.log(msg);
    }
  }

  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      console.log("JWT Decode Error:" + Error)
      return null;
    }
  }

  public authoriseAction(action: string): boolean {
    //console.log(this.roleActions.filter(x => x.actionname.toLowerCase() == action.toLowerCase()).length > 0);
    return this.roleActions.filter(x => x.actionname.toLowerCase() == action.toLowerCase()).length > 0;
  }


}
export class loadedcomponents {

  constructor(public id?: string, public unloaded?: boolean) {

  }

}
