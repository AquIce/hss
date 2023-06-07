const { shell, log } = require('../src/hss.js');

shell('vertex a 1')
shell('vertex b 1')
shell('vertex c')
shell('link nand a b c')
shell('update a')
log()