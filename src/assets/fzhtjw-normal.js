﻿import jsPDF from 'jspdf'
(function (jsPDFAPI) {
var callAddFont = function () {
this.addFileToVFS('fzhtjw-normal.ttf', font);
this.addFont('fzhtjw-normal.ttf', 'fzhtjw', 'normal');
};
jsPDFAPI.events.push(['addFonts', callAddFont])
 })(jsPDF.API);