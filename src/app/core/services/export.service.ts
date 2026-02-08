import { Injectable } from '@angular/core';
import { utils, writeFile } from "xlsx";
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

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

    /**
     * Export an HTML element to a PDF file in landscape orientation.
     * 
     * @param elementId The ID of the HTML element to capture.
     * @param filename The filename for the exported PDF (without extension).
     * @returns Promise that resolves when PDF generation is complete
     */
    toPdf(elementId: string, filename: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const element = document.getElementById(elementId);
            if (element) {
                html2canvas(element).then(canvas => {
                    const imgWidth = 297; // A4 landscape width in mm
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    const contentDataURL = canvas.toDataURL('image/jpeg', 0.75);
                    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
                    
                    pdf.addImage(contentDataURL, 'JPEG', 0, 0, imgWidth, imgHeight);
                    pdf.save(`${filename}.pdf`);
                    resolve();
                }).catch(error => reject(error));
            } else {
                reject(new Error('Element not found'));
            }
        });
    }
}