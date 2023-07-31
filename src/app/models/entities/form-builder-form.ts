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
export interface FormBuilderForm {
    // _row_id : string;
    // _sequenceid : string;
    // _contextkey : string;
    // _createdtimestamp : Date;
     _createddate : Date;
    // _createdsource : string;
    // _createdmessageid : string;
    _createdby : string;
    // _recordstatus : string;
    // _timezonename : string;
    // _timezoneoffset : string;
    // _tenant : string;
    formbuilderform_id : string;
    formcomponents : string;
    comments : string;
    formname: string,
    version: number,
    formbuildersystemtype_id: string,
    formbuildercategory_id: string
}