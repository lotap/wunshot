import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {OpAction} from './action'

export const opCommand = new Command()
	.name('op')
	.alias('ops')
	.description('generate scaffolding for an op')
	.argument('<names...>', 'the op(s) to generate')
	.action((names) => {
		render(<OpAction names={names} />)
	})
