function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
var HttpClient = function () {
    this.get = function (aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200)
                aCallback(this.responseText);
        }

        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.setRequestHeader("Content-Type", "application/json");
        anHttpRequest.send(null);
    }
}

function get_data_from_url(url) {
    var obj;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    anHttpRequest.setRequestHeader("Content-Type", "application/json");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            obj = JSON.parse(xmlhttp.responseText);
        }
    }

    return obj;
}
var CurrentTeam = [
    {
        "ORCID":true,
        "image": "https://brainlife.io/images/avatar/franco.jpg",
        "id": "0000-0002-2469-0494",
        "summary": "A small description"

    },
    {
        "ORCID" : true,
        "image": "https://brainlife.io/images/avatar/soichi.jpg",
        "id": "0000-0003-3641-3491",
        "summary": "A small descggggggggggription"
    },
    {
        "ORCID":false,
        "image" : "https://avatars2.githubusercontent.com/u/16397223?s=460&u=7f5cd78ae3a0046f1f10988bf0a0ddcf3b81953d&v=4",
        "name": "Dheeraj Bhatia",
        "summary" : "summer intern",
        "role" : "intern",
        "location":"Buffalo,NY",
    }
]

var AlumniTeam = [
    
    {
        /* bradley*/
        "ORCID" : true,
        "image" : "https://brainlife.io/images/avatar/brad.jpg",
        "id":"0000-0002-4486-1203",
    },
    {
        "ORCID" : true,
        /* Sophia */
        "image" : "https://brainlife.io/images/avatar/sophia_cropped_750x750.jpg",
        "id" : "0000-0002-3626-146X",
    },
    {
        /* Sandra*/
        "ORCID":true,
        "image" :"https://brainlife.io/images/avatar/sandra.jpg",
        id : "0000-0002-3677-1611",
    },
    {
        "ORCID" : false, 
        "image" : "https://brainlife.io/images/avatar/giulia3.png",
        "name" : "Giulia Bertò",
        "position":"Data and Application Engineer",
        "location":"BrainLife", 
    }
]

