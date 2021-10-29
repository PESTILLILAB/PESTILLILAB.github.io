import requests
import json
import yaml
import pathlib

orcidID = "0000-0002-2469-0494"

def getFundings():
    response = requests.get("https://pub.orcid.org/v2.0/"+orcidID+"/fundings",headers={'Accept': 'application/json'})
    for x in response.json()['group']:
        funding = x['funding-summary']
        for details in funding:
            with open('content/research/'+str(details['put-code'])+str(details['type'])+'.md','w+') as yml:
                yml.write('---\n')
                yml.write("title : '"+details['title']['title']['value']+"'")
                print(yml)
                # print(details)
            # print(details['title'])
        # with open('plab/PESTILLILAB.github.io/content/research/'+funding['type']+funding['put-code']+'.md','w+') as yml:
        
    # print(response.text)
getFundings()
