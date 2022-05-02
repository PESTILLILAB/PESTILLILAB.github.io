import requests
import json
import yaml
import pathlib
import sys

orcidID = "0000-0002-2469-0494"

def getFundings():
    response = requests.get("https://pub.orcid.org/v2.0/"+orcidID+"/fundings",headers={'Accept': 'application/json'})
    for x in response.json()['group']:
        print(x)
        funding = x['funding-summary']
        for details in funding:
            with open('content/research/'+str(details['put-code']).replace('"',"")+str(details['type'])+'.md','w+') as yml:
                yml.write('---\n')
                details['title']['title']['value'] = details['title']['title']['value'].replace('"',"")
                yml.write("title : '"+details['title']['title']['value']+"'")
                yml.write('\n')
                print("DATEEEEEEEEE"+str(details['start-date']))
                yml.write("startDate : "+str(details['start-date']['year']['value'])+"-"+details['start-date']['month']['value']+"-01"+"T00:00:00-04:00")
                yml.write('\n')
                try:
                    print(details['contributors'])
                except:
                    print('no contri')
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
            if(str(details['put-code'])):
                resp = requests.get('https://pub.orcid.org/v2.0/'+orcidID+'/works/'+str(details['put-code']),headers={'Accept': 'application/json'})
                #will only proceed to write a publication if it has year month and day
                pubtitle = details['title']['title']['value'].replace('"',"")
                dateobj = resp.json()['bulk'][0]['work']['publication-date']
                try:
                    # print(dateobj)
                    # journal_title = resp.json()['bulk'][0]['work']['journal-title']['value']
                    # if(dateobj['month']['value'] and dateobj['year']['value'] and dateobj['day']['value']):
                    if(dateobj and dateobj['month']['value'] and dateobj['year']['value'] and dateobj['day']['value']):
                        dateString = ""+dateobj['month']['value']+"/"+dateobj['day']['value']
                        print(dateString)
                        #Title1stWord_type.md
                        with open('content/publications/'+str(pubtitle.replace('"',"").split(" ")[0]+"_")+str(details['type'])+'.md','w+') as yml:
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
                                        yml.write("publicationDate: "+dateobj['year']['value']+"-"+dateobj['month']['value']+"-"+dateobj['day']['value']+"T00:00:00-04:00")
                                        yml.write('\n')
                                except :
                                    print("datemissing")
                                if(workDetail['work']['external-ids']['external-id'][0]['external-id-type'] == 'doi'):
                                    yml.write("doi: '"+workDetail['work']['external-ids']['external-id'][0]['external-id-value']+"'")
                                yml.write('\n')
                                yml.write('---\n')
                                print("COMPLETED")
                except:
                    # print(dateobj)
                    # print("Date missing "+pubtitle+","+str(dateobj))
                    print("Error on line {}".format(sys.exc_info()[-1].tb_lineno))
                    continue
            # with open('content/publications/'+str(details['put-code'])+str(details['type'])+'.md','w+') as yml:
                
                # resp = requests.get('https://pub.orcid.org/v2.0/'+orcidID+'/works/'+str(details['put-code']),headers={'Accept': 'application/json'})
                # for workDetail in resp.json()['bulk']['work]:
                #     yml.write('---\n')
                #     yml.write("title : '"+details['title']['title']['value']+"'")
                #     yml.write('\n')
                #     if(workDetail['journal-title']):
                #         yml.write("journal : '"+workDetail['journal-title']['value']+"'")
                #     authors = []
                #     for author in workDetail['contributors']['contributor']:
                #         authors.append(author['credit-name']['value'])
                #     yml.write('\n')
                #     yml.write("authors: "+str(authors)+"")
                #     yml.write('\n')
                #     dateobj = workDetail['publication-date']
                #     print(dateobj)
                #     try:

                #         if(dateobj and dateobj['month']['value'] and dateobj['year']['value'] and dateobj['day']['value']):
                #             yml.write("publicationDate: '"+dateobj['month']['value']+"/"+dateobj['day']['value']+"/"+dateobj['year']['value']+"'")
                #             yml.write('\n')
                #     except :
                #          print("datemissing")
                #     if(workDetail['external-ids']['external-id'][0]['external-id-type'] == 'doi'):
                #         yml.write("doi: '"+workDetail['external-ids']['external-id'][0]['external-id-value']+"'")
                #     yml.write('\n')
                #     yml.write('---\n')
                    # yml.write('doi :'+workDetail['publication-date']['year']['value'])


getFundings()
getPublications()