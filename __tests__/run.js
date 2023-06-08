const { shell } = require('../src/hss.js');

shell('vertex a 1')
shell('vertex b')
shell('vertex c')
shell('link nand a a b')
shell('update a')
// shell('eval a b c')
shell('assign not a, b')
// shell('log')
shell('vertices')