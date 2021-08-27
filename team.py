from sys import exit
import json
import requests

with open('static/assets/team.json', 'r') as myfile:
    data=myfile.read()

obj = json.loads(data)

for x in obj:
    # print(obj[''+x])
    with open('content/team/'+x.replace(" ", "")+".md", 'w') as myfile:
        myfile.write('---')
        myfile.write('\n')
        myfile.write('name : '+x)
        myfile.write('\n')
        myfile.write('tags : [\''+obj[x]['type']+'\']')
        myfile.write('\n')
        myfile.write('ORCID : '+obj[x]['ORCID'])
        myfile.write('\n')
        ORCID_gen = obj[x]['ORCID']
        if(ORCID_gen == 'true'):
            ORCID_id = obj[x]['id']
            headers_t={"content-type": "application/json"}
            data_url = 'https://pub.orcid.org/v3.0/' + ORCID_id
            r = requests.get(url = data_url,headers = headers_t)
            response = json.loads(r.text)
            # print(response)
            role = response["activities-summary"]["employments"]["affiliation-group"][0]["summaries"][0]["employment-summary"]["role-title"]
            location = response["activities-summary"]["employments"]["affiliation-group"][0]["summaries"][0]["employment-summary"]["organization"]["name"]
            # print(location)
            position = role + ' at '+location
            print(position)
        myfile.write('position : '+position)
        myfile.write('\n')


        image = obj[x]['image']
        myfile.write('image : '+image)
        myfile.write('\n')
  
        for y in obj[x]['externals']:
            print(y)
            print(obj[x]['externals'][y])
            myfile.write(y+' : '+obj[x]['externals'][y])
            myfile.write('\n')

        myfile.write("---")




    # with open('content/team/'+x.replace(" ", "")+".md", 'w') as myfile:
    #     f.write("---")
    #     f.write("type :")
    # data=myfile.read()



exit()