import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {JoinAction} from './action'

export const joinCommand = new Command()
	.name('join')
	.alias('joins')
	.description('generate scaffolding for a join model')
	.argument('<names...>', 'the model(s) to generate a join for')
	.action((names) => {
		render(<JoinAction names={names} />)
	})
