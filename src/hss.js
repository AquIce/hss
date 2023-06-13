const fs = require('fs')
const path = require('path')

var test_buffer = []
var infinite_loop = false

class Element {
	
	input_number
	output_number
		
	operation

	ins
	outs

	inputs = []
	outputs = []

	constructor(input_number, output_number, operation, ins=undefined, outs=undefined) {
		this.input_number = input_number
		this.output_number = output_number
		this.operation = operation
		this.ins = ins
		this.outs = outs
	}
	
	run(inputs) {
		this.outputs = this.operation(inputs)
		return this.outputs
	}
}

var Gates = {
	nand: new Element(2, 1, (inputs) => {
		if(inputs[0] && inputs[1]) { return 0; }
		return 1;
	}),
}

var vertices = { }

var gates = {
	'nand': [Gates.nand, 2, 1, false]
}

var links = { }

var hiddens = []

var availabilities = { }

const check_vertex = (vertex) => {
	if(!vertices.hasOwnProperty(vertex)) {
		console.log('ERROR - vertex does not exist')
	}
}

const check_gate = (gate) => {
	if(!gates.hasOwnProperty(gate)) {
		console.log('ERROR - gate does not exist')
	}
}

const auto_create_links_lst = (obj) => {
	if(!links[obj]) {
		links[obj] = []
	}
}

const link = (gate, inputs, outputs) => {
	inputs.forEach(input => {
		check_vertex(input)
		check_gate(gate)
		auto_create_links_lst(input)
		links[input].push(gate)
	})
	outputs.forEach(output => {
		check_vertex(output)
		check_gate(gate)
		auto_create_links_lst(gate)
		links[gate].push(output)
	})
}

const get_back_links = (element) => {
	let backlinks = []
	Object.keys(vertices).forEach(vertex => {
		if(links[vertex]) {
			links[vertex].forEach(link => {
				if(link === element) {
					backlinks.push(vertex)
				}
			})
		}
	})
	Object.keys(gates).forEach(gate => {
		if(links[gate]) {
			links[gate].forEach(link => {
				if(link === element) {
					backlinks.push(gate)
				}
			})
		}
	})
	return backlinks
}

const get_back_linked_vertices = (element) => {
	let backlinks = []
	Object.keys(vertices).forEach(vertex => {
		if(links[vertex]) {
			links[vertex].forEach(link => {
				if(link === element) {
					backlinks.push(vertex)
				}
			})
		}
	})
	return backlinks
}

const lst_to_values = (lst) => {
	let values = []
	lst.forEach(element => {
		values.push(vertices[element])
	})
	return values
}

const upgate = (gate) => {
	if(links[gate]) {
		links[gate].forEach(link => {
			if(link in vertices) {
				update(link)
			}
		})
	}
}

const fragment = (link_list) => {
	let lst = []
	link_list.forEach(link => {
		if(link instanceof Array) { lst = lst.concat(link) }
		else { lst.push(link) }
	})
	return lst
}


const isDoubleList = (list) => {
	return list.length % 2 !== 0 ? false : JSON.stringify(list.slice(0, list.length / 2)) == JSON.stringify(list.slice(list.length / 2))
}

const get_all_material_links = (element, user_called=true) => {
	if(infinite_loop) { return }
	let lst = []
	if(links[element]) {
		links[element].forEach(link => {
			lst.push(link)
			test_buffer.push(link)
			if(isDoubleList(test_buffer)) { infinite_loop = true; return lst }
			lst = lst.concat(get_all_material_links(link, false))
		})
	}
	if(user_called) { return fragment(remove_redundances(lst)) }
	return remove_redundances(lst)
}

const update = (vertex, value=-1) => {
	if(value === -1) { value = vertices[vertex] }
	value = parseInt(value)
	vertices[vertex] = value
	let buffer = vertex
	while(true) {
		if(links[buffer] && links[buffer].length != 0) {
			links[buffer].forEach(link => {
				if(link in gates) {
					vertices[links[link]] = gates[link][0].run(lst_to_values(get_back_linked_vertices(link)))
					upgate(link)
				} else if(link in vertices) {
					update(link)
				}
			})
		}
	}
}

const log = () => {
	console.log(vertices)
	console.log(links)
	console.log(gates)
	console.log(availabilities)
}

const trim_list = (list) => {
	let lst = []
	for (let i = 0; i < list.length; i++) {
		if(list[i]) { lst.push(list[i]) }
	}
	return lst
}

const _in = (element, list) => {
	for(el of list) {
		if(JSON.stringify(el) === JSON.stringify(element)) { return true }
	}
	return false
}

const remove_redundances = (list) => {
	let final = []
	if(list) {
		list.forEach(element => {
			if(!_in(element, final)) { final.push(element) }
		})
	}
	return final
}

