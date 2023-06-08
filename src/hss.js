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
	'nand': [Gates.nand, 2, 1]
}

links = { }

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

update = (vertex, value=-1) => {
	if(value === -1) { value = vertices[vertex] }
	value = parseInt(value)
	vertices[vertex] = value
	if(links[vertex]) {
		links[vertex].forEach(link => {
			if(link in gates) {
				vertices[links[link]] = gates[link][0].run(lst_to_values(get_back_linked_vertices(link)))
			}
		})
	}
}

trim_list = (list) => {
	let lst = []
	for (let i = 0; i < list.length; i++) {
		if(list[i]) { lst.push(list[i]) }
	}
	return lst
}

print_links = (element) => {
	plinks = []
	if(links[element]) {
		links[element].forEach(link => {
			plinks.push([element, link])
			plinks = plinks.concat(print_links(link))
		})
	}
	return plinks
}

shell = text => {
	args = text.split(' ')
	if(args[0] === 'vertex') {
		vertices[args[1]] = parseInt(args[2]) ?? 0
	} else if(args[0] === 'link') {
		if(args.length == 2 + gates[args[1]][1] + gates[args[1]][2]) {
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

		// ins.forEach(inp => console.log(print_links(inp)))
		
		Gates[args[1]] = new Element(ins.length, outs.length, (inputs) => {
			for(let i = 0; i < inputs.length; i++) {
				vertices[ins[i]] = inputs[i]
			}
			update(ins[0])
			ots = []
			outs.forEach(out => {
				ots.push(vertices[out])
			})
			return ots
		}, ins, outs)

		gates[args[1]] = Gates[args[1]]
	}
}

log = () => {
	console.log(vertices)
	console.log(links)
	console.log(gates)
}

module.exports = {
	shell,
}