/*
 * For when a backend database is setup with this project
 * $(document).ready(function() {
    var trucksInfoDt = $('#trucksInfo').DataTable({
    	buttons: [
    		'excel', 'pdf', 'print'
    	],
    	"ajax": ''
    });
} );

trucksInfoDt.buttons().container().appendTo($('', trucksInfoDt.table().container()));*/

//Temporary source of data until a new one is produced
var truckOverviewData = [
    [ "Tiger Nixon", "1224", "Matawan, NJ", "Yellow", "40", "8:00 AM", "4:00 PM" ],
    [ "Garrett Winters", "1225", "Aberdeen, NJ", "Red", "70", "12:00 PM", "5:00 PM" ],
    [ "Ashton Cox", "1226", "Middletown, NJ", "Red", "65", "6:00 AM", "12:00 PM" ],
    [ "Cedric Kelly", "1227", "Matawan, NJ", "Red", "68", "7:00 AM", "3:30 PM" ],
    [ "Airi Satou", "1228", "Matawan, NJ", "Green", "10", "10:00 AM", "5:30 PM" ],
    [ "Brielle Williamson", "1229", "Aberdeen, NJ", "Red", "72", "11:30 AM", "6:30 PM" ],
    [ "Herrod Chandler", "1230", "Holmdel, NJ", "Yellow", "35", "2:30 PM", "8:00 PM" ],
    [ "Rhona Davidson", "1231", "Aberdeen, NJ", "Yellow", "32", "3:00 PM", "8:00 PM" ],
    [ "Colleen Hurst", "1232", "Red Bank, NJ", "Yellow", "30","2:00 PM", "7:30 PM" ],
    [ "Sonya Frost", "1233", "Red Bank, NJ", "Yellow", "34", "1:30 PM", "6:30 PM" ],
    [ "Jena Gaines", "1234", "Ocean City, NJ", "Yellow", "38", "3:45 PM", "9:45 PM" ],
    [ "Quinn Flynn", "1235", "Atlantic City, NJ", "Red", "80", "8:30 AM", "4:30 PM" ],
    [ "Charde Marshall", "1236", "Atlantic City, NJ", "Green", "16", "9:00 AM", "5:00 PM" ],
    [ "Haley Kennedy", "1237", "Wildwood, NJ", "Green", "20", "9:00 AM", "5:30 PM" ],
    [ "Tatyana Fitzpatrick", "1238", "Ocean City, NJ", "Red", "85", "6:00 AM", "2:00 PM" ],
    [ "Michael Silva", "1239", "Wildwood, NJ", "Red", "90", "7:30 AM", "4:30 PM" ],
    [ "Paul Byrd", "1240", "Holmdel, NJ", "Yellow", "40", "11:30 AM", "6:30 PM" ],
    [ "Gloria Little", "1320", "Holmdel, NJ", "Red", "75", "8:45 AM", "4:45 PM" ],
    [ "Bradley Greer", "1321", "Red Bank, NJ", "Green", "10", "9:15 AM", "5:15 PM" ],
    [ "Dai Rios", "1322", "Aberdeen, NJ", "Green", "15", "8:00 AM", "4:00 PM" ],
    [ "Jenette Caldwell", "1323", "Wildwood, NJ", "Yellow", "35", "1:30 PM", "6:30 PM" ],
    [ "Yuri Berry", "1324", "Ocean City, NJ", "Yellow", "43", "8:45 AM", "3:45 PM" ],
    [ "Caesar Vance", "1325", "Matawan, NJ", "Yellow", "48", "10:00 AM", "4:00 PM" ],
    [ "Doris Wilder", "1326", "Aberdeen, NJ", "Red", "67", "6:45 AM", "12:45 PM" ],
    [ "Angelica Ramos", "1327", "Wildwood, NJ", "Red", "73", "5:00 PM", "12:00 AM" ],
    [ "Gavin Joyce", "1328", "Wildwood, NJ", "Green", "12", "8:45 AM", "3:45 PM" ],
    [ "Jennifer Chang", "1329", "Red Bank, NJ", "Yellow", "50", "2:30 PM", "10:30 PM" ],
    [ "Brenden Wagner", "1330", "Matawan, NJ", "Red", "92", "5: 00 AM", "12:00 PM" ],
    [ "Fiona Green", "1410", "Matawan, NJ", "Red", "120", "2:00 PM", "10:00 PM" ],
    [ "Shou Itou", "1420", "Red Bank, NJ", "Green", "19", "6:00 AM", "12:00 PM" ],
    [ "Michelle House", "1421", "Wildwood, NJ", "Green", "10", "3:30 PM", "10:30 PM" ],
    [ "Suki Burks", "1422", "Ocean City, NJ", "Red", "74", "4:00 PM", "12:00 AM" ],
    [ "Prescott Bartlett", "1423", "Aberdeen, NJ", "Yellow", "32", "4:15 PM", "10:15 PM" ],
    [ "Gavin Cortez", "1424", "Wildwood, NJ", "Yellow", "46", "8:00 AM", "4:00 PM" ],
    [ "Martena Mccray", "1425", "Holmdel, NJ", "Yellow", "41", "10:00 AM", "5: 00 PM" ],
    [ "Unity Butler", "1426", "Wildwood, NJ", "Green", "5", "10:00 AM", "5: 00 PM" ]
];

$(document).ready(function() {
    var trucksInfoDt = $('#trucksInfo').DataTable({
    	data: truckOverviewData,
    	columns: [
    		{title: "Truck Driver"},
    		{title: "Truck ID No"},
    		{title: "Service Location"},
    		{title: "Current Status"},
    		{title: "Idle Time (min)"},
    		{title: "Start of Shift"},
    		{title: "End of Shift"}
    	],
    	buttons: [
    		'excel', 'pdf', 'print'
    	]
    });
} );

trucksInfoDt.buttons().container().appendTo($('#tableBttns', trucksInfoDt.table().container()));