function generateCurrentTeamDIV(name, id, role, location) {
    var picture;
    var description;
    for (var i = 0; i < CurrentTeam.length; i++) {
        if(id == null){
            var obj = CurrentTeam[i];
            if (name == obj.name) {
                picture = obj.image;
                description = obj.summary;
            }
        }else{
        var obj = CurrentTeam[i];
        console.log(obj.id);
        console.log(id);
        id = id.replace(/\"/g, "");
        if (id == obj.id) {
            picture = obj.image;
            description = obj.summary;
        }
    }
    }
    content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src=' + "" + picture + ' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">' + name + '</h5><p class="position-team">' + role + ' at ' + location + '</p><p class="text-center caption-team">'+description+'</p></div></div>';
    document.getElementById('teampage-section-1').innerHTML += content;
}

function generateAlumniTeamDIV(name, id, role, location) {
    var picture;
    for (var i = 0; i < AlumniTeam.length; i++) {
        if(id == null){
            var obj = AlumniTeam[i];
            if (name == obj.name) {
                picture = obj.image;
                role = obj.position;
                location = obj.location;
            }
        }else{
        var obj = AlumniTeam[i];
        console.log(obj.id);
        console.log(id);
        id = id.replace(/\"/g, "");
        if (id == obj.id) {
            picture = obj.image;
        }
    }
    }
    content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src=' + "" + picture + ' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">' + name + '</h5><p class="position-team">' + role + ' at ' + location + '</p></div></div>'
    document.getElementById('teampage-section-alumni').innerHTML += content;
}

function team() {

    // CREATES Current Team
    console.log(CurrentTeam);
    for (var i = 0; i < CurrentTeam.length; i++) {
        
        var obj = CurrentTeam[i];
        console.log(obj.id);
        if(obj.ORCID == true){
        var passed_img = obj.image
        var client = new HttpClient();
        var name = "";
        var description = obj.summary;
        var role = "";
        var location = "";
        var content = "";
        axios.defaults.headers = {
            'Content-Type': 'application/json',
        }
        var data_url = 'https://pub.orcid.org/v3.0/' + obj.id;
        // var JsonResponse = get_data_from_url(data_url);
        var JsonResponse;
        axios.get(data_url, { data: null }, axios.defaults.headers)
            .then(function (response, obj) {
                console.log(obj);
                JsonResponse = response.data;
                var LastName = JSON.stringify(JsonResponse.person.name['family-name'].value);
                var FirstName = JSON.stringify(JsonResponse.person.name['given-names'].value);
                var id = JSON.stringify(JsonResponse["orcid-identifier"].path);
                // var image_address = passed_img;
                // console.log(image_address);
                LastName = LastName.replace(/\"/g, "");
                FirstName = FirstName.replace(/\"/g, "");
                name = FirstName + " " + LastName;
                console.log(name);
                // console.log(JsonResponse["activities-summary"]);
                role = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"]["role-title"]);
                role = role.replace(/\"/g, "");
                console.log(role);
                location = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"].organization.name);
                location = location.replace(/\"/g, "");


                console.log(JsonResponse = response.data); // ex.: { user: 'Your User'}
                console.log(response.status); // ex.: 200
                generateCurrentTeamDIV(name, id, role, location);
            });
        }else{
             generateCurrentTeamDIV(obj.name, null, obj.role, obj.location);
        }
        
        console.log("value of ab" + JsonResponse);
        // content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src='+""+passed_img+' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">'+name+'</h5><p class="position-team">'+role+' at '+location+'</p><p class="text-center caption-team">Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod. Etiam porta sem malesuada magna mollis euismod.</p></div></div>'
        // document.getElementById('teampage-section-1').innerHTML += content; 
    }

    // Creates Alumni Team 
    for (var i = 0; i < AlumniTeam.length; i++) {
        
        var obj = AlumniTeam[i];
        if(obj.ORCID == true){
        console.log(obj.id);
        var passed_img = obj.image
        var name = "";
        var description = obj.summary;
        var role = "";
        var location = "";
        axios.defaults.headers = {
            'Content-Type': 'application/json',
        }
        var data_url = 'https://pub.orcid.org/v3.0/' + obj.id;
        // var JsonResponse = get_data_from_url(data_url);
        var JsonResponse;
        axios.get(data_url, { data: null }, axios.defaults.headers)
            .then(function (response, obj) {
                console.log(obj);
                JsonResponse = response.data;
                var LastName = JSON.stringify(JsonResponse.person.name['family-name'].value);
                var FirstName = JSON.stringify(JsonResponse.person.name['given-names'].value);
                var id = JSON.stringify(JsonResponse["orcid-identifier"].path);
                // var image_address = passed_img;
                // console.log(image_address);
                LastName = LastName.replace(/\"/g, "");
                FirstName = FirstName.replace(/\"/g, "");
                name = FirstName + " " + LastName;
                console.log(name);
                // console.log(JsonResponse["activities-summary"]);
                role = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"]["role-title"]);
                role = role.replace(/\"/g, "");
                console.log(role);
                location = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"].organization.name);
                location = location.replace(/\"/g, "");


                console.log(JsonResponse = response.data); // ex.: { user: 'Your User'}
                console.log(response.status); // ex.: 200
                generateAlumniTeamDIV(name, id, role, location);
            });
        
        console.log("value of ab" + JsonResponse);
        // content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src='+""+passed_img+' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">'+name+'</h5><p class="position-team">'+role+' at '+location+'</p><p class="text-center caption-team">Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod. Etiam porta sem malesuada magna mollis euismod.</p></div></div>'
        // document.getElementById('teampage-section-1').innerHTML += content; 
    }else{
        generateAlumniTeamDIV(obj.name, null, obj.role, obj.location);
    }
}
}

function generateAlumni(obj){
    console.log("entered generateAlumni");

    if(obj.ORCID ==true){
        console.log("it has orcid");
        console.log(obj)
        var assets_json = obj;
        var data_url = 'https://pub.orcid.org/v3.0/' + obj.id;
        axios.get(data_url, { data: null }, axios.defaults.headers)
        .then(function (response, obj,) {
            console.log("checking obj \n"+obj);
            JsonResponse = response.data;
            role = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"]["role-title"]);
            role = role.replace(/\"/g, "");
            console.log(role);
            location = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"].organization.name);
            location = location.replace(/\"/g, "");
            console.log(JsonResponse = response.data); // ex.: { user: 'Your User'}
            console.log(response.status); // ex.: 200
                });
    }else{
        console.log("it doesn't has orcid");
    }
}




function team_generator(){
    console.log("entered");

    fetch('https://plab.shipsme.com/assets/team.json').then(res=>res.json()).then(insts=>{
        
        console.log(insts);
        for(let name in insts) {
            var obj = insts[name];
            var type = obj.type;
            if(type == 'alumni'){
                generateAlumni(obj);
            }else if (type == 'current'){

            }else{

            }
        }
});

}





// const CORS_PROXY = "https://test.cors.workers.dev/"
// let parser = new RSSParser();
// parser.parseURL(CORS_PROXY+'https://pubmed.ncbi.nlm.nih.gov/rss/search/1-E-T-Pur1FBkVKbU8LjWt1-9Q259xhHJ9EYoUamU1xlaplMjx/?limit=100&utm_campaign=pubmed-2&fc=20210112114804', function(err, feed) {
//   if (err) throw err;
//   feed.items.forEach(function(entry) {
//     console.log(entry);
//   });
// });

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

// let parser = new RSSParser();
// parser.parseURL(CORS_PROXY + 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1-E-T-Pur1FBkVKbU8LjWt1-9Q259xhHJ9EYoUamU1xlaplMjx/?limit=100&utm_campaign=pubmed-2&fc=20210112114804', function(err, feed) {
//   if (err) throw err;
//   console.log(feed.title);
//   feed.items.forEach(function(entry) {
//     console.log(entry.title + ':' + entry.link);
//     console.log(entry.pubDate);
//     console.log(entry["dc:creator"]);
//   })
// })
var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"]
};
// try{
// var jsonObj = parser.parse(CORS_PROXY+'https://pubmed.ncbi.nlm.nih.gov/rss/search/1-E-T-Pur1FBkVKbU8LjWt1-9Q259xhHJ9EYoUamU1xlaplMjx/?limit=100&utm_campaign=pubmed-2&fc=20210112114804',[options]);
// }catch(error){
//     console.log(error.message);
//   }

// var result = parser.validate(jsonObj);
// if (result !== true) console.log(result.err);
// var jsonObj = parser.parse(xmlData);

var dataUrl = CORS_PROXY+'https://pubmed.ncbi.nlm.nih.gov/rss/search/1-E-T-Pur1FBkVKbU8LjWt1-9Q259xhHJ9EYoUamU1xlaplMjx/?limit=100&utm_campaign=pubmed-2&fc=20210112114804';

// jQuery.ajax({
//     type :"GET",
//     url : dataUrl,
//     success : function(dataXML){
//         //dataXML will have the complete xml..
//         var dataXML_OUTPUT = "<?xml version='1.0' encoding='UTF-8'?>"+dataXML;
//         console.log(dataXML);
//         try{
//             var jsonObj = parser.parse(dataXML_OUTPUT,options, true);
//             var tObj = parser.getTraversalObj(dataXML_OUTPUT,options);
//             var jsonObj = parser.convertToJson(tObj,options);

//             var jsonObj2 = parser.parse(dataXML_OUTPUT);
//             console.log(jsonObj2);
//           }catch(error){
//             console.log(error.message);
//           }

//           var jsonObj2 = parser.parse(dataXML_OUTPUT);
//           console.log(jsonObj2);

//     },
//     error : function(){
//         //error handler..
//     }
// });

function generatePublication(title,date,authors,link,doi,journal) {
    var doi_num = doi [doi.length - 1];
    content = '<li class="timeline-item bg-white rounded ml-3 p-4 shadow"> <div class="timeline-arrow"></div><p><span class="orange-text">'+date+'</span></p><h2 class="h5">'+title+'</h2><p>'+authors+'</p> <p class="journal bold">'+journal+'<br><span><a href='+link+'><span class="badge badge-pill badge-info">'+doi_num+'</a></span></p></li>'
    console.log("ddd"+doi_num);
    document.getElementById('_publications').innerHTML += content;
}

axios.get('https://plab.shipsme.com/assets/pub.xml', { data: null }, axios.defaults.headers)
            .then(response => {
                console.log(response.data)
                var jsonObj2 = parser.parse(response.data);
                console.log(jsonObj2);
                console.log(jsonObj2.rss.channel.item.length);
                for(i=0; i <= jsonObj2.rss.channel.item.length;i++){
                    var output = jsonObj2.rss.channel.item[i];
                    var title = output.title;
                    var date = output["dc:date"];
                    var authors = output["dc:creator"];
                    // authors.split
                    var link = output["link"];
                    var doi = output["dc:identifier"]
                    var journal = output["dc:source"]
                    generatePublication(title, date,authors,link,doi,journal);
                }
 });

function pub_gen(){
    axios.get('https://plab.shipsme.com/assets/pub.xml', { data: null }, axios.defaults.headers)
            .then(response => {
                console.log(response.data)
                var jsonObj2 = parser.parse(response.data);
                console.log(jsonObj2);
                console.log(jsonObj2.rss.channel.item.length);
                for(i=0; i <= jsonObj2.rss.channel.item.length;i++){
                    var output = jsonObj2.rss.channel.item[i];
                    var title = output.title;
                    var date = output["dc:date"];
                    var authors = output["dc:creator"];
                    // authors.split
                    var link = output["link"];
                    var doi = output["dc:identifier"]
                    var journal = output["dc:source"]
                    generatePublication(title, date,authors,link,doi,journal);
                }
 });
}


function generateAwards(startDate,endDate,pi,copi,title){
    content = '<li class="timeline-item bg-white rounded ml-3 p-4 shadow"> <div class="timeline-arrow"></div><p><span class="orange-text">'+startDate +' to '+ endDate+'</span></p><h2 class="h5">'+title+'</h2><p>'+pi+' ,'+copi+'</p> <p class="journal bold"><br><span><a href='+title+'><span class="badge badge-pill badge-info">'+'</a></span></p></li>';
    document.getElementById('_awards').innerHTML += content;
}

// axios.get('assets/nsf.json').then(response =>{
//     // console.log(response.data);
//     console.log(response.data.response.award);
//     var outputs = response.data.response.award;
//     for(i=0; i <= outputs.length;i++){
//         var output = response.data.response.award[i];
//         if(output.coPDPI != undefined){
//             generateAwards(output.startDate,output.expDate,output.piFirstName+' '+output.piLastName,output.coPDPI,output.title);
//     }else{
//         generateAwards(output.startDate,output.expDate,output.piFirstName+' '+output.piLastName,"",output.title);

//     }
//     }
// });


axios.get(CORS_PROXY+'https://api.federalreporter.nih.gov/v1/Projects/search?query=piName%3AFRANCO%20PESTILLI&offset=1&limit=100').then(response =>{
    console.log(response);
    // console.log(response.data.response.award);
    var outputs = response.data.items;
    for(i=0; i <= outputs.length;i++){
        var output = response.data.items[i];
        if(output.otherPis != undefined){
            
            generateAwards(output.projectStartDate,output.projectEndDate,output.contactPi,output.otherPis,output.title);
    }else{
        generateAwards(output.projectStartDate,output.projectEndDate,output.contactPi,"",output.title);

    }
    }
});

$(document).ready(function(){

    //   $("li").sort(function(a,b){
    //     return new Date($(a).attr("data-event-date")) < new Date($(b).attr("data-event-date"));
    // }).each(function(){
    //     $("ul").prepend(this);
    // })
    
    var container = $(".timeline");
        var items = $(".timeline-item");
        
        items.each(function() {
           // Convert the string in 'data-event-date' attribute to a more
           // standardized date format
           console.log("here2");
          //  var BCDate = $(this).attr("data-event-date");
          var BCDate = $(this).find('.date_check').text();
          var obj = $(this).find('.h5').text();
           console.log('BC DATE '+BCDate +'for'+obj);
           standardDate = new Date(BCDate).getTime();
           console.log("final standard date:"+standardDate);
           $(this).attr("data-event-date", standardDate);
     
        });
        
    
        items.sort(function(a,b){
            a = parseFloat($(a).attr("data-event-date"));
            b = parseFloat($(b).attr("data-event-date"));
            return a>b ? -1 : a<b ? 1 : 0;
        }).each(function(){
          console.log("order"+this);
            container.append(this);
        });
        
    });
    