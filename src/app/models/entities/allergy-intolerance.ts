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
import { SNOMED } from "../snomed-model";
import { EntityBase } from "./entity-base.model";

export interface AllergyIntolerance extends EntityBase{
  allergyintolerance_id: string;
	person_id: string;
	encounter_id: string;
	causativeagentcodesystem: string;
	causativeagentcode: string;
	causativeagentdescription: string;
	clinicalstatusvalue: string;
	clinicalstatusby: string;
	cliinicialstatusdatetime: any;
	category: string;
	criticality: string;
	onsetdate: Date;
	enddate: Date;
	lastoccurencedate: Date;
	reportedbygroup: string;
	reportedbyname: string;
	reportedbydatetime: any;
	verificationstatus: string;
	assertedby: string;
	asserteddatetime: any;
	allergynotes: string;
	manifestationnotes: string;
  recordeddatetime: any;
  recordedby: string;
  displaywarning: string;
  allergyconcept: any;
  reactionconcepts: any;
}
