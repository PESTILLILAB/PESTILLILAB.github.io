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
                yml.write('\n')
                yml.write("startDate : '"+details['start-date']['month']['value']+"/01/"+details['start-date']['month']['value']+"'")
                yml.write('\n')
                if(details['external-ids']):
                    for k,y in details['external-ids'].items():
                        yml.write("external_url: '"+details['external-ids'][k][0]['external-id-url']['value']+"'")
                yml.write('\n')
                yml.write('---\n')
getFundings()
