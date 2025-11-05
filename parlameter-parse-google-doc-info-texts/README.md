# Scripts for parsing new info texts from a google doc formatted in a specific way

- download the google doc in Markdown format
- run the scripts in order (use node 24):
  - `node 1-split-into-sections.js`
  - `node 2-filter-sections.js`
  - etc.
- after each script check the output folder for any mistakes
- the last step (5) will try to modify the yaml files in the parlameter repo, so make sure to change the path in the file before running it
