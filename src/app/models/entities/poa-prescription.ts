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

export interface  PreOpPrescription extends EntityBase {
  poa_prescription_id: string;
	indication: string;
	comments: string;
	titrationtype: string;
	targetinr: string;
	targetsaturation: string;
	orderformtype: string;
	isinfusion: boolean;
	ismedicinalgas: boolean;
	prescriptionsourceid: string;
	hasbeenmodified: boolean;
	reasonforediting: string;
	lastmodifiedby: string;
	epmaprescriptioneventid: string;
	reasonforstopping: string;
	reasonforsuspending: string;
	allowsubstitution: string;
	substitutioncomments: string;
	createdon: Date;
	createdby: string;
	lastmodifiedon: Date;
	titrationtargetmin: number;
	titrationtargetmax: number;
	titrationtargetunits: string;
	titrationtypecode: string;
	oxygenadditionalinfo: string;
	correlationid: string;
	person_id: string;
	referral_id: string;
	poa_preopassessment_id: string;
	prescriptioncontext_id: string;
	prescriptionadditionalconditions_id: string;
	oxygendevices_id: string;
	infusiontype_id: string;
	prescriptionsource_id: string;
	prescriptionstatus_id: string;
	epma_prescriptionevent_id: string;
	titration: boolean;
	poacomments: string;
}
