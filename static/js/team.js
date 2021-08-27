
function generateAlumniTeamDIV(name, role, location, image ) {
    
    content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src=' + "" + image + ' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">' + name + '</h5><p class="position-team">' + role + ' at ' + location + '</p></div></div>'
    document.getElementById('teampage-section-alumni').innerHTML += content;
}

function generateCurrentTeamDIV(name, role, location, image,externals) {
    console.log(externals);

    if(externals == "false"){
    
    content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src=' + "" + image + ' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">' + name + '</h5><p class="position-team">' + role + ' at ' + location + '</p></div></div>'
    document.getElementById('teampage-section-current').innerHTML += content;
}else{
    console.log(externals);
    var icons = "<p>";
    for(x in externals){
        if(x == 'facebook'){
            console.log(externals[x]);
            icons += '<a href ="'+externals[x]+'"><i class="icons fab fa-facebook-square fa-lg"></i></a>&nbsp'
        }
        if(x == 'twitter'){
            console.log(externals[x]);
            icons += '<a href ="'+externals[x]+'"><i class="icons fab fa-twitter-square fa-lg"></i></a>&nbsp'
        }

        if(x == 'github'){
            console.log(externals[x]);
            icons += '<a href ="'+externals[x]+'"><i class="icons fab fa-github-square fa-lg"></i></a>&nbsp'
        }
        if(x == 'scholar'){
            console.log(externals[x]);
            icons += '<a href ="'+externals[x]+'"><i class="icons fa fa-graduation-cap fa-lg"></i></a>&nbsp'
        }
        // if(x == 'resume'){
        //     console.log(externals[x]);
        //     icons += '<a href ="'+externals[x]+'"><i class="fas fa-file fa-lg"></i></a>&nbsp'
        // }
    }
    icons += "</p></div></div>";
    content = '<div class="col-lg-3 col-md-6 col-12 mt-4 pt-2"><div class="text-center"><img src=' + "" + image + ' class="rounded-circle" alt="Generic placeholder image" width="140" height="140"><div class="margin-5px"></div><h5 class="font-bold">' + name + '</h5><p class="position-team">' + role + ' at ' + location + '</p>'
    content += icons
    document.getElementById('teampage-section-current').innerHTML += content;
}
}



var config = {
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json'
  };

function generateAlumni(obj,name){
    axios.defaults.headers = {
        'Content-Type': 'application/json',
    }
    var config2 = {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json'
      };

    console.log("entered generateAlumni");
    console.log(obj["ORCID"]);
    console.log(name)
    if(obj["ORCID"] == "true"){
        console.log("heyyyy it has orcid");
        console.log(obj)
        var assets_json = obj;
        var data_url = 'https://pub.orcid.org/v3.0/' + obj.id;
        axios.get(data_url, { data: null },config2)
        .then(function (response, obj) {
            JsonResponse = response.data;
            console.log(JsonResponse);
            var role = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"]["role-title"]);
            role = role.replace(/\"/g, "");
            console.log(role);
            var location = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"].organization.name);
            location = location.replace(/\"/g, "");
            console.log(JsonResponse = response.data); // ex.: { user: 'Your User'}
            console.log(response.status); // ex.: 200
            generateAlumniTeamDIV(name, role, location,assets_json["image"])
        });
    }else{
        console.log("it doesn't has orcid");
        generateAlumniTeamDIV(name, obj.role, obj.location,obj["image"])
    }
    console.log("exit generateAlumni");

}

function generateCurrent(obj,name){
    axios.defaults.headers = {
        'Content-Type': 'application/json',
    }
    var config2 = {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json'
      };

    console.log("entered generateAlumni");
    console.log(obj["ORCID"]);
    console.log(name)
    if(obj["ORCID"] == "true"){
        console.log("heyyyy it has orcid");
        console.log(obj)
        var assets_json = obj;
        var data_url = 'https://pub.orcid.org/v3.0/' + obj.id;
        axios.get(data_url, { data: null },config2)
        .then(function (response, obj) {
            JsonResponse = response.data;
            console.log(JsonResponse);
            var role = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"]["role-title"]);
            role = role.replace(/\"/g, "");
            console.log(role);
            var location = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"].organization.name);
            location = location.replace(/\"/g, "");
            console.log(JsonResponse = response.data); // ex.: { user: 'Your User'}
            console.log(response.status); // ex.: 200
            // generateAlumniTeamDIV(name, role, location,assets_json["image"])
            if(assets_json["externals"]){
                console.log("External is there")
                generateCurrentTeamDIV(name, role, location,assets_json["image"],assets_json["externals"])
            }else {
                generateCurrentTeamDIV(name, role, location,assets_json["image"],false)
                        }
        });
    }else{
        console.log("it doesn't has orcid");
        // generateAlumniTeamDIV(name, obj.role, obj.location,obj["image"])
    }
    console.log("exit generateCurrent");
    // var config2 = {
    //     headers: { 'Content-Type': 'application/json' },
    //     responseType: 'json'
    //   };
    // console.log("entered generateCurrent");
    // console.log(obj["ORCID"]);
    // console.log(name)
    // if(obj["ORCID"] == "true"){
    //     console.log("heyyyy it has orcid");
    //     console.log(obj)
    //     var assets_json = obj;
    //     var data_url = 'https://pub.orcid.org/v3.0/' + obj.id;
    //     axios.get(data_url, { data: null },config2)
    //     .then(function (response, obj) {
    //         JsonResponse = response.data;
    //         console.log(JsonResponse);
    //         var role = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"]["role-title"]);
    //         role = role.replace(/\"/g, "");
    //         console.log(role);
    //         var location = JSON.stringify(JsonResponse["activities-summary"].employments["affiliation-group"][0].summaries[0]["employment-summary"].organization.name);
    //         location = location.replace(/\"/g, "");
    //         console.log(JsonResponse = response.data); // ex.: { user: 'Your User'}
    //         console.log(response.status); // ex.: 200
    //         if(assets_json["externals"]){
    //             generateCurrentTeamDIV(name, role, location,assets_json["image"],false)
    //         }else {
    //             generateCurrentTeamDIV(name, role, location,assets_json["image"],assets_json[externals])
    //         }
    //     });
    // }else{
    //     console.log("it doesn't has orcid");
    //     if(assets_json["externals"] == undefined){
    //         generateCurrentTeamDIV(name, obj.role, obj.location,assets_json["image"],false)
    //     }else {
    //         generateCurrentTeamDIV(name, obj.role, obj.location,assets_json["image"],assets_json[externals])
    //     }
    // }
    // console.log("exit generateCurrent");
}

function team_generator(){
    console.log("entered");

    fetch('https://plab.shipsme.com/assets/team.json').then(res=>res.json()).then(insts=>{
        
        console.log(insts);
        for(let name in insts) {
            var obj = insts[name];
            var type = obj.type;
            if(type == 'alumni'){
                generateAlumni(obj,name);
            }else if (type == 'current'){
                generateCurrent(obj,name);

            }else{

            }
        }
});

}