from apscheduler.schedulers.background import BackgroundScheduler as scheduler
import requests
import json
import yaml
import pathlib
import pprint

nih_link = 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1-E-T-Pur1FBkVKbU8LjWt1-9Q259xhHJ9EYoUamU1xlaplMjx/?limit=100&utm_campaign=pubmed-2&fc=20210112114804'
nsf_data_link = 'https://api.nsf.gov/services/v1/awards.json?keyword="franco+pestilli"&printFields=startDate,expDate,id,title,awardee,agency,awardeeName,piFirstName,piLastName,coPDPI'

def gen_md (filepath):
    with open(filepath, 'r') as fp:
        data = json.load(fp)
        # print(data)
        for i in data['response']['award']: 
            url = "https://www.nsf.gov/awardsearch/showAward?AWD_ID="+i['id'] 
            with open('plab/plab.hugo/content/research/'+i['id']+'.md','w+') as yml:
                yml.write('---\n')
                yaml.dump(i, yml, allow_unicode=True)
                yml.write('external_url : \''+url+'\'')
                yml.write('\n---')

def myfn():
    # Insert your requests code here
    print('Hello')
    filepath = 'plab/plab.hugo/static/assets/nsf.json'
    nsf_response = requests.get(nsf_data_link)
    # with open('/home/ubuntu/brainlife_lab/brainlife.hugo/themes/brainlife.hugo.theme/static/assets/outputfile.json', 'w') as outf:
    #     json.dump(response.json,outf)        
    # print('written json response')
    pathlib.Path(filepath).write_bytes(nsf_response.content)
    

    xml_resp = requests.get(nih_link)
    filepath_rss = 'plab/plab.hugo/static/assets/pub.xml'
    pathlib.Path(filepath_rss).write_bytes(xml_resp.content)
    gen_md(filepath)


sch = scheduler()
sch.add_job(myfn, 'interval', seconds=10)
sch.start()

# This code will be executed after the sceduler has started
try:
        print('Scheduler started, ctrl-c to exit!')
        while 1:
            # Notice here that if you use "pass" you create an unthrottled loop
            # try uncommenting "pass" vs "input()" and watching your cpu usage.
            # Another alternative would be to use a short sleep: time.sleep(.1)

            pass
            #input()
except KeyboardInterrupt:
        if sch.state:
            sch.shutdown()