# PESTILLILAB.github.io
https://pestillilab.github.io/

## Editing information

* [Landing page](content/_index.md)
* [Institutions map](data/map.toml)
* [Research/grants](content/research/_index.md)
* [Publications](content/publications/_index.md)
* [Team](content/team/_index.md)

## Editing Research / Grants

### Step 1: Open your research markdown file
Navigate to your markdown file where grants are listed.
[Research/grants](content/research/_index.md)

### Step 2: Locate the "grants" section
In your file, look for the "grants:" section. This is where you will add your new grant.

### Step 3: Add your new grant
Each grant is structured as an item in a list under the "grants:" section. Start a new item by typing a hyphen followed by a space. Then, add the following details for your new grant:

```yaml
- grantor: <name of the institution granting the funds>
  url: <link to the grant if available>
  startDate: <start date of the grant in YYYY-MM-DD format>
  endDate: <end date of the grant in YYYY-MM-DD format>
  investigators: 
  - <name of the primary investigator> , <name of any additional investigators>
  title: |
    <title of the grant>
```
## Editing Publications

### Step 1: Access Your Publications Markdown Document
Navigate to your markdown file where all publications are listed 
[Publications](content/publications/_index.md)

### Step 2: Identify the "Publications" Subsection
Search for the subsection called "publications:". This is the space where you'll place the details of your new publication.

### Step 3: Input the Details of Your New Publication
Within the "publications:" subsection, each publication is listed as an item. To initiate a new item, write a dash (-) followed by a space. After that, include the following details about your new publication:

```yaml
- authors: 
  - <name of the primary investigator>
  - <name of any additional investigators>
  doi: <DOI of the publication>
  journal: <name of the journal>
  publicationDate: <publication date in YYYY-MM-DD format>
  title: <title of the publication>
```

## Editing Team Members

### Step 1: Access Your Team Markdown Document
Navigate to your markdown file where all team members are listed
[Team](content/team/_index.md)

### Step 2: Identify the "Team" amd "People" Subsection
<!-- write tutorial on basis of the team section given below-->
Search for the section called "team:". Inside look for a subsection called "people:". This is the space where you'll place the details of your new team member. Check the "people:" subsection to see if your new team member is already listed.

### Step 3: Input the Details of Your New Team Member
Within the "people:" subsection, each team member is listed as an item. To initiate a new item, write a dash (-) followed by a space. After that, include the following details about your new team member:

```yaml
- name: <name of the team member>
  position: <position of the team member>
  image: <link to the team member's image>
  twitter: <link to the team member's Twitter profile>
  resume: <link to the team member's resume>
  github: <link to the team member's GitHub profile>
  scholar: <link to the team member's Google Scholar profile>
```

## Editing Collaborators 

### Step 1: Access Your Collaborators Markdown Document
Navigate to your markdown file where all collaborators are listed
[Team](content/team/_index.md)

### Step 2: Identify the "Collaborators" amd "People" Subsection
Search for the section called "collaborators:". Inside look for a subsection called "people:". This is the space where you'll place the details of your new collaboratopr. Check the "people:" subsection to see if your new collaborator is already listed.

### Step 3: Input the Details of Your New Collaborator
Within the "people:" subsection, each collaborator is listed as an item. To initiate a new item, write a dash (-) followed by a space. After that, include the following details about your new collaborator:

```yaml
- name: <name of the collaborator>
  position: <position of the collaborator>
  description: <description of the collaborator>  
  image: <link to the collaborator's image>
  twitter: <link to the collaborator's Twitter profile>
  github: <link to the collaborator's GitHub profile>
  scholar: <link to the collaborator's Google Scholar profile>
```

## Editing Alumni

### Step 1: Access Your Alumni Markdown Document
Navigate to your markdown file where all alumni are listed
[Team](content/team/_index.md)

### Step 2: Identify the "Alumni" amd "People" Subsection
Search for the section called "alumni:". Inside look for a subsection called "people:". This is the space where you'll place the details of your new alumni. Check the "people:" subsection to see if your new alumni is already listed.

### Step 3: Input the Details of Your New Alumni
Within the "people:" subsection, each alumni is listed as an item. To initiate a new item, write a dash (-) followed by a space. After that, include the following details about your new alumni:

```yaml
- name: <name of the alumni>
  position: <position of the alumni>
  description: <description of the alumni>  
  image: <link to the alumni's image>
  twitter: <link to the alumni's Twitter profile>
  github: <link to the alumni's GitHub profile>
  scholar: <link to the alumni's Google Scholar profile>
```

## Credits

Theme based on [Radiant](https://github.com/radity/raditian-free-hugo-theme), from [Radity](https://github.com/radity).