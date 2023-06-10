const fs = require('fs')

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

Gates = {
	nand: new Element(2, 1, (inputs) => {
		if(inputs[0] && inputs[1]) { return 0; }
		return 1;
	}),
}

vertices = { }

gates = {
	'nand': [Gates.nand, 2, 1, false]
}

links = { }

vertices_availabilities = { }

hiddens = []

check_vertex = (vertex) => {
	if(!vertices.hasOwnProperty(vertex)) {
		console.log('ERROR - vertex does not exist')
	}
}

check_gate = (gate) => {
	if(!gates.hasOwnProperty(gate)) {
		console.log('ERROR - gate does not exist')
	}
}

auto_create_links_lst = (obj) => {
	if(!links[obj]) {
		links[obj] = []
	}
}

link = (gate, inputs, outputs) => {
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

get_back_links = (element) => {
	backlinks = []
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

get_back_linked_vertices = (element) => {
	backlinks = []
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

lst_to_values = (lst) => {
	values = []
	lst.forEach(element => {
		values.push(vertices[element])
	})
	return values
}

upgate = (gate) => {
	if(links[gate]) {
		links[gate].forEach(link => {
			if(link in vertices) {
				update(link)
			}
		})
	}
}

update = (vertex, value=-1) => {
	if(value === -1) { value = vertices[vertex] }
	value = parseInt(value)
	vertices[vertex] = value
	if(links[vertex]) {
		links[vertex].forEach(link => {
			if(link in gates) {
				vertices[links[link]] = gates[link][0].run(lst_to_values(get_back_linked_vertices(link)))
				upgate(link)
			} else if(link in vertices) {
				update(link)
			}
		})
	}
}

log = () => {
	console.log(vertices)
	console.log(links)
	console.log(gates)
	console.log(vertices_availabilities)
}

trim_list = (list) => {
	let lst = []
	for (let i = 0; i < list.length; i++) {
		if(list[i]) { lst.push(list[i]) }
	}
	return lst
}

_in = (element, list) => {
	for(el of list) {
		if(JSON.stringify(el) === JSON.stringify(element)) { return true }
	}
	return false
}

vertex_in_gate = (vertex, gate) => {
	if(!gate.ins || !gate.outs) { return false }
	return _in(vertex, gate.ins) || _in(vertex, gate.outs)
}

remove_redundances = (list) => {
	let final = []
	if(list) {
		list.forEach(element => {
			if(!_in(element, final)) { final.push(element) }
		})
	}
	return final
}

back_availability = (element) => {
	backlinks = remove_redundances(get_back_links(element))
	if(backlinks) {
		backlinks.forEach(backlink => {
			if(vertices.hasOwnProperty(backlink)) {
				availabilities[backlink] = false
				back_availability(backlink)
			}
		})
	}
}

forward_availability = (element) => {
	lnks = remove_redundances(links[element])
	if(lnks) {
		lnks.forEach(lnk => {
			if(vertices.hasOwnProperty(lnk)) {
				availabilities[lnk] = false
				forward_availability(lnk)
			}
		})
	}
}

get_availabilities = (gate) => {
	back_availability(gate)
	forward_availability(gate)
}

get_vertices_availabilities = () => {
	availabilities = {};
	Object.keys(vertices).forEach(vertex => {
		availabilities[vertex] = true
	})
	Object.keys(gates).forEach(gate => {
		if(gates[gate][3])
			get_availabilities(gate)
	})
	return availabilities
}

set_involved_gates_usestate = (element) => {
	if(links[element]) {
		links[element].forEach(link => {
			if(gates[link]) {
				gates[link][3] = true
			}
			set_involved_gates_usestate(link)
		})
	}
}

get_fres_node = (inp) => {
	let fres_ = ''
	if(links[inp]) {
		links[inp].forEach(link => {
			if(gates[link]) {
				let buffer = ''
				get_back_linked_vertices(link).forEach(backlink => {
					buffer += backlink + ' '
				})
				let bufferPrime = ''
				links[link].forEach(lnk => {
					bufferPrime += lnk + ' '
				})
				fres_ += 'link ' + link + ' '  + buffer.slice(0, buffer.length - 3) + ', ' + bufferPrime.slice(0, bufferPrime.length - 1) + '\n'
			} else if(vertices[link]) {
				fres_ += 'link ' + link + ' ' + inp + '\n'
			}
			fres_ += get_fres_node(link)
		})
	}
	return fres_
}

get_fres = (ins) => {
	let fres = ''
	ins.forEach(inp => {
		fres += 'vertex ' + inp + '\n'
	})
	ins.forEach(inp => {
		fres += get_fres_node(inp)
	})
	return fres
}

shell = text => {
	vertices_availabilities = get_vertices_availabilities()
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

		// Add in file
		let fres = get_fres(ins)
		console.log(fres)

		gates[args[1]] = [Gates[args[1]], ins.length, outs.length, false]
		ins.forEach(set_involved_gates_usestate)
	} else if(args[0] === 'vertices') {
		Object.keys(vertices_availabilities).forEach(vertex_name => {
			if(!_in(vertex_name, hiddens) && (vertices_availabilities[vertex_name] || args[1] == 'all')) {
				console.log('Vertex:', vertex_name)
				console.log('Value:', vertices[vertex_name])
				if(args[1] == 'all') { console.log('Available:', vertices_availabilities[vertex_name] ? 'Yes' : 'No') }
				console.log()
			}
		})
	} else if(args[0] === 'hide') {
		Object.keys(vertices).forEach(vertex => {
			if(vertex == args[1]) { hiddens.push(args[1]) }
		})
	}
}

module.exports = {
	shell,
}