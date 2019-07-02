const puppeteer =  require("puppeteer");
const cheerio = require("cheerio");
var _ = require('lodash');

const ObjectsToCsv = require('objects-to-csv');



//DB
const mongoose = require('mongoose');
mongoose.connect('mongodb:// : @ds345597.mlab.com:45597/bidmail', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log('we are connected!')
});

const porjectSchema = new mongoose.Schema({

    biddate: String,
    projectName: String,
    gencont: String,
    cheked: Boolean,
    inMonday: Boolean

});

const Project = mongoose.model('Project', porjectSchema);



//High level arrays
let scraperResults = [];
let nowInDatabase = [];
let dataForSaving = [];
let simpleResult = [];




//Scraping site
async function siteScraper(   ) {

    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage( );
        await page.goto('https://www. .com/#home');
        await page.waitForSelector("#user");
        await page.type("input#user", " ");
        await page.type("input#password", " ");
        await page.click("button.js-btn-login" );
        await page.waitForNavigation();   
        await page.waitForSelector(".js-company-info");        
        await page.click("a.js-company-info ");        
        
        await page.waitForSelector(".newMail-column");  
        await page.waitFor(5 * 1000);

        const content = await page.content();
        //console.log(content);
        const $ = await cheerio.load(content);

        let result = []; 
        

        $("tr.pointer").each(

            ( index, element ) => {

                
                const resultBidDate = $(element).children(".biddate-column").text();
                const resultGeneralContractor = $(element).children(".company-column").text();
                const resultProject = $(element).children(".description-column").text();  
                                
              


                let someProj = new Project({

                    biddate: resultBidDate,
                    projectName: resultProject,
                    gencont: resultGeneralContractor,
                    cheked: false,
                    inMonday: false
                });

                result.push(someProj);


                 

                let simpleObj = {
                    biddate: resultBidDate,
                    projectName: resultProject,
                    gencont: resultGeneralContractor 
                }

                simpleResult.push( simpleObj );


            }

        )   
        
     


        scraperResults = [ ...result ] ;






    } catch (err) {
        console.error(err)
    }

}

//Getting data from Databace
async function LoadFromMongo( ) {

            
    let result = await Project.find( function (err, item) {

            if (err) {
                console.log(err);
            } else {

              return item 
            }

        })

    nowInDatabase = [ ...result ];
   
}


//generate exel

async function createCsvFile( data ) {

            let csv = new ObjectsToCsv(data);

            // Save to file:
            await csv.toDisk('./test.csv');

            // Return the CSV file as string:
            console.log(await csv.toString());


}


//getting data for saving
async function getDataForSaving() {

    const newDataNames = scraperResults.map(item => item.projectName)
    const oldDataNames = nowInDatabase.map(item => item.projectName)

    uniqData = scraperResults.filter(item => !oldDataNames.includes(item.projectName))
    console.log(' Names for saving :', uniqData);

    dataForSaving = [...uniqData];

}




//for saving

const saveInMongo = () => {

   
   //saving!!!!!!

    dataForSaving.map((item) => {
        item.save(function (err) {

            if (err) return handleError(err);
            console.log('saved!')
            console.log(item.projectName)
        })
    })


}






async function scraperBidmail() {

    await siteScraper();
    await LoadFromMongo();
    await getDataForSaving();
    await saveInMongo();
    //await createCsvFile(simpleResult ) ;
    await console.log('finish!!!');

}


scraperBidmail();








   


   

    



















//console.log(scraperResults)


// const findTest = () => {

//     Project.find( function (err, item) {
//         if (err) {
//             console.log(err);
//         } else {

//             //let result = []
//             //result.push(item);
//             //console.log(result)
//             console.log(item) 
//         }

//     })

// }

//findTest();







// Project.find( function (err, item) {
//     if (err) {
//         console.log(err);
//     } else {

//         let result = []
//         result.push(item);
//         console.log(result)
//     }

// })






// let result = Project.find({ projectName: 'Grafton Lofts' }, function (err, docs) { 
//     if (err) {
//         console.log(err);
//     } return docs
//  });



// console.log(result);

// const resultBidDate = $("tr.pointer").children(".biddate-column").text();
// const resultGeneralContractor = $("tr.pointer").children(".company-column").text();
// const resultProject = $("tr.pointer").children(".js-description").text();



// console.log(resultBidDate)
// console.log(resultGeneralContractor)
// console.log(resultProject)