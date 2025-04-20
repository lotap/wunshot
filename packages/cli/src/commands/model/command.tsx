import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {ModelAction} from './action'

export const modelCommand = new Command()
	.name('model')
	.alias('models')
	.description('generate scaffolding for a model')
	.argument('<names...>', 'the model(s) to generate')
	.action((names) => {
		render(<ModelAction names={names} />)
	})
