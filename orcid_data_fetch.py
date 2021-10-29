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

def getPublications():
    response = requests.get('https://pub.orcid.org/v2.0/'+orcidID+'/works', headers={'Accept': 'application/json'})
    for x in response.json()['group']:
        paperDetails = x['work-summary']
        for details in paperDetails:
            with open('content/publications/'+str(details['put-code'])+str(details['type'])+'.md','w+') as yml:
                resp = requests.get('https://pub.orcid.org/v2.0/'+orcidID+'/works/'+str(details['put-code']),headers={'Accept': 'application/json'})
                for workDetail in resp.json()['bulk']:
                    yml.write('---\n')
                    yml.write("title : '"+details['title']['title']['value']+"'")
                    yml.write('\n')
                    if(workDetail['work']['journal-title']):
                        yml.write("journal : '"+workDetail['work']['journal-title']['value']+"'")
                    authors = []
                    for author in workDetail['work']['contributors']['contributor']:
                        authors.append(author['credit-name']['value'])
                    yml.write('\n')
                    yml.write("authors: "+str(authors)+"")
                    yml.write('\n')
                    dateobj = workDetail['work']['publication-date']
                    print(dateobj)
                    try:

                        if(dateobj and dateobj['month']['value'] and dateobj['year']['value'] and dateobj['day']['value']):
                            yml.write("publicationDate: '"+dateobj['month']['value']+"/"+dateobj['day']['value']+"/"+dateobj['year']['value']+"'")
                            yml.write('\n')
                    except :
                         print("datemissing")
                    if(workDetail['work']['external-ids']['external-id'][0]['external-id-type'] == 'doi'):
                        yml.write("doi: '"+workDetail['work']['external-ids']['external-id'][0]['external-id-value']+"'")
                    yml.write('\n')
                    yml.write('---\n')
                    # yml.write('doi :'+workDetail['work']['publication-date']['year']['value'])


getFundings()
getPublications()