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
import { EntityBase } from "./entity-base.model";

export interface  PreOpAssessment extends EntityBase {
  poa_preopassessment_id: string;
  person_id: string;
  iscompletedpastmedicalhistory: boolean;
	iscompletedbaselineobservations: boolean;
	iscompletedallergies: boolean;
	iscompletedmedicationhistory: boolean;
	iscompletedsurgicalhistory: boolean;
	iscompletedphysicalexamination: boolean;
	iscompletedfamilyhistory: boolean;
	iscompletedsocialhistory: boolean;
	iscompletedinfectioncontrol: boolean;
	iscompletedinformationprovided: boolean;
	iscompletednursingassessment: boolean;
  reviewedbypharmacist: boolean;
  iscompletedassessments: boolean;
	bmi: Number;
  poastatus: string;
	hdurequired: boolean
	proaction: string;
	poatype: string;
	poadate: Date;
	surgeon: string;
	operation: string;
	admissiondate: Date
	losdays: Number;
	losnights: Number
	dischargedate: Date
	revalidated: boolean
	revalidationtype: string;
	revalidateddate: Date;
  height: Number;
	weight: Number;
	obervationeventid: string;
	heightobservationid: string;
	weightobservationid: string;
  eventcorrelationid: string;
  reviewedbypharmacistdate: any;
  hdurequiredreason: string;
  reviewedbypharmacistuser: string;
  iscompletedgeneral: boolean;
  linkedencounterid: string;
  islocked: boolean;
  lockedonadmission: boolean;
  completedby: string;
  validatedby: string;
  heartrate: number;
  systolicbp: number;
  systolicbp1: number;
  systolicbp2: number;
  diastolicbp: number;
  diastolicbp1: number;
  diastolicbp2: number;
  isprinted: boolean;
  printeddate: any;
  printeduser: string;
}