const back_availability = (element) => {
	let backlinks = remove_redundances(get_back_links(element))
	if(backlinks) {
		backlinks.forEach(backlink => {
			if(vertices.hasOwnProperty(backlink)) {
				availabilities[backlink] = false
				back_availability(backlink)
			}
		})
	}
}

const forward_availability = (element) => {
	let lnks = remove_redundances(links[element])
	if(lnks) {
		lnks.forEach(lnk => {
			if(vertices.hasOwnProperty(lnk)) {
				availabilities[lnk] = false
				forward_availability(lnk)
			}
		})
	}
}

const get_availabilities = (gate) => {
	back_availability(gate)
	forward_availability(gate)
}

const get_vertices_availabilities = () => {
	Object.keys(vertices).forEach(vertex => {
		availabilities[vertex] = true
	})
	Object.keys(gates).forEach(gate => {
		if(gates[gate][3])
			get_availabilities(gate)
	})
	return availabilities
}

const set_involved_gates_usestate = (element) => {
	if(links[element]) {
		links[element].forEach(link => {
			if(gates[link]) {
				gates[link][3] = true
			}
			set_involved_gates_usestate(link)
		})
	}
}

const get_fres_node = (inp) => {
	let fres_ = {}
	if(links[inp]) {
		links[inp].forEach(link => {
			if(!_in(link, Object.keys(fres_))) {
				fres_[link] = 1
			} else {
				fres_[link]++
			}
		})
	}
	return fres_
}

const get_fres = (ins) => {
	let fres = {}
	ins.forEach(inp => {
		fres[inp] = get_fres_node(inp)
		let buffer = inp
		while(links[buffer] && links[buffer].length != 0) {
			if(links[buffer]) {
				links[buffer].forEach(link => {
					if(!_in(link, Object.keys(fres))) {
						fres[link] = get_fres_node(link)
					}
					buffer = link
				})
			}
		}
	})
	return fres
}

const shell = (text) => {
	get_vertices_availabilities()
	args = text.split(' ')
	if(args[0] === 'vertex') {
		if(args[2]) { vertices[args[1]] = parseInt(args[2]) }
		else { vertices[args[1]] = 0 }
	} else if(args[0] === 'link') {
		if(args.length == 2 + gates[args[1]][1] + gates[args[1]][2]) {
			buffer = args[1]
			while(links[args[1]] && links[args[1]].length > 0) { args[1] += '_' }
			gates[args[1]] = Object.assign({}, gates[buffer])
			link(args[1], args.slice(2, 2 + gates[args[1]][1]), args.slice(2 + gates[args[1]][1]))
		}
	} else if(args[0] === 'update') {
		update(args[1], args[2])
	} else if(args[0] === 'eval') {
		args = args.slice(1)
		args.forEach(arg => {
			console.log('[' + arg + '] ' + vertices[arg])
		})
	} else if(args[0] === 'log') {
		log()
	} else if(args[0] == 'assign') {
		const argstr = args.slice(2).join(' ')
		const inouts = argstr.split(',')
		const ins = trim_list(inouts[0].split(' '))
		const outs = trim_list(inouts[1].split(' '))
		
		Gates[args[1]] = new Element(ins.length, outs.length, (inputs) => {
			for(let i = 0; i < inputs.length; i++) {
				vertices[ins[i]] = inputs[i]
			}
			update(ins[0])
			ots = []
			outs.forEach(out => {
				ots.push(vertices[out])
			})
			return ots.length == 1 ? ots[0] : ots
		}, ins, outs)

		let datas = JSON.stringify(get_fres(ins), null, 4)
		let folderName = path.join(__dirname, 'components')
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName);
		}
		let fname = folderName + '/' + args[1].toUpperCase() + '.json'

		if(!fs.existsSync(fname)) {
			fs.appendFileSync(fname, '{}')
		}
		fs.writeFileSync(fname, datas)

		gates[args[1]] = [Gates[args[1]], ins.length, outs.length, false]
		ins.forEach(set_involved_gates_usestate)
	} else if(args[0] === 'vertices') {
		Object.keys(availabilities).forEach(vertex_name => {
			if(!_in(vertex_name, hiddens) && (availabilities[vertex_name] || args[1] == 'all')) {
				console.log('Vertex:', vertex_name)
				console.log('Value:', vertices[vertex_name])
				if(args[1] == 'all') { console.log('Available:', availabilities[vertex_name] ? 'Yes' : 'No') }
				console.log()
			}
		})
	} else if(args[0] === 'hide') {
		Object.keys(vertices).forEach(vertex => {
			if(vertex == args[1]) { hiddens.push(args[1]) }
		})
	}
}

const fileLoad = (file) => {
	let fileName = path.join(__dirname, file)
	let data = fs.readFileSync(fileName, 'utf8')
	let lines = data.split('\n')
	lines.forEach(line => {
		let ln = line.trim()
		if(ln && !ln.startsWith('/')) {
			shell(ln)
		}
	})
}

module.exports = {
	shell,
	fileLoad,
	get_all_material_links
}