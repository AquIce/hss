const { shell, gates } = require('../src/hss.js');

// Create the NOT gate
shell('vertex a 1')
shell('vertex b')
shell('link nand a a b')
shell('assign not a, b')

// Create the AND gate
shell('vertex aa 1')
shell('vertex bb 1')
shell('vertex cc')
shell('vertex dd')
shell('link nand aa bb cc')
shell('link not cc dd')
shell('assign and aa bb, dd')

// Test the AND gate
shell('vertex aaa 1')
shell('vertex bbb 1')
shell('vertex ccc')
shell('link and aaa bbb ccc')
shell('update aaa')
shell('log')
shell('vertices')