import { Injectable } from '@angular/core';
import { utils, writeFile } from "xlsx";

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor() { }

    /**
     * Export an array of data to an Excel file.
     * 
     * The first row of the array is expected to contain the column headers.
     * 
     * The filename will be used as the sheet name in the spreadsheet, and the
     * file will be saved with an ".xlsx" extension. If the filename is longer
     * than 31 characters, it will be truncated.
     * 
     * @param data The array of data to be exported.
     * @param filename The filename for the exported spreadsheet.
     */
    toExcel(data: any[], filename: string): void {
        const sheetName = filename.length > 31 ? filename.substring(0, 31) : filename;
        const worksheet = utils.json_to_sheet(data);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, sheetName);

        writeFile(workbook, `${filename}.xlsx`, { compression: true });
    }
